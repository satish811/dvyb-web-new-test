import { auth, db, storage, envConfig } from "../config"; 
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";

class ProfileService {
  constructor() {
    this.db = db;
    this.auth = auth;
    this.storage = storage;
    this.b2cCollection = envConfig.firebaseStorage.b2cCollection;
    this.b2bCollection = envConfig.firebaseStorage.b2bCollection;
  }

  async getCurrentUserCollection() {
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get("usertype");
    return userType === "b2b" ? "B2BBulkOrders_users" : "b2c_users";
  }

  // Upload base64 image to Firebase Storage
  async uploadTryOnImage(userId, outfitType, base64Image) {
    try {
      const storageRef = ref(this.storage, `try-on/${userId}/${outfitType}_${Date.now()}.jpg`);
      
      // Upload base64 string
      await uploadString(storageRef, base64Image, 'data_url');
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log(`✅ Uploaded ${outfitType} image to Storage`);
      return downloadURL;
    } catch (error) {
      console.error(`❌ Error uploading ${outfitType} image:`, error);
      throw error;
    }
  }


  // Add this method in profileService.js
async getTryOnByDressType(dressType) {
  try {
    const user = this.auth.currentUser;
    if (!user) return null;

    const userCollection = "b2c_users";
    const userDocRef = doc(this.db, userCollection, user.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) return null;

    const profile = docSnap.data().profile;
    if (!profile) return null;
// ⭐ Normalize incoming
let normalized = dressType?.toLowerCase().trim();

// ⭐ Fix hyphens to spaces
normalized = normalized.replace(/-/g, " ");

console.log("🎯 Final normalized:", normalized);

// ⭐ Updated mapping table
const map = {
  lehenga: "lehenga",
  wedding: "lehenga",

  saree: "saree",
  sari: "saree",

  kurti: "kurti",
  kurta: "kurti",
  kurtha: "kurti",
  "kurta set": "kurti",
  "kurtha set": "kurti",
  "kurta sets": "kurti",
  "kurtha sets": "kurti",

  anarkali: "anarkali",
  anarkalis: "anarkali",
};

const outfitKey = map[normalized] || null;

console.log("🎯 Mapped Outfit Key:", outfitKey);
console.log("🎯 Now Stored Results:", profile?.tryOnResults);

if (!outfitKey) return null;

return profile?.tryOnResults?.[outfitKey] || null;

  } catch (error) {
    console.error("❌ Error fetching try-on by dress type:", error);
    return null;
  }
}



  async saveProfile(profileData) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = "b2c_users";
      const userDocRef = doc(this.db, userCollection, user.uid);

      // Check if document exists
      const userDoc = await getDoc(userDocRef);

      const profileToSave = {
        height: profileData.height,
        unit: profileData.unit,
        bodyShape: profileData.bodyShape,
        skinTone: profileData.skinTone,
        hairType: profileData.hairType,
        hairLength: profileData.hairLength,
        hairColor: profileData.hairColor,
        hasPhoto: !!profileData.photoUrl,
        tryOnResults: {}, // Initialize empty object for try-on results
        updatedAt: new Date(),
      };

      if (!userDoc.exists()) {
        // Create new document
        await setDoc(userDocRef, {
          uid: user.uid,
          phoneNumber: user.phoneNumber || null,
          email: user.email || null,
          role: "B2C",
          createdAt: new Date(),
          profile: profileToSave,
          profileCompleted: true,
        });
      } else {
        // Update existing document
        await updateDoc(userDocRef, {
          profile: profileToSave,
          profileCompleted: true,
          updatedAt: new Date(),
        });
      }

      // Store photo in localStorage temporarily (or upload to Storage if needed)
      if (profileData.photoUrl) {
        localStorage.setItem(`userPhoto_${user.uid}`, profileData.photoUrl);
      }

      console.log("✅ Profile saved successfully");
      return true;
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      throw error;
    }
  }

  async saveTryOnResult(outfitType, imageBase64) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      // Upload image to Firebase Storage
      const imageUrl = await this.uploadTryOnImage(user.uid, outfitType, imageBase64);

      // Save the download URL to Firestore
      const userCollection = "b2c_users";
      const userDocRef = doc(this.db, userCollection, user.uid);

      await updateDoc(userDocRef, {
        [`profile.tryOnResults.${outfitType}`]: imageUrl,
        updatedAt: new Date(),
      });

      console.log(`✅ Try-on result saved for ${outfitType}`);
      return true;
    } catch (error) {
      console.error(`❌ Error saving try-on result for ${outfitType}:`, error);
      throw error;
    }
  }

  async getProfile() {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = "b2c_users";
      const userDocRef = doc(this.db, userCollection, user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const profile = docSnap.data().profile || null;
        
        // Get photo from localStorage
        if (profile && profile.hasPhoto) {
          profile.photoUrl = localStorage.getItem(`userPhoto_${user.uid}`);
        }
        
        return profile;
      }
      return null;
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      throw error;
    }
  }

  async getTryOnResults() {
    try {
      const profile = await this.getProfile();
      return profile?.tryOnResults || {};
    } catch (error) {
      console.error("❌ Error fetching try-on results:", error);
      return {};
    }
  }
}

export const profileService = new ProfileService();