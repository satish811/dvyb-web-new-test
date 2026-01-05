// // functions/index.js

// /* global process */

// import * as functions from "firebase-functions";
// import admin from "firebase-admin";
// // import corsLib from "cors";
// import Razorpay from "razorpay";
// import crypto from "crypto";
// import dotenv from "dotenv";
// dotenv.config();

// // const razorpayKey = process.env.RAZORPAY_KEY_ID;
// // const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

// admin.initializeApp();

// // const cors = corsLib({ origin: true });

// /**
//  * createRazorpayOrder - Called from frontend to get an order object
//  * data: { amount }   // amount in rupees (e.g. 499.99)
//  */

// // eslint-disable-next-line no-undef
// // const razorpayKey = process.env.RAZORPAY_KEY_ID;
// // const razorpaySecretKey=process.env.RAZORPAY_KEY_SECRET
// const razorpayKey = functions.config().razorpay.key_id;
// const razorpaySecretKey = functions.config().razorpay.key_secret;

// export const createRazorpayOrder = functions.https.onCall(async (data) => {
//   try {
//     console.log(data,"dataaa")
//     if (!data.amount || isNaN(data.amount)) {
//       throw new functions.https.HttpsError("invalid-argument", "Amount must be a valid number");
//     }

//     const razorpay = new Razorpay({
//       key_id: razorpayKey,
//       key_secret: razorpaySecretKey,
//     });

//     const order = await razorpay.orders.create({
//       amount: data.amount * 100,
//       currency: "INR",
//       receipt: `order_rcptid_${Date.now()}`,
//     });

//     return { success: true, order };
//   } catch (err) {
//     console.error("Razorpay order creation failed:", err);
//     throw new functions.https.HttpsError("internal", err.message);
//   }
// });

// /**
//  * verifyRazorpayPayment - Called after successful checkout to verify signature + persist order
//  * data: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData }
//  */
// export const verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
//   if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Sign in required");

//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = data;
//   if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//     throw new functions.https.HttpsError("invalid-argument", "Missing payment data");
//   }

//   // Verify signature using process.env
//   const generated = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//     .digest("hex");

//   if (generated !== razorpay_signature) {
//     throw new functions.https.HttpsError("invalid-argument", "Invalid signature");
//   }

//   // Save to Firestore
//   try {
//     const ordersRef = admin.firestore().collection("orders");
//     const docRef = ordersRef.doc();
//     const payload = {
//       userId: context.auth.uid,
//       payment: {
//         provider: "razorpay",
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature,
//       },
//       orderData,
//       status: "paid",
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//     };
//     await docRef.set(payload);
//     return { success: true, orderId: docRef.id };
//   } catch (err) {
//     throw new functions.https.HttpsError("internal", err.message);
//   }
// });

// import * as functions from "firebase-functions";
// import admin from "firebase-admin";
// import Razorpay from "razorpay";
// import crypto from "crypto";

// admin.initializeApp();

// // Get Razorpay credentials from Firebase config
// const razorpayKey = functions.config().razorpay?.key_id;
// const razorpaySecret = functions.config().razorpay?.key_secret;

// export const createRazorpayOrder = functions.https.onCall(async (data) => {
//   try {
//     console.log("Received data:", data);

//     // Validate credentials first
//     if (!razorpayKey || !razorpaySecret) {
//       console.error("Razorpay credentials not configured");
//       throw new functions.https.HttpsError(
//         "failed-precondition",
//         "Razorpay credentials not configured. Run: firebase functions:config:set razorpay.key_id='YOUR_KEY' razorpay.key_secret='YOUR_SECRET'"
//       );
//     }

//     if (!data.amount || isNaN(data.amount)) {
//       throw new functions.https.HttpsError("invalid-argument", "Amount must be a valid number");
//     }

//     const razorpay = new Razorpay({
//       key_id: razorpayKey,
//       key_secret: razorpaySecret,
//     });

//     const order = await razorpay.orders.create({
//       amount: Math.round(data.amount * 100), // Convert to paise and ensure integer
//       currency: "INR",
//       receipt: `order_rcptid_${Date.now()}`,
//     });

