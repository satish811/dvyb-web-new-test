import { auth, db, envConfig } from "../config"; 
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

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

      await setDoc(userDocRef, {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
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
      }, { merge: true });

      console.log("✅ Profile saved successfully");
      return true;
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      throw error;
    }
  }

  /** Save AI try-on result (ONLY ONE VERSION) */
  async saveTryOnResult(outfitType, imageUrl) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = await this.getCurrentUserCollection();
      const userDocRef = doc(this.db, userCollection, user.uid);

      // Save try-on results under profile.tryOnResults
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