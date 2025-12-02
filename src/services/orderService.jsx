import { auth, db, envConfig } from "../config";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

/**
 * OrderService — Singleton class managing order operations
 */
class OrderOperationalService {
  static instance = null;

  constructor() {
    if (OrderOperationalService.instance) return OrderOperationalService.instance;

    this.b2cCollection = envConfig.firebaseStorage?.b2cCollection || "b2c_users";
    this.b2bCollection = envConfig.firebaseStorage?.b2bCollection || "B2BBulkOrders_users";
    this.ordersSubcollection = envConfig.firebaseStorage?.ordersSubcollection || "orders";

    OrderOperationalService.instance = this;
  }

  /**
   * Determine user's collection type (b2c or b2b)
   */
  async getUserCollection(userId) {
    try {
      const b2cUserRef = doc(db, this.b2cCollection, userId);
      const b2cDoc = await getDoc(b2cUserRef);
      if (b2cDoc.exists()) return this.b2cCollection;

      const b2bUserRef = doc(db, this.b2bCollection, userId);
      const b2bDoc = await getDoc(b2bUserRef);
      if (b2bDoc.exists()) return this.b2bCollection;

      throw new Error("User not found in any collection");
    } catch (error) {
      console.error("🔥 Error determining user collection:", error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  async createOrder(orderData) {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be authenticated");

    try {
      const userCollection = await this.getUserCollection(user.uid);
      const orderId = `ORD${Date.now()}`;
      const orderRef = doc(db, userCollection, user.uid, this.ordersSubcollection, orderId);

      const order = {
        orderId,
        userId: user.uid,
        status: "Active",
        createdAt: Timestamp.now(),
        ...orderData,
      };

      await setDoc(orderRef, order);
      console.info(`✅ Order created: ${orderId}`);
      return { success: true, orderId, order };
    } catch (error) {
      console.error("🔥 Error creating order:", error);
      throw error;
    }
  }

  /**
   * Get all orders for current user
   */
  async getUserOrders() {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be authenticated");

    try {
      const userCollection = await this.getUserCollection(user.uid);
      const ordersRef = collection(db, userCollection, user.uid, this.ordersSubcollection);
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const orders = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        date: docSnap.data().createdAt?.toDate?.() || new Date(),
      }));

      return orders;
    } catch (error) {
      console.error("🔥 Error fetching user orders:", error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time order updates
   */
  async subscribeToOrders(callback) {
    const user = auth.currentUser;
    if (!user) {
      callback([]);
      return () => {};
    }

    try {
      const userCollection = await this.getUserCollection(user.uid);
      const ordersRef = collection(db, userCollection, user.uid, this.ordersSubcollection);
      const q = query(ordersRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const orders = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            date: docSnap.data().createdAt?.toDate?.() || new Date(),
          }));
          callback(orders);
        },
        (error) => {
          console.error("🔥 Error in orders subscription:", error);
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("🔥 Error setting up order listener:", error);
      callback([]);
      return () => {};
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, newStatus) {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be authenticated");

    try {
      const userCollection = await this.getUserCollection(user.uid);
      const orderRef = doc(db, userCollection, user.uid, this.ordersSubcollection, orderId);

      await setDoc(orderRef, { status: newStatus }, { merge: true });
      console.info(`✅ Order status updated to ${newStatus}`);
      return true;
    } catch (error) {
      console.error("🔥 Error updating order status:", error);
      throw error;
    }
  }
}

/**
 * Export a Singleton instance of the OrderService
 */
const orderService = new OrderOperationalService();
export default orderService;
