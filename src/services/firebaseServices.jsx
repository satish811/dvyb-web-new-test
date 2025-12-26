/**
 * Firebase Services Module
 * --------------------------------
 * Provides services for Product and User management using Firestore.
 * Also includes a DebugService for running Firestore sanity checks.
 */

import { db } from "../config";
import { collection, addDoc, getDocs, serverTimestamp, collectionGroup } from "firebase/firestore";

/**
 * ProductService — Handles Product CRUD using Firestore
 * Implements Singleton pattern
 */
class ProductOperationalService {
  static instance = null;

  static getInstance() {
    if (!ProductOperationalService.instance) {
      ProductOperationalService.instance = new ProductOperationalService();
    }
    return ProductOperationalService.instance;
  }

  /** Create a new product */
  async createProduct(userId, productData) {
    try {
      const productRef = await addDoc(collection(db, "users", userId, "products"), {
        ...productData,
        userId,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });

      console.log(`✅ Product created: ${productRef.id} for user: ${userId}`);
      return productRef.id;
    } catch (error) {
      console.error("❌ Error creating product:", error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /** Fetch all products across all vendors */
  async fetchAllProducts() {
    try {
      console.log(" Starting product fetch...");

      const q = collectionGroup(db, "products");
      const querySnapshot = await getDocs(q);

      const fetchedProducts = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        /**
         * Timestamp normalizing here
         */
        let timestamp = null;
        if (data.timestamp?.toDate) {
          timestamp = data.timestamp.toDate();
        } else if (typeof data.timestamp === "number") {
          timestamp = new Date(data.timestamp);
        } else if (typeof data.timestamp === "string") {
          timestamp = new Date(data.timestamp);
        } else if (data.createdAt) {
          timestamp = new Date(data.createdAt);
        }

        return {
          id: docSnap.id,
          ...data,
          timestamp,
          title: data.title || data.name || "Untitled Product",
          name: data.name || data.title || "Untitled Product",
        };
      });

      // console.log(`📊 Collection group query returned ${fetchedProducts.length} products`);
      if (fetchedProducts.length === 0) {
        console.log("⚠️ No products found");
      } else {
        // console.log(fetchedProducts)
        // console.log("📦 Sample products:", fetchedProducts.slice(0, 2));
      }

      /**
       * Sort products by timestamp descending
       * Means the newest is the first in the list
       */
      fetchedProducts.sort((a, b) => {
        const timeA = a.timestamp || new Date(0);
        const timeB = b.timestamp || new Date(0);
        return timeB - timeA;
      });

      return fetchedProducts;
    } catch (error) {
      console.error("💥 Error in fetchAllProducts:", error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }
}

/**
 * Export Singleton instances
 */
export const productService = ProductOperationalService.getInstance();
