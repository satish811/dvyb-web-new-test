import { db, auth } from "../config/firebaseConfig";
import envConfig from "../config/envConfig";
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

const COLLECTION_NAME = "user_tryons";

// Save try-on result to Firebase
export const saveTryOnResult = async (tryOnData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const tryOnRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(tryOnRef, {
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
    });

    console.log("✅ Try-on saved successfully:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error saving try-on:", error);
    throw error;
  }
};

// Get all try-ons for current user
export const getUserTryOns = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const tryOnsRef = collection(db, COLLECTION_NAME);
    console.log(`🔍 Fetching try-ons from: ${COLLECTION_NAME} for user: ${user.uid}`);

    // dbg: removing orderBy to fix permission/index error - sorting in memory instead
    const q = query(tryOnsRef, where("userId", "==", user.uid));

    const querySnapshot = await getDocs(q);
    const tryOns = [];

    querySnapshot.forEach((doc) => {
      tryOns.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort in memory: Newest first
    tryOns.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    console.log("✅ Fetched try-ons:", tryOns.length);
    return tryOns;
  } catch (error) {
    console.error("❌ Error fetching try-ons:", error);
    throw error;
  }
};

// Delete a try-on
export const deleteTryOn = async (tryOnId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    await deleteDoc(doc(db, COLLECTION_NAME, tryOnId));
    console.log("✅ Try-on deleted:", tryOnId);
  } catch (error) {
    console.error("❌ Error deleting try-on:", error);
    throw error;
  }
};
