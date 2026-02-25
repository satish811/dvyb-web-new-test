import { auth, db, envConfig } from "../config";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  where,
} from "firebase/firestore";
import { B2BWishlistItemModel } from "../models/B2BWishlistModel";
import B2BAuthService from "./b2bAuthService";

/**
 * Wishlist Service (Singleton Class)
 * Updated with proper role-based B2B/B2C handling
 */
class WishlistOperationalService {
  static instance;

  constructor() {
    if (WishlistOperationalService.instance) {
      return WishlistOperationalService.instance;
    }
    WishlistOperationalService.instance = this;
  }

  /** Get user role and collection */
  async getUserRoleAndCollection() {
    const user = auth.currentUser;
    if (!user) {
      console.error("❌ getUserRoleAndCollection: No user found");
      throw new Error("User not authenticated");
    }

    console.log("🔍 Checking user role for:", user.uid);

    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get("usertype");

    if (userType === "b2b") {
      console.log("🎯 URL parameter detected: B2B");
      return { role: "B2B", collection: "B2BBulkOrders_users" };
    }

    try {
      console.log("🔍 Checking B2B database for user...");
      const userData = await B2BAuthService.getUserById(user.uid);
      console.log("🔍 B2B service response:", userData);

      if (userData?.data?.role?.toLowerCase() === "b2b") {
        console.log("🎯 B2B user detected from database");
        return { role: "B2B", collection: "B2BBulkOrders_users" };
      }
    } catch (error) {
      console.log("ℹ️ User not in B2B system, treating as B2C", error.message);
    }

    console.log("🎯 Defaulting to B2C");
    return { role: "B2C", collection: "b2c_users" };
  }

  /** Add item to wishlist with role-based structure */
  /** Add item to wishlist with role-based structure */
  async addToWishlist(productId, productData = {}, variants = [], userRole = null) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const { role, collection: userCollection } = await this.getUserRoleAndCollection();

