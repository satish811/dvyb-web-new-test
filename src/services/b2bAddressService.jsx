// services/addressService.js
import {
  doc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config";
import { AddressModel } from "../models/B2BAddressModel";

class B2BAddressService {
  static instance = null;

  static getInstance() {
    if (!B2BAddressService.instance) {
      B2BAddressService.instance = new B2BAddressService();
    }
    return B2BAddressService.instance;
  }

  // Get collection name based on role
  getCollectionName(role) {
    return role === "B2B" ? "B2BBulkOrders_users" : "b2c_users";
  }

  // Get addresses subcollection path
  getAddressesPath(role, userId) {
    const mainCollection = this.getCollectionName(role);
    return `${mainCollection}/${userId}/addresses`;
  }

  // Get all addresses for user
  async getAddresses(userId, role) {
    try {
      console.log("The get address function called");
      const addressesRef = collection(db, this.getAddressesPath(role, userId));
      const snapshot = await getDocs(addressesRef);
      console.log("The address we get", snapshot.data);

      const addresses = [];
      snapshot.forEach((doc) => {
        addresses.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        data: addresses,
      };
    } catch (error) {
      console.error("Get addresses error:", error);
      throw new Error("Failed to fetch addresses");
    }
  }

  // Add new address
  async addAddress(userId, role, addressData) {
    try {
      const addressModel = new AddressModel({
        userId,
        ...addressData,
      });

      // Validate address
      const validation = addressModel.validate();
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      // 1. Check if there are any addresses previously stored
      const addressesRef = collection(db, this.getAddressesPath(role, userId));
      const snapshot = await getDocs(addressesRef);
      const existingAddresses = [];

      snapshot.forEach((doc) => {
        existingAddresses.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // 2. Determine if this should be the default address
      const isFirstAddress = existingAddresses.length === 0;
      const addressWithDefaults = {
        ...addressModel.toFirestore(),
        isDefault: isFirstAddress, // 3. First address should be default
        id: doc(collection(db, this.getAddressesPath(role, userId))).id,
      };

      // Create the new address document
      const addressRef = doc(db, this.getAddressesPath(role, userId), addressWithDefaults.id);
      await setDoc(addressRef, addressWithDefaults);

      return {
        success: true,
        data: addressWithDefaults,
        isDefault: isFirstAddress,
      };
    } catch (error) {
      console.error("Add address error:", error);
      throw new Error(error.message || "Failed to add address");
    }
  }

  // Update address
  async updateAddress(userId, role, addressId, updatedData) {
    try {
      const addressRef = doc(db, this.getAddressesPath(role, userId), addressId);
      await updateDoc(addressRef, {
        ...updatedData,
        updatedAt: new Date(),
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Update address error:", error);
      throw new Error("Failed to update address");
    }
  }

  // Delete address
  async deleteAddress(userId, role, addressId) {
    try {
      const addressRef = doc(db, this.getAddressesPath(role, userId), addressId);
      await deleteDoc(addressRef);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Delete address error:", error);
      throw new Error("Failed to delete address");
    }
  }

  // Set default address
  async setDefaultAddress(userId, role, addressId) {
    try {
      const addressesRef = collection(db, this.getAddressesPath(role, userId));
      const snapshot = await getDocs(addressesRef);

      // Reset all addresses to non-default
      const batch = [];
      snapshot.forEach((doc) => {
        batch.push(updateDoc(doc.ref, { isDefault: false }));
      });

      // Set the selected address as default
      const addressRef = doc(db, this.getAddressesPath(role, userId), addressId);
      batch.push(updateDoc(addressRef, { isDefault: true, updatedAt: new Date() }));

      await Promise.all(batch);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Set default address error:", error);
      throw new Error("Failed to set default address");
    }
  }
}

export default B2BAddressService.getInstance();