//     console.log("Order created successfully:", order.id);
//     return { success: true, order };
//   } catch (err) {
//     console.error("Razorpay order creation failed:", err);
//     throw new functions.https.HttpsError("internal", err.message || "Failed to create order");
//   }
// });

// export const verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
//   if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Sign in required");

//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = data;
//   if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//     throw new functions.https.HttpsError("invalid-argument", "Missing payment data");
//   }

//   // FIXED: Use functions.config() consistently
//   if (!razorpaySecret) {
//     throw new functions.https.HttpsError("failed-precondition", "Razorpay secret not configured");
//   }

//   // Verify signature
//   const generated = crypto
//     .createHmac("sha256", razorpaySecret)
//     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//     .digest("hex");

//   if (generated !== razorpay_signature) {
//     console.error("Signature mismatch");
//     throw new functions.https.HttpsError("invalid-argument", "Invalid signature");
//   }

//   // Save to Firestore
//   try {
//     const ordersRef = admin.firestore().collection("orders");
//     const docRef = ordersRef.doc();
//     const payload = {
//       userId: context.auth.uid,
//       payment: {
//         provider: "razorpay",
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature,
//       },
//       orderData,
//       status: "paid",
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//     };
//     await docRef.set(payload);
//     console.log("Order saved to Firestore:", docRef.id);
//     return { success: true, orderId: docRef.id };
//   } catch (err) {
//     console.error("Firestore error:", err);
//     throw new functions.https.HttpsError("internal", err.message);
//   }
// });

import * as functions from "firebase-functions";
import { onCall } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import Razorpay from "razorpay";
import crypto from "crypto";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();

// Use different names to avoid conflict
const razorpayKeyId = defineSecret("RZP_KEY_ID");
const razorpayKeySecret = defineSecret("RZP_KEY_SECRET");

export const createRazorpayOrder = onCall(
  { secrets: [razorpayKeyId, razorpayKeySecret], cors: true },
  async (request) => {
    try {
      const { amount } = request.data;

      console.log("=== Function Called ===");
      console.log("Received amount:", amount);

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        console.error("Invalid amount:", amount);
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Amount must be a valid positive number"
        );
      }

      const key = razorpayKeyId.value();
      const secret = razorpayKeySecret.value();

      if (!key || !secret) {
        console.error("Razorpay credentials not configured");
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Razorpay credentials not configured"
        );
      }

      const razorpay = new Razorpay({
        key_id: key,
        key_secret: secret,
      });

      const amountInPaise = Math.round(Number(amount) * 100);
      console.log("Creating order with amount in paise:", amountInPaise);

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `order_rcptid_${Date.now()}`,
      });

      console.log("Order created successfully:", order.id);
      return { success: true, order };
    } catch (err) {
      console.error("=== ERROR ===");
      console.error("Error:", err);
      throw new functions.https.HttpsError("internal", err.message || "Failed to create order");
    }
  }
);

export const verifyRazorpayPayment = onCall({ secrets: [razorpayKeySecret], cors: true }, async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required");
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = request.data;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new functions.https.HttpsError("invalid-argument", "Missing payment data");
  }

  const secret = razorpayKeySecret.value();
  if (!secret) {
    throw new functions.https.HttpsError("failed-precondition", "Razorpay secret not configured");
  }

  const generated = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated !== razorpay_signature) {
    console.error("Signature mismatch");
    throw new functions.https.HttpsError("invalid-argument", "Invalid signature");
  }

  try {
    const ordersRef = admin
      .firestore()
      .collection("b2c_users")
      .doc(request.auth.uid)
      .collection("orders");

    const docRef = ordersRef.doc();
    const payload = {
      userId: request.auth.uid,
      payment: {
        provider: "razorpay",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      orderData,
      status: "paid",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await docRef.set(payload);
    console.log("Order saved:", docRef.id);
    return { success: true, orderId: docRef.id };
  } catch (err) {
    console.error("Firestore error:", err);
    throw new functions.https.HttpsError("internal", err.message);
  }
});

// ==================== SHIPROCKET  INTEGRATION ====================

import shiprocketService from './shiprocketService.js';

