import { db, auth, envConfig } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

/**
 * TryOnService: Handles save, fetch, and delete operations
 * for user try-on data in Firestore.
 *
 * Implements:
 * - Singleton pattern (only one instance)
 * - Class-based design for scalability
 */
class TryOnOperationalService {
  static instance;

  constructor() {
    if (TryOnOperationalService.instance) {
      return TryOnOperationalService.instance;
    }

    this.collectionName = envConfig.firebaseStorage.tryOnCollection;
    if (!this.collectionName) {
      throw new Error("❌ Missing Firestore collection name in envConfig (tryOnCollection)");
    }

    TryOnOperationalService.instance = this;
  }

  /**
   * Private: Get current authenticated user
   */
  getCurrentUser() {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return user;
  }

  /**
   * Save try-on result to Firestore
   * @param {Object} tryOnData - Data containing product and result info
   * @returns {Promise<string>} Firestore document ID
   */
  async saveTryOnResult(tryOnData) {
    try {
      const user = this.getCurrentUser();
      const tryOnRef = collection(db, this.collectionName);

      const payload = {
        userId: user.uid,
        productId: tryOnData.productId,
        productName: tryOnData.garmentName || tryOnData.productName,
        garmentName: tryOnData.garmentName,
        tryOnImage: tryOnData.tryOnResult || tryOnData.tryOnImage,
        modelImage: tryOnData.modelImage,
        garmentImage: tryOnData.garmentImage,
        viewMode: tryOnData.is3D ? "3D" : "2D",
        videoUrl: tryOnData.videoUrl || null,
        selectedColors: tryOnData.selectedColors || [],
        selectedSizes: tryOnData.selectedSizes || [],
        fabric: tryOnData.fabric || "",
        price: tryOnData.price || 0,
        discount: tryOnData.discount || 0,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(tryOnRef, payload);
      console.log("✅ Try-on saved successfully:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error saving try-on:", error);
      throw error;
    }
  }

  /**
   * Get all try-ons for current user
   * @returns {Promise<Array>} List of try-on objects
   */
  async getUserTryOns() {
    try {
      const user = this.getCurrentUser();

      const tryOnsRef = collection(db, this.collectionName);
      const q = query(tryOnsRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const tryOns = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      console.log("✅ Fetched try-ons:", tryOns.length);
      return tryOns;
    } catch (error) {
      console.error("❌ Error fetching try-ons:", error);
      throw error;
    }
  }

  /**
   * Delete try-on by document ID
   * @param {string} tryOnId - Firestore document ID
   */
  async deleteTryOn(tryOnId) {
    try {
      this.getCurrentUser();
      await deleteDoc(doc(db, this.collectionName, tryOnId));
      console.log("✅ Try-on deleted:", tryOnId);
    } catch (error) {
      console.error("❌ Error deleting try-on:", error);
      throw error;
    }
  }
}

/**
 * Export a single instance (Singleton)
 */
export const tryOnService = new TryOnOperationalService();
export default tryOnService;