      // Ensure user document exists
      const userDocRef = doc(db, userCollection, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          role: role || userRole,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Prepare and save wishlist item
      const wishlistItemRef = doc(db, userCollection, user.uid, "wishlist", productId);

      let wishlistData;
      if (role === "B2B" || userRole === "B2B") {
        const b2bItem = new B2BWishlistItemModel({
          productId,
          productData,
          variants,
          userId: user.uid,
        });
        wishlistData = b2bItem.toFirestore();
      } else {
        const cleanedProductData = Object.fromEntries(
          Object.entries(productData).filter(([_, value]) => value !== undefined && value !== null)
        );
        wishlistData = {
          productId,
          addedAt: new Date(),
          updatedAt: new Date(),
          userId: user.uid,
          userRole: role || userRole,
          isB2B: false,
          ...cleanedProductData,
        };
      }

      await setDoc(wishlistItemRef, wishlistData);

      return {
        success: true,
        role,
        documentId: productId,
        data: wishlistData,
      };
    } catch (error) {
      console.error("Error adding to wishlist:", error.message);
      throw error;
    }
  }

  /** Remove item from wishlist */
  async removeFromWishlist(productId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const { collection: userCollection } = await this.getUserRoleAndCollection();
      const wishlistItemRef = doc(db, userCollection, user.uid, "wishlist", productId);

      await deleteDoc(wishlistItemRef);
      console.log("Item removed from wishlist");
      return { success: true };
    } catch (error) {
      console.error("❌ Error removing from wishlist:", error);
      throw error;
    }
  }

  /** Get all wishlist items with proper role detection */
  async getWishlist() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const { role, collection: userCollection } = await this.getUserRoleAndCollection();
      const wishlistRef = collection(db, userCollection, user.uid, "wishlist");
      const q = query(wishlistRef, orderBy("addedAt", "desc"));
      const snapshot = await getDocs(q);

      const wishlistItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),

        addedAt: doc.data().addedAt?.toDate?.(),
        updatedAt: doc.data().updatedAt?.toDate?.(),
      }));

      console.log(`Retrieved ${wishlistItems.length} items from ${role} wishlist`);
      return wishlistItems;
    } catch (error) {
      console.error("❌ Error fetching wishlist:", error);
      throw error;
    }
  }

  /** Check if an item exists in wishlist */
  async isInWishlist(productId) {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      const { collection: userCollection } = await this.getUserRoleAndCollection();
      const wishlistItemRef = doc(db, userCollection, user.uid, "wishlist", productId);
      const docSnap = await getDoc(wishlistItemRef);
      return docSnap.exists();
    } catch (error) {
      console.error("❌ Error checking wishlist:", error);
      return false;
    }
  }

  /** Toggle wishlist item (add/remove) with role support */
  async toggleWishlist(productId, productData = {}, variants = []) {
    try {
      const exists = await this.isInWishlist(productId);
      if (exists) {
        await this.removeFromWishlist(productId);
        return { action: "removed", inWishlist: false };
      } else {
        await this.addToWishlist(productId, productData, variants);
        return { action: "added", inWishlist: true };
      }
    } catch (error) {
      console.error("❌ Error toggling wishlist:", error);
      throw error;
    }
  }

  /** Update B2B wishlist item variants */
  async updateB2BWishlistVariants(productId, variants) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const { role, collection: userCollection } = await this.getUserRoleAndCollection();

      if (role !== "B2B") {
        throw new Error("Variant updates are only available for B2B users");
      }

      const wishlistItemRef = doc(db, userCollection, user.uid, "wishlist", productId);
      const docSnap = await getDoc(wishlistItemRef);

      if (!docSnap.exists()) {
        throw new Error("Item not found in wishlist");
      }

      const existingItem = docSnap.data();

      const updatedItem = B2BWishlistItemModel.fromExisting(existingItem, variants);
      const updateData = updatedItem.toFirestore();

      await updateDoc(wishlistItemRef, updateData);
      console.log("✅ B2B wishlist variants updated successfully");
      return { success: true, item: updatedItem };
    } catch (error) {
      console.error("❌ Error updating B2B wishlist variants:", error);
      throw error;
    }
  }

  /** Subscribe to wishlist changes (real-time updates) */
  subscribeToWishlist(callback) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = auth.currentUser;
        if (!user) {
          callback([]);
          resolve(() => { });
          return;
        }

        const { collection: userCollection } = await this.getUserRoleAndCollection();
        const wishlistRef = collection(db, userCollection, user.uid, "wishlist");
        const q = query(wishlistRef, orderBy("addedAt", "desc"));

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const wishlistItems = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),

              addedAt: doc.data().addedAt?.toDate?.(),
              updatedAt: doc.data().updatedAt?.toDate?.(),
            }));
            callback(wishlistItems);
          },
          (error) => {
            console.error("Error listening to wishlist:", error);
            callback([]);
          }
        );

        resolve(unsubscribe);
      } catch (error) {
        console.error("❌ Error setting up wishlist listener:", error);
        callback([]);
        resolve(() => { });
      }
    });
  }

  /** Clear all wishlist items */
  async clearWishlist() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const wishlistItems = await this.getWishlist();
      const deleteOps = wishlistItems.map((item) => this.removeFromWishlist(item.productId));

      await Promise.all(deleteOps);
      console.log("🧼 Wishlist cleared successfully");
      return { success: true, count: wishlistItems.length };
    } catch (error) {
      console.error("❌ Error clearing wishlist:", error);
      throw error;
    }
  }

  /** Get total wishlist count */
  async getWishlistCount() {
    try {
      const items = await this.getWishlist();
      return items.length;
    } catch (error) {
      console.error("❌ Error getting wishlist count:", error);
      return 0;
    }
  }

  /** Get user's current role */
  async getCurrentUserRole() {
    try {
      const { role } = await this.getUserRoleAndCollection();
      return role;
    } catch (error) {
      console.error("❌ Error getting user role:", error);
      return "B2C";
    }
  }

  /** Check if current user is B2B */
  async isB2BUser() {
    const role = await this.getCurrentUserRole();
    return role === "B2B";
  }
}

/**
 * Export the Singleton instance
 */
export const wishlistService = new WishlistOperationalService();