// Get shipping rates
export const getShippingRates = onCall({ cors: true }, async (request) => {
  try {
    const { deliveryPostcode, weight, cod, declaredValue, pickupPostcode } = request.data;

    if (!deliveryPostcode) {
      throw new functions.https.HttpsError('invalid-argument', 'Delivery postcode is required');
    }

    console.log('📦 Fetching shipping rates for:', deliveryPostcode);

    const result = await shiprocketService.getShippingRates({
      pickupPostcode: pickupPostcode || "110001",
      deliveryPostcode,
      weight: weight || 0.5,
      cod: cod || false,
      declaredValue: declaredValue || 1000
    });

    if (!result.success) {
      throw new functions.https.HttpsError('internal', result.error);
    }

    console.log('✅ Shipping rates fetched successfully');
    return result;
  } catch (error) {
    console.error('❌ Get shipping rates error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Create Shiprocket order
export const createShiprocketOrder = onCall({ cors: true }, async (request) => {
  try {
    const data = request.data;
    
    console.log('📦 Creating Shiprocket order:', data.orderId);
    console.log('🔍 Payment method:', data.paymentMethod);
    console.log('🔍 Razorpay Order ID:', data.razorpayOrderId);

    const orderResult = await shiprocketService.createOrder(data);

    if (!orderResult.success) {
      throw new functions.https.HttpsError('internal', orderResult.error);
    }

    // Log if test order
    if (orderResult.isTestOrder) {
      console.log('🧪 TEST ORDER created - No real shipment');
    } else {
      console.log('✅ REAL Shiprocket order created:', orderResult.data.order_id);
    }

    // Auto-assign courier if courier_id is provided and not test order
    if (data.courierId && orderResult.data.shipment_id && !orderResult.isTestOrder) {
      console.log('🚚 Assigning courier:', data.courierId);
      const assignResult = await shiprocketService.assignCourier(
        orderResult.data.shipment_id,
        data.courierId
      );
      
      return {
        ...orderResult,
        courierAssignment: assignResult
      };
    }

    return orderResult;
  } catch (error) {
    console.error('❌ Create Shiprocket order error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Track shipment
export const trackShipment = onCall({ cors: true }, async (request) => {
  try {
    const { shipmentId } = request.data;

    if (!shipmentId) {
      throw new functions.https.HttpsError('invalid-argument', 'Shipment ID is required');
    }

    // Don't track test shipments
    if (shipmentId.startsWith('TEST-')) {
      return {
        success: true,
        isTestOrder: true,
        data: {
          status: 'TEST',
          message: 'Test shipment - tracking not available'
        }
      };
    }

    console.log('📍 Tracking shipment:', shipmentId);

    const result = await shiprocketService.trackShipment(shipmentId);

    if (!result.success) {
      throw new functions.https.HttpsError('internal', result.error);
    }

    console.log('✅ Tracking data retrieved');
    return result;
  } catch (error) {
    console.error('❌ Track shipment error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Shiprocket webhook handler
export const shiprocketWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('📬 Shiprocket webhook received:', JSON.stringify(webhookData));

    // Update order status in Firestore based on webhook data
    if (webhookData.order_id && webhookData.current_status) {
      // TODO: Implement order update logic
      // Find the order by shiprocketOrderId and update its status
      
      console.log(`📝 Order ${webhookData.order_id} status: ${webhookData.current_status}`);
      
      res.status(200).json({ success: true, message: 'Webhook processed' });
    } else {
      console.error('❌ Invalid webhook data');
      res.status(400).json({ success: false, message: 'Invalid webhook data' });
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel shipment
export const cancelShipment = onCall({ cors: true }, async (request) => {
  try {
    const { orderIds } = request.data;

    if (!orderIds) {
      throw new functions.https.HttpsError('invalid-argument', 'Order IDs are required');
    }

    // Don't cancel test orders
    if (Array.isArray(orderIds) && orderIds.some(id => id.startsWith('TEST-'))) {
      return {
        success: true,
        isTestOrder: true,
        message: 'Test order cancellation - no action needed'
      };
    }

    console.log('🚫 Cancelling shipment:', orderIds);

    const result = await shiprocketService.cancelShipment(orderIds);

    if (!result.success) {
      throw new functions.https.HttpsError('internal', result.error);
    }

    console.log('✅ Shipment cancelled');
    return result;
  } catch (error) {
    console.error('❌ Cancel shipment error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

