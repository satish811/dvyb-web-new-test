import { auth, db, envConfig } from "../config";
import { doc, setDoc, getDoc, updateDoc, deleteField } from "firebase/firestore";

class ProfileService {
  static instance = null;

  static getInstance() {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  constructor() {
    this.db = db;
    this.auth = auth;
    this.b2cCollection = envConfig.firebaseStorage.b2cCollection;
    this.b2bCollection = envConfig.firebaseStorage.b2bCollection;
  }

  /** Get current user collection based on route or database check */
  async getCurrentUserCollection() {
    // 1. Check URL parameters first (fastest)
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get("usertype");
    if (userType === "b2b") return "B2BBulkOrders_users";
    if (userType === "b2c") return "b2c_users";

    // 2. Fallback: Check the database if parameters are missing
    const user = this.auth.currentUser;
    if (!user) return "b2c_users";

    try {
      // Check for user document in both collections
      const [b2cSnap, b2bSnap] = await Promise.all([
        getDoc(doc(this.db, "b2c_users", user.uid)),
        getDoc(doc(this.db, "B2BBulkOrders_users", user.uid))
      ]);

      if (b2bSnap.exists()) {
        console.log("🔍 ProfileService: User identified as B2B from database.");
        return "B2BBulkOrders_users";
      }

      console.log("🔍 ProfileService: User identified as B2C from database.");
      return "b2c_users";
    } catch (error) {
      console.warn("⚠️ ProfileService: Error detecting user role, defaulting to B2C", error);
      return "b2c_users";
    }
  }

  /** Save user profile data */
  async saveProfile(profileData, overrideCollection = null) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = overrideCollection || await this.getCurrentUserCollection();
      const userDocRef = doc(this.db, userCollection, user.uid);

      await setDoc(
        userDocRef,
        {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          role: userCollection === "B2BBulkOrders_users" ? "B2B" : "B2C",
          profile: {
            height: profileData.height,
            unit: profileData.unit,
            bodyShape: profileData.bodyShape,
            skinTone: profileData.skinTone,
            hairType: profileData.hairType,
            hairLength: profileData.hairLength,
            hairColor: profileData.hairColor,
            photoUrl: profileData.photoUrl,
            updatedAt: new Date(),
          },
          updatedAt: new Date(),
        },
        { merge: true }
      );

      console.log("✅ Profile saved successfully");
      return true;
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      throw error;
    }
  }

  /** Save AI try-on results with Cloudinary URLs */
  async saveTryOnResults(tryOnResults, overrideCollection = null) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      console.log("📤 Uploading images to Cloudinary one by one...");

      const cloudinaryUrls = {};
      const entries = Object.entries(tryOnResults).filter(([_, url]) => url !== null);

      // Upload images ONE BY ONE to avoid payload size issues
      for (let i = 0; i < entries.length; i++) {
        const [outfitType, dataUrl] = entries[i];

        console.log(`📤 Uploading ${i + 1}/${entries.length}: ${outfitType}...`);

        try {
          // Convert base64 data URL to Blob
          const res = await fetch(dataUrl);
          const blob = await res.blob();

          // Create FormData
          const formData = new FormData();
          formData.append('file', blob, `${outfitType}.jpg`);
          formData.append('folder', 'warehouse_uploads'); // Optional, if server supports it

          // Upload to server (proxied to localhost:3010/upload)
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            // Do NOT set Content-Type header for FormData, browser sets it with boundary
          });

          if (!uploadResponse.ok) {
            let errorData;
            try {
              const contentType = uploadResponse.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                errorData = await uploadResponse.json();
              } else {
                // Handle HTML errors like 404 (Cannot POST /api/upload)
                const text = await uploadResponse.text();
                errorData = {
                  message: text.includes("Cannot POST")
                    ? "Backend endpoint /api/upload not found. PLEASE RESTART YOUR SERVER (node server.js)."
                    : text.substring(0, 100)
                };
              }
            } catch (e) {
              errorData = { message: uploadResponse.statusText };
            }

            console.error(`❌ Upload failed for ${outfitType}:`, errorData);
            throw new Error(errorData.message || `Failed to upload ${outfitType}`);
          }

          const result = await uploadResponse.json();

          // Server returns { url: "..." }
          cloudinaryUrls[outfitType] = result.url;
          console.log(`✅ ${outfitType} uploaded: ${cloudinaryUrls[outfitType]}`);

        } catch (error) {
          console.error(`❌ Error uploading ${outfitType}:`, error);
          // Continue with other images even if one fails
        }
      }

      if (Object.keys(cloudinaryUrls).length === 0) {
        console.error("❌ No images were successfully uploaded to Cloudinary. Aborting Firestore save.");
        throw new Error("Failed to upload all models to Cloudinary. Please check if your server is running and restarted.");
      }

      console.log("✅ Some uploads successful. Saving URLs to Firestore...");
      console.log("📦 Cloudinary URLs:", cloudinaryUrls);

      // ✅ Save only Cloudinary URLs to Firestore (NOT base64)
      const userCollection = overrideCollection || await this.getCurrentUserCollection();
      const userDocRef = doc(this.db, userCollection, user.uid);

      await setDoc(userDocRef, {
        tryOnResults: cloudinaryUrls,
        updatedAt: new Date(),
      }, { merge: true });

      console.log("✅ Try-on results saved to Firestore with Cloudinary URLs");
      return cloudinaryUrls;

    } catch (error) {
      console.error("❌ Error saving try-on results:", error);
      throw error;
    }
  }

  /** Get all try-on results */
  async getTryOnResults(overrideCollection = null) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = overrideCollection || await this.getCurrentUserCollection();
      const userDocRef = doc(this.db, userCollection, user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        return docSnap.data().tryOnResults || {};
      }
      return {};
    } catch (error) {
      console.error("❌ Error fetching try-on results:", error);
      throw error;
    }
  }

  /** ⭐ NEW: Get try-on image by dress type */
  async getTryOnByDressType(dressType, overrideCollection = null) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        console.log("❌ User not authenticated");
        return null;
      }

      // Normalize dress type to lowercase for matching
      const normalizedType = dressType?.toLowerCase().trim();

      console.log(`🔍 Fetching try-on for dress type: ${normalizedType}`);

      const userCollection = overrideCollection || await this.getCurrentUserCollection();
      const userDocRef = doc(this.db, userCollection, user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        console.log("❌ User document not found");
        return null;
      }

      const tryOnResults = docSnap.data().tryOnResults || {};
      console.log("📦 All try-on results:", Object.keys(tryOnResults));

      // Try to match the dress type
      // Check exact match first
      if (tryOnResults[normalizedType]) {
        console.log(`✅ Found exact match for ${normalizedType}`);
        return tryOnResults[normalizedType];
      }

      // Try common variations
      const variations = {
        'saree': ['saree', 'sari'],
        'lehenga': ['lehenga', 'lehanga'],
        'kurti': ['kurti', 'kurta', 'kurtis',],
        'anarkali': ['anarkali', 'anarkalis'],
        'sharara': ['sharara', 'shararas'],
        'kurta set': ['kurta set', 'kurta sets', 'kurta-sets', 'kurtaset', 'kurti', 'kurta', 'kurtis'],
      };

      // Find matching variation
      for (const [key, aliases] of Object.entries(variations)) {
        if (aliases.includes(normalizedType)) {
          // Check if any alias exists in results
          for (const alias of aliases) {
            if (tryOnResults[alias]) {
              console.log(`✅ Found variation match: ${alias} for ${normalizedType}`);
              return tryOnResults[alias];
            }
          }
        }
      }

      console.log(`❌ No try-on found for dress type: ${normalizedType}`);
      return null;

    } catch (error) {
      console.error("❌ Error fetching try-on by dress type:", error);
      return null;
    }
  }

  /** Get user profile */
  async getProfile(overrideCollection = null) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = overrideCollection || await this.getCurrentUserCollection();
      const userDocRef = doc(this.db, userCollection, user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        return docSnap.data().profile || null;
      }
      return null;
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      throw error;
    }
  }
  /** Delete user profile and try-on results */
  async deleteProfile(overrideCollection = null) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = overrideCollection || await this.getCurrentUserCollection();
      const userDocRef = doc(this.db, userCollection, user.uid);

      // Check the doc exists before trying to update — updateDoc throws if doc is missing
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        console.log("ℹ️ No profile document found, nothing to delete.");
        return true;
      }

      // Remove profile and tryOnResults fields (keeps user doc intact)
      await updateDoc(userDocRef, {
        profile: deleteField(),
        tryOnResults: deleteField(),
        updatedAt: new Date(),
      });

      console.log("✅ Profile and try-on results deleted successfully");
      return true;
    } catch (error) {
      console.error("❌ Error deleting profile:", error);
      throw error;
    }
  }
}

export const profileService = ProfileService.getInstance();