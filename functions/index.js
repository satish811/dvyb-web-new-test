// functions/index.js — Production-Grade Razorpay + Shiprocket Cloud Functions

import * as functions from "firebase-functions";
import { onCall } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import Razorpay from "razorpay";
import crypto from "crypto";
import { defineSecret } from "firebase-functions/params";
import shiprocketService from "./shiprocketService.js";

admin.initializeApp();

const razorpayKeyId = defineSecret("RZP_KEY_ID");
const razorpayKeySecret = defineSecret("RZP_KEY_SECRET");

// ==================== HELPER: Server-Side Price Calculation ====================

/**
 * Fetches product prices from Firestore and calculates the true total.
 * NEVER trust prices sent from the client.
 *
 * @param {Array} cartItems - Array of { productId, quantity, size, color }
 * @returns {{ subtotal: number, tax: number, total: number, verifiedItems: Array }}
 */
async function calculateServerSideTotal(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "Cart is empty");
  }

  const db = admin.firestore();
  const verifiedItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    if (!item.productId || !item.quantity || item.quantity < 1) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Invalid cart item: ${JSON.stringify(item)}`
      );
    }

    // Products are stored under vendor sub-collections: users/{vendorId}/products/{productId}
    // Use collectionGroup to search across all vendor sub-collections
    const productsQuery = db.collectionGroup("products");
    const querySnapshot = await productsQuery.get();

    let productData = null;
    for (const doc of querySnapshot.docs) {
      if (doc.id === item.productId) {
        productData = doc.data();
        break;
      }
    }

    if (!productData) {
      throw new functions.https.HttpsError(
        "not-found",
        `Product not found: ${item.productId}`
      );
    }

    // Parse price — handle both numeric and string formats (e.g. "₹1,499")
    let serverPrice = 0;
    if (typeof productData.price === "number") {
      serverPrice = productData.price;
    } else if (typeof productData.price === "string") {
      serverPrice = parseFloat(productData.price.replace(/[^0-9.]/g, "")) || 0;
    }

    if (serverPrice <= 0) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid price for product: ${item.productId}`
      );
    }

    const itemTotal = serverPrice * item.quantity;
    subtotal += itemTotal;

    verifiedItems.push({
      productId: item.productId,
      name: productData.name || productData.title || "Product",
      price: serverPrice,
      quantity: item.quantity,
      size: item.size || "M",
      color: item.color || "Default",
      image: productData.imageUrls?.[0] || productData.images?.[0] || "",
      subtotal: itemTotal,
    });
  }

  const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
  const total = Math.round((subtotal + tax) * 100) / 100;

  return { subtotal, tax, total, verifiedItems };
}


// ==================== RAZORPAY: Create Order ====================

export const createRazorpayOrder = onCall(
  { secrets: [razorpayKeyId, razorpayKeySecret], cors: true },
  async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in required");
    }

    try {
      const { cartItems, shippingFee = 0 } = request.data;

      console.log("=== createRazorpayOrder ===");
      console.log("User:", request.auth.uid);
      console.log("Cart items:", cartItems?.length);

      // SERVER-SIDE PRICE CALCULATION — never trust client amounts
      const { subtotal, tax, total, verifiedItems } =
        await calculateServerSideTotal(cartItems);

      const finalTotal = total + (Number(shippingFee) || 0);

      console.log("Server-calculated total:", finalTotal);

      const key = razorpayKeyId.value();
      const secret = razorpayKeySecret.value();

      if (!key || !secret) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Razorpay credentials not configured"
        );
      }

      const razorpay = new Razorpay({ key_id: key, key_secret: secret });

      const amountInPaise = Math.round(finalTotal * 100);

      // Create idempotency-safe receipt using user ID + timestamp
      const receipt = `rcpt_${request.auth.uid.substring(0, 8)}_${Date.now()}`;

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          userId: request.auth.uid,
          itemCount: verifiedItems.length,
        },
      });

      console.log("Razorpay order created:", order.id, "Amount:", amountInPaise);

      // Store the pending order details so we can verify later
      await admin
        .firestore()
        .collection("pending_orders")
        .doc(order.id)
        .set({
          razorpayOrderId: order.id,
          userId: request.auth.uid,
          verifiedItems,
          subtotal,
          tax,
          shippingFee: Number(shippingFee) || 0,
          total: finalTotal,
          amountInPaise,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "pending",
        });

      return {
        success: true,
        order,
        serverTotal: finalTotal,
        breakdown: { subtotal, tax, shippingFee: Number(shippingFee) || 0 },
      };
    } catch (err) {
      console.error("createRazorpayOrder error:", err);
      if (err instanceof functions.https.HttpsError) throw err;
      throw new functions.https.HttpsError(
        "internal",
        err.message || "Failed to create order"
      );
    }
  }
);

// ==================== RAZORPAY: Verify Payment & Create Order ====================

