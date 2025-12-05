// services/order
import { auth, db } from "../config/firebaseConfig";
import B2BAuthService from "./b2bAuthService";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

class OrderOperationalService {
  static instance = null;

  constructor() {
    if (OrderOperationalService.instance) return OrderOperationalService.instance;
    OrderOperationalService.instance = this;

    this.b2cCollection = "b2c_users";
    this.b2bCollection = "B2BBulkOrders_users";
    this.ordersSubcollection = "orders";
  }

  async getUserRoleAndCollection() {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    try {
      const profile = await B2BAuthService.getUserCompleteProfile(user.uid);

      if (!profile.success) throw new Error("Failed to fetch user profile");

      return {
        role: profile.role.toLowerCase(),
        collection: profile.role.toLowerCase() === "b2b" ? this.b2bCollection : this.b2cCollection,
      };
    } catch (error) {
      console.error("Failed to determine user role:", error);
      throw new Error("Unable to determine user type");
    }
  }

  async createOrder(orderData) {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be authenticated");

    try {
      const { collection } = await this.getUserRoleAndCollection();
      const orderId = `ORD${Date.now()}`;
      const orderRef = doc(db, collection, user.uid, this.ordersSubcollection, orderId);

      const order = {
        orderId,
        userId: user.uid,
        userRole: collection === this.b2bCollection ? "B2B" : "B2C",
        status: "Active",
        createdAt: Timestamp.now(),
        ...orderData,
      };

      await setDoc(orderRef, order);
      console.log("Order created for", order.userRole, "user:", orderId);
      return { success: true, orderId, order };
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async getUserOrders() {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be authenticated");

    try {
      const { collection } = await this.getUserRoleAndCollection();
      const ordersRef = collection(db, collection, user.uid, this.ordersSubcollection);
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async subscribeToOrders(callback) {
    const user = auth.currentUser;
    if (!user) {
      callback([]);
      return () => {};
    }

    let collectionName = null;

    try {
      const result = await this.getUserRoleAndCollection();
      collectionName = result.collection;
    } catch (error) {
      callback([]);
      return () => {};
    }

    const ordersRef = collection(db, collectionName, user.uid, this.ordersSubcollection);
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt?.toDate() || new Date(),
        }));
        callback(orders);
      },
      (error) => {
        console.error("Orders subscription error:", error);
        callback([]);
      }
    );

    return unsubscribe;
  }

  async updateOrderStatus(orderId, newStatus) {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be authenticated");

    try {
      const { collection } = await this.getUserRoleAndCollection();
      const orderRef = doc(db, collection, user.uid, this.ordersSubcollection, orderId);
      await setDoc(orderRef, { status: newStatus }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  }
}

const orderService = new OrderOperationalService();
export default orderService;
