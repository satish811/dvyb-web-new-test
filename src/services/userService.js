/**
 * User Service File
 * -----------------
 * Handles all user-related database operations
 * - Fetch user data
 * - Update user profile
 * - Manage addresses (CRUD operations)
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { toast } from "react-toastify";

class UserService {
  static instance = null;

  static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  constructor() {
    this.db = db;
    this.collections = {
      b2c: "b2c_users",
      b2b: "B2BBulkOrders_users",
    };
  }

  /**
   * Find which collection the user exists in
   */
  async findUserCollection(userId) {
    try {
      // Check B2C first
      const b2cRef = doc(this.db, this.collections.b2c, userId);
      const b2cSnap = await getDoc(b2cRef);

      if (b2cSnap.exists()) {
        return {
          collection: this.collections.b2c,
          data: b2cSnap.data(),
          exists: true,
        };
      }

      // Check B2B
      const b2bRef = doc(this.db, this.collections.b2b, userId);
      const b2bSnap = await getDoc(b2bRef);

      if (b2bSnap.exists()) {
        return {
          collection: this.collections.b2b,
          data: b2bSnap.data(),
          exists: true,
        };
      }

      return { exists: false };
    } catch (error) {
      console.error("Error finding user collection:", error);
      throw error;
    }
  }

  /**
   * Get user profile data
   */
  async getUserProfile(userId) {
    try {
      const userInfo = await this.findUserCollection(userId);

      if (!userInfo.exists) {
        throw new Error("User not found");
      }

      return {
        ...userInfo.data,
        collection: userInfo.collection,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
      throw error;
    }
  }

  /**
   * Update user profile data
   */
  async updateUserProfile(userId, updates) {
    try {
      const userInfo = await this.findUserCollection(userId);

      // If doc is missing, create/merge in B2C by default so profile edits are not lost.
      const targetCollection = userInfo.exists ? userInfo.collection : this.collections.b2c;
      const userRef = doc(this.db, targetCollection, userId);

      await setDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      }, { merge: true });

      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("Failed to update profile");
      throw error;
    }
  }

  /**
   * Get all addresses for a user
   */
  async getAddresses(userId) {
    try {
      const userInfo = await this.findUserCollection(userId);

      if (!userInfo.exists) {
        throw new Error("User not found");
      }

      const addressesRef = collection(this.db, userInfo.collection, userId, "addresses");

      const snapshot = await getDocs(addressesRef);

      const addresses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return addresses;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
      throw error;
    }
  }

  /**
   * Add a new address
   */
  async addAddress(userId, addressData) {
    try {
      const userInfo = await this.findUserCollection(userId);

      if (!userInfo.exists) {
        throw new Error("User not found");
      }

      const addressesRef = collection(this.db, userInfo.collection, userId, "addresses");

      const newAddress = {
        ...addressData,
        type: addressData.type || "Home",
        isDefault: addressData.isDefault || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(addressesRef, newAddress);

      toast.success("Address added successfully!");
      return { id: docRef.id, ...newAddress };
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
      throw error;
    }
  }

  /**
   * Update an existing address
   */
  async updateAddress(userId, addressId, updates) {
    try {
      const userInfo = await this.findUserCollection(userId);

      if (!userInfo.exists) {
        throw new Error("User not found");
      }

      const addressRef = doc(this.db, userInfo.collection, userId, "addresses", addressId);

      await updateDoc(addressRef, {
        ...updates,
        updatedAt: new Date(),
      });

      toast.success("Address updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address");
      throw error;
    }
  }

  /**
   * Delete an address
   */
  async deleteAddress(userId, addressId) {
    try {
      const userInfo = await this.findUserCollection(userId);

      if (!userInfo.exists) {
        throw new Error("User not found");
      }

      const addressRef = doc(this.db, userInfo.collection, userId, "addresses", addressId);

      await deleteDoc(addressRef);

      toast.success("Address deleted successfully!");
      return true;
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
      throw error;
    }
  }

  /**
   * Set default address
   */

  async setHomeAddress(userId, addressId) {
    try {
      const userInfo = await this.findUserCollection(userId);

      if (!userInfo.exists) {
        throw new Error("User not found");
      }

      const addressesRef = collection(this.db, userInfo.collection, userId, "addresses");

      const snapshot = await getDocs(addressesRef);

      const batch = writeBatch(this.db);

      snapshot.docs.forEach((docSnap) => {
        const ref = doc(this.db, userInfo.collection, userId, "addresses", docSnap.id);

        batch.update(ref, {
          isHome: docSnap.id === addressId,
          updatedAt: new Date(),
        });
      });

      await batch.commit();

      toast.success("Home address updated!");
      return true;
    } catch (err) {
      console.error("Error setting home address:", err);
      toast.error("Failed to set home address");
      throw err;
    }
  }

  async setDefaultAddress(userId, addressId) {
    try {
      const userInfo = await this.findUserCollection(userId);

      if (!userInfo.exists) {
        throw new Error("User not found");
      }

      const addressesRef = collection(this.db, userInfo.collection, userId, "addresses");

      const snapshot = await getDocs(addressesRef);

      const batch = writeBatch(this.db);

      snapshot.docs.forEach((docSnap) => {
        const ref = doc(this.db, userInfo.collection, userId, "addresses", docSnap.id);

        batch.update(ref, {
          isDefault: docSnap.id === addressId,
          updatedAt: new Date(),
        });
      });

      await batch.commit();

      toast.success("Default address updated!");
      return true;
    } catch (err) {
      console.error("Error setting default address:", err);
      toast.error("Failed to set default address");
      throw err;
    }
  }
}

/**
 * Export a single instance (Singleton)
 */
export const userService = UserService.getInstance();
export default userService;
