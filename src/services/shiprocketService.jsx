import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebaseConfig";

class ShiprocketFrontendService {
  // Get shipping rates
  async getShippingRates(deliveryPostcode, cartItems, isCOD = false) {
    try {
      // Calculate total weight (assuming 0.5kg per item, adjust as needed)
      const totalWeight = cartItems.reduce((sum, item) => {
        const itemWeight = item.weight || 0.5;
        return sum + (itemWeight * (item.quantity || 1));
      }, 0);

      // Calculate total value
      const totalValue = cartItems.reduce((sum, item) => {
        return sum + ((item.price || 0) * (item.quantity || 1));
      }, 0);

      console.log('📦 Requesting shipping rates:', {
        postcode: deliveryPostcode,
        weight: totalWeight,
        value: totalValue,
        isCOD
      });

      const getShippingRatesFunc = httpsCallable(functions, "getShippingRates");
      const result = await getShippingRatesFunc({
        deliveryPostcode: deliveryPostcode.toString(),
        weight: totalWeight || 0.5,
        cod: isCOD,
        declaredValue: totalValue || 1000,
        pickupPostcode: "110001" // Your warehouse pincode
      });

      console.log('✅ Shipping rates received:', result.data);
      return result.data;
    } catch (error) {
      console.error("❌ Error fetching shipping rates:", error);
      throw error;
    }
  }

  // Create Shiprocket order
  async createOrder(orderData) {
    try {
      console.log('📦 Creating Shiprocket order...', orderData.orderId);

      const createOrderFunc = httpsCallable(functions, "createShiprocketOrder");
      const result = await createOrderFunc({
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId,
        paymentId: orderData.razorpayPaymentId,
        billingName: orderData.shipping.firstName,
        billingLastName: orderData.shipping.lastName,
        billingAddress: orderData.shipping.streetAddress,
        billingAddress2: "",
        billingCity: orderData.shipping.city,
        billingPincode: orderData.shipping.postalCode,
        billingState: orderData.shipping.state,
        billingCountry: orderData.shipping.country || "India",
        billingEmail: orderData.email,
        billingPhone: orderData.shipping.phone,
        items: orderData.products.map(item => ({
          name: item.name,
          productId: item.productId || item.id,
          sku: item.productId || item.id,
          quantity: item.quantity || 1,
          price: item.price || 0,
          discount: 0,
          tax: 0
        })),
        paymentMethod: orderData.paymentMethod,
        shippingCharges: orderData.shippingFee || 0,
        totalDiscount: orderData.discount || 0,
        subTotal: orderData.amount,
        weight: orderData.weight || 0.5,
        length: 10,
        breadth: 10,
        height: 10,
        courierId: orderData.courierId
      });

      if (result.data.isTestOrder) {
        console.log('🧪 TEST ORDER - Mock data created');
      } else {
        console.log('✅ REAL Shiprocket order created');
      }

      return result.data;
    } catch (error) {
      console.error("❌ Error creating Shiprocket order:", error);
      throw error;
    }
  }

  // Track shipment
  async trackShipment(shipmentId) {
    try {
      console.log('📍 Tracking shipment:', shipmentId);
      
      const trackShipmentFunc = httpsCallable(functions, "trackShipment");
      const result = await trackShipmentFunc({ shipmentId });
      
      console.log('✅ Tracking data retrieved');
      return result.data;
    } catch (error) {
      console.error("❌ Error tracking shipment:", error);
      throw error;
    }
  }

  // Cancel shipment
  async cancelShipment(orderIds) {
    try {
      console.log('🚫 Cancelling shipment:', orderIds);
      
      const cancelShipmentFunc = httpsCallable(functions, "cancelShipment");
      const result = await cancelShipmentFunc({ orderIds });
      
      console.log('✅ Shipment cancelled');
      return result.data;
    } catch (error) {
      console.error("❌ Error cancelling shipment:", error);
      throw error;
    }
  }
}

const shiprocketService = new ShiprocketFrontendService();
export default shiprocketService;
