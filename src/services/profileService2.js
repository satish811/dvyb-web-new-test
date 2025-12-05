import { auth, db, envConfig } from "../config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

class ProfileService {
  constructor() {
    this.db = db;
    this.auth = auth;
    this.b2cCollection = envConfig.firebaseStorage.b2cCollection;
    this.b2bCollection = envConfig.firebaseStorage.b2bCollection;
  }

  async getCurrentUserCollection() {
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get("usertype");
    return userType === "b2b" ? "B2BBulkOrders_users" : "b2c_users";
  }

  async saveProfile(profileData) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = await this.getCurrentUserCollection();
      const userDocRef = doc(this.db, userCollection, user.uid);

      console.log("userDocRef:", userDocRef);
      console.log("started storing profile data...");

      const userProfile = await setDoc(
        userDocRef,
        {
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
        },
        { merge: true }
      );

      console.log("✅ Profile saved successfully - 1");
      console.log("userProfile:", userProfile);

      console.log("✅ Profile saved successfully -2 ");
      return true;
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      throw error;
    }
  }

  async saveTryOnResult(outfitType, imageUrl) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const userCollection = await this.getCurrentUserCollection();
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

export const profileService = new ProfileService();
