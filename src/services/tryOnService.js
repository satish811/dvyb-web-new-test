import { db, auth } from "../config/firebaseConfig";
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

// Save try-on result to Firebase
export const saveTryOnResult = async (tryOnData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const tryOnRef = collection(db, "user_tryons");
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

    const tryOnsRef = collection(db, "user_tryons");
    const q = query(tryOnsRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);
    const tryOns = [];

    querySnapshot.forEach((doc) => {
      tryOns.push({
        id: doc.id,
        ...doc.data(),
      });
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

    await deleteDoc(doc(db, "user_tryons", tryOnId));
    console.log("✅ Try-on deleted:", tryOnId);
  } catch (error) {
    console.error("❌ Error deleting try-on:", error);
    throw error;
  }
};