export const verifyRazorpayPayment = onCall(
  { secrets: [razorpayKeySecret], cors: true },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in required");
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shipping,
      email,
      paymentMethod,
    } = request.data;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing payment data"
      );
    }

    const secret = razorpayKeySecret.value();
    if (!secret) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Razorpay secret not configured"
      );
    }

    // 1. Verify signature
    const generated = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated !== razorpay_signature) {
      console.error("Signature mismatch for order:", razorpay_order_id);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Payment verification failed — invalid signature"
      );
    }

    const db = admin.firestore();

    // 2. Retrieve the pending order (server-side prices)
    const pendingDoc = await db
      .collection("pending_orders")
      .doc(razorpay_order_id)
      .get();

    if (!pendingDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Pending order not found. Payment may have already been processed."
      );
    }

    const pendingData = pendingDoc.data();

    // Verify this payment belongs to the authenticated user
    if (pendingData.userId !== request.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Order does not belong to this user"
      );
    }

    // Prevent duplicate processing
    if (pendingData.status === "completed") {
      console.log("Order already processed:", razorpay_order_id);
      return {
        success: true,
        orderId: pendingData.completedOrderId,
        message: "Order was already processed",
      };
    }

    // 3. Determine user collection (B2C or B2B)
    let userCollection = "b2c_users";
    try {
      const b2bDoc = await db.collection("B2BBulkOrders_users").doc(request.auth.uid).get();
      if (b2bDoc.exists) {
        userCollection = "B2BBulkOrders_users";
      }
    } catch (e) {
      // Default to b2c
    }

    // 4. Create order atomically (order + clear cart)
    const userPrefix = request.auth.uid.substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const orderId = `ORD-${userPrefix}-${timestamp}`;

    const batch = db.batch();

    // Create order document
    const orderRef = db
      .collection(userCollection)
      .doc(request.auth.uid)
      .collection("orders")
      .doc(orderId);

    batch.set(orderRef, {
      orderId,
      userId: request.auth.uid,
      userRole: userCollection === "B2BBulkOrders_users" ? "B2B" : "B2C",
      status: "Active",
      date: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      products: pendingData.verifiedItems,
      shipping: shipping || {},
      email: email || "",
      paymentMethod: paymentMethod || "online",
      amount: pendingData.total,
      subtotal: pendingData.subtotal,
      tax: pendingData.tax,
      shippingFee: pendingData.shippingFee,
      payment: {
        provider: "razorpay",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amountPaid: pendingData.amountInPaise / 100,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    // Clear cart items
    const cartSnapshot = await db
      .collection(userCollection)
      .doc(request.auth.uid)
      .collection("cart")
      .get();

    cartSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Mark pending order as completed (idempotency)
    const pendingRef = db.collection("pending_orders").doc(razorpay_order_id);
    batch.update(pendingRef, {
      status: "completed",
      completedOrderId: orderId,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    console.log("✅ Order created and cart cleared:", orderId);
    return { success: true, orderId };
  }
);

// ==================== SHIPROCKET INTEGRATION ====================

export const getShippingRates = onCall({ cors: true }, async (request) => {
  try {
    const { deliveryPostcode, weight, cod, declaredValue, pickupPostcode } =
      request.data;

    if (!deliveryPostcode) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Delivery postcode is required"
      );
    }

    const result = await shiprocketService.getShippingRates({
      pickupPostcode: pickupPostcode || "110001",
      deliveryPostcode,
      weight: weight || 0.5,
      cod: cod || false,
      declaredValue: declaredValue || 1000,
    });

    if (!result.success) {
      throw new functions.https.HttpsError("internal", result.error);
    }

    return result;
  } catch (error) {
    console.error("getShippingRates error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const createShiprocketOrder = onCall({ cors: true }, async (request) => {
  try {
    const data = request.data;
    console.log("📦 Creating Shiprocket order:", data.orderId);

    const orderResult = await shiprocketService.createOrder(data);

    if (!orderResult.success) {
      throw new functions.https.HttpsError("internal", orderResult.error);
    }

    if (orderResult.isTestOrder) {
      console.log("🧪 TEST ORDER created — no real shipment");
    } else {
      console.log("✅ Shiprocket order:", orderResult.data.order_id);
    }

    if (
      data.courierId &&
      orderResult.data.shipment_id &&
      !orderResult.isTestOrder
    ) {
      const assignResult = await shiprocketService.assignCourier(
        orderResult.data.shipment_id,
        data.courierId
      );
      return { ...orderResult, courierAssignment: assignResult };
    }

    return orderResult;
  } catch (error) {
    console.error("createShiprocketOrder error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const trackShipment = onCall({ cors: true }, async (request) => {
  try {
    const { shipmentId } = request.data;

    if (!shipmentId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Shipment ID is required"
      );
    }

    if (shipmentId.startsWith("TEST-")) {
      return {
        success: true,
        isTestOrder: true,
        data: {
          status: "TEST",
          message: "Test shipment — tracking not available",
        },
      };
    }

    const result = await shiprocketService.trackShipment(shipmentId);

    if (!result.success) {
      throw new functions.https.HttpsError("internal", result.error);
    }

    return result;
  } catch (error) {
    console.error("trackShipment error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

export const shiprocketWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const webhookData = req.body;
    console.log("📬 Shiprocket webhook:", JSON.stringify(webhookData));

    if (webhookData.order_id && webhookData.current_status) {
      console.log(
        `📝 Order ${webhookData.order_id} status: ${webhookData.current_status}`
      );
      res
        .status(200)
        .json({ success: true, message: "Webhook processed" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid webhook data" });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export const cancelShipment = onCall({ cors: true }, async (request) => {
  try {
    const { orderIds } = request.data;

    if (!orderIds) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Order IDs are required"
      );
    }

    if (
      Array.isArray(orderIds) &&
      orderIds.some((id) => id.startsWith("TEST-"))
    ) {
      return {
        success: true,
        isTestOrder: true,
        message: "Test order cancellation — no action needed",
      };
    }

    const result = await shiprocketService.cancelShipment(orderIds);

    if (!result.success) {
      throw new functions.https.HttpsError("internal", result.error);
    }

    return result;
  } catch (error) {
    console.error("cancelShipment error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
