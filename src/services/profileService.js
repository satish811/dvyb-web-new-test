import { auth, db, envConfig } from "../config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

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

  /** Get current user collection based on route */
  async getCurrentUserCollection() {
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get("usertype");
    return userType === "b2b" ? "B2BBulkOrders_users" : "b2c_users";
  }

  /** Save user profile data */
  async saveProfile(profileData) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = await this.getCurrentUserCollection();
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
  async saveTryOnResults(tryOnResults) {
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
          // Remove data URL prefix if present
          const base64Image = dataUrl.replace(/^data:image\/\w+;base64,/, '');
          
          // Upload single image to Cloudinary
          const uploadResponse = await fetch('/api/upload-to-cloudinary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              images: [{
                outfitType,
                base64Image
              }]
            })
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            console.error(`❌ Upload failed for ${outfitType}:`, errorData);
            throw new Error(errorData.error || `Failed to upload ${outfitType}`);
          }

          const { results } = await uploadResponse.json();
          
          // ✅ Store Cloudinary URL (NOT base64)
          cloudinaryUrls[outfitType] = results[outfitType];
          console.log(`✅ ${outfitType} uploaded: ${cloudinaryUrls[outfitType]}`);
          
        } catch (error) {
          console.error(`❌ Error uploading ${outfitType}:`, error);
          // Continue with other images even if one fails
        }
      }

      console.log("✅ All uploads complete. Saving URLs to Firestore...");
      console.log("📦 Cloudinary URLs:", cloudinaryUrls);

      // ✅ Save only Cloudinary URLs to Firestore (NOT base64)
      const userCollection = await this.getCurrentUserCollection();
      const userDocRef = doc(this.db, userCollection, user.uid);

      await updateDoc(userDocRef, {
        tryOnResults: cloudinaryUrls,
        updatedAt: new Date(),
      });

      console.log("✅ Try-on results saved to Firestore with Cloudinary URLs");
      return cloudinaryUrls;
      
    } catch (error) {
      console.error("❌ Error saving try-on results:", error);
      throw error;
    }
  }

  /** Get all try-on results */
  async getTryOnResults() {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = await this.getCurrentUserCollection();
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
  async getTryOnByDressType(dressType) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        console.log("❌ User not authenticated");
        return null;
      }

      // Normalize dress type to lowercase for matching
      const normalizedType = dressType?.toLowerCase().trim();
      
      console.log(`🔍 Fetching try-on for dress type: ${normalizedType}`);

      const userCollection = await this.getCurrentUserCollection();
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
        'kurta set': ['kurta set', 'kurta sets', 'kurta-sets', 'kurtaset','kurti', 'kurta', 'kurtis'],
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
  async getProfile() {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = await this.getCurrentUserCollection();
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
}

export const profileService = ProfileService.getInstance();