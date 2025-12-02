import { db } from "../config";
import { getDocs, collectionGroup } from "firebase/firestore";

/**
 * DebugService — Runs Firestore sanity checks and debugging tests
 * Implements Singleton pattern
 */
class DebugOperationalService {
  static instance = null;

  static getInstance() {
    if (!DebugOperationalService.instance) {
      DebugOperationalService.instance = new DebugOperationalService();
    }
    return DebugOperationalService.instance;
  }

  /** Run debug tests */
  async runDebugTests() {
    console.log("🔍 Running comprehensive debug tests...");
    const debug = {};

    try {
      debug.firebaseConnected = true;
      console.log("✅ Firebase connection OK");

      try {
        console.log("🔍 Testing collection group query...");
        const q = collectionGroup(db, "products");
        const querySnapshot = await getDocs(q);

        debug.totalProducts = querySnapshot.size;
        debug.productIds = querySnapshot.docs.map((doc) => doc.id);
        console.log(`📊 Found ${querySnapshot.size} products:`, debug.productIds);

        if (querySnapshot.size > 0) {
          const sampleProduct = querySnapshot.docs[0].data();
          debug.sampleProduct = sampleProduct;
          console.log("📦 Sample product:", sampleProduct);
        }
      } catch (error) {
        debug.collectionGroupError = error.message;
        console.error("❌ Collection group query failed:", error);
      }
    } catch (error) {
      debug.generalError = error.message;
      console.error("❌ General debug test failed:", error);
    }

    return debug;
  }
}

/**
 * Export Singleton instances
 */
export const debugService = DebugOperationalService.getInstance();
