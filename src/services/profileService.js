import { auth, db, envConfig } from "../config";
import { doc, setDoc, getDoc, updateDoc, deleteField } from "firebase/firestore";

const MAX_PROFILE_IMAGE_BYTES = 3.5 * 1024 * 1024;
const MAX_START_DIMENSION = 1600;
const MIN_DIMENSION = 640;

class ProfileService {
  static instance = null;

  normalizeDressTypeKey(value) {
    const raw = String(value || "").toLowerCase().trim();
    if (!raw) return "";

    if (/\bsaree\b|\bsarees\b|\bsari\b/.test(raw)) return "saree";
    if (/\blehenga\b|\blehengas\b|\blehanga\b/.test(raw)) return "lehenga";
    if (/\banarkali\b|\banarkalis\b/.test(raw)) return "anarkali";
    if (/\bsharara\b|\bshararas\b/.test(raw)) return "sharara";

    // Keep kurta/kurti family together because profile generation stores one universal topwear model.
    if (/\bkurti\b|\bkurta\b|\bkurtas\b|\bkurta set\b|\bkurta sets\b|\bkurta-sets\b|\bkurtaset\b/.test(raw)) {
      return "kurti";
    }

    return raw;
  }

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

  isDataImageUrl(value) {
    return typeof value === "string" && value.startsWith("data:image/");
  }

  normalizeModelName(value) {
    const lettersOnly = String(value || "")
      .replace(/[^A-Za-z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!lettersOnly) return "";

    return lettersOnly
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  async compressImageBlobToMaxBytes(blob, maxBytes = MAX_PROFILE_IMAGE_BYTES) {
    if (!blob || blob.size <= maxBytes) return blob;

    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(blob);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image for compression"));
      };

      image.src = objectUrl;
    });

    const scale = Math.min(1, MAX_START_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    let width = Math.max(1, Math.floor(img.naturalWidth * scale));
    let height = Math.max(1, Math.floor(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return blob;

    let bestBlob = blob;

    for (let pass = 0; pass < 6; pass += 1) {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      for (let quality = 0.9; quality >= 0.45; quality -= 0.15) {
        // eslint-disable-next-line no-await-in-loop
        const candidate = await new Promise((resolve) => {
          canvas.toBlob((result) => resolve(result), "image/jpeg", quality);
        });

        if (!candidate) continue;
        bestBlob = candidate;
        if (candidate.size <= maxBytes) {
          return candidate;
        }
      }

      if (Math.min(width, height) <= MIN_DIMENSION) break;

      width = Math.max(MIN_DIMENSION, Math.floor(width * 0.85));
      height = Math.max(MIN_DIMENSION, Math.floor(height * 0.85));
    }

    if (bestBlob.size > maxBytes) {
      throw new Error("Could not compress image to 3.5MB. Please upload a smaller image.");
    }

    return bestBlob;
  }

  async uploadBlobToCloudinary(blob, fileName = "profile-model.jpg") {
    const formData = new FormData();
    formData.append("file", blob, fileName);
    formData.append("folder", "warehouse_uploads");

    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      let errorMessage = `Upload failed with status ${uploadResponse.status}`;
      try {
        const contentType = uploadResponse.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const errorData = await uploadResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const text = await uploadResponse.text();
          errorMessage = text.includes("Cannot POST")
            ? "Backend endpoint /api/upload not found. Please restart the server."
            : text.substring(0, 120) || errorMessage;
        }
      } catch (_error) {
        // keep fallback error message
      }
      throw new Error(errorMessage);
    }

    const uploadResult = await uploadResponse.json();
    if (!uploadResult?.url) {
      throw new Error("Upload succeeded but no image URL was returned.");
    }

    return uploadResult.url;
  }

  async resolveProfilePhotoUrl(photoUrl, fileName = "profile-model.jpg") {
    if (!photoUrl || !this.isDataImageUrl(photoUrl)) {
      return photoUrl;
    }

    const response = await fetch(photoUrl);
    const originalBlob = await response.blob();
    const compressedBlob = await this.compressImageBlobToMaxBytes(originalBlob, MAX_PROFILE_IMAGE_BYTES);
    console.log(
      "📦 Profile image size before/after compression:",
      `${(originalBlob.size / (1024 * 1024)).toFixed(2)}MB -> ${(compressedBlob.size / (1024 * 1024)).toFixed(2)}MB`
    );

    return this.uploadBlobToCloudinary(compressedBlob, fileName);
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
      const docSnap = await getDoc(userDocRef);
      const existingProfile = docSnap.exists() ? (docSnap.data().profile || {}) : {};

      const modelName = this.normalizeModelName(profileData.modelName || existingProfile.modelName || "");
      const inputPhotoUrl = profileData.photoUrl || existingProfile.photoUrl || "";

      if (!modelName) {
        throw new Error("Please name your model using alphabets only.");
      }

      if (!inputPhotoUrl) {
        throw new Error("Please add a photo before saving your model.");
      }

      const safeFileBase = modelName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "model";
      const photoUrl = await this.resolveProfilePhotoUrl(inputPhotoUrl, `${safeFileBase}.jpg`);

      const existingSavedModelsRaw = Array.isArray(existingProfile.savedModels)
        ? [...existingProfile.savedModels]
        : existingProfile.photoUrl
          ? [{
              id: existingProfile.modelName ? existingProfile.modelName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "legacy-model",
              name: existingProfile.modelName || "Model 1",
              photoUrl: existingProfile.photoUrl,
              createdAt: existingProfile.createdAt || new Date(),
              updatedAt: existingProfile.updatedAt || new Date(),
            }]
          : [];

      const existingSavedModels = [];
      for (let index = 0; index < existingSavedModelsRaw.length; index += 1) {
        const model = existingSavedModelsRaw[index];
        if (!model?.photoUrl) continue;

        // eslint-disable-next-line no-await-in-loop
        const resolvedModelPhotoUrl = await this.resolveProfilePhotoUrl(
          model.photoUrl,
          `${String(model.name || `model-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`
        );

        existingSavedModels.push({
          ...model,
          id: model.id || `${String(model.name || `model-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
          name: model.name || `Model ${index + 1}`,
          photoUrl: resolvedModelPhotoUrl,
          updatedAt: model.updatedAt || new Date(),
        });
      }

      const normalizedModelName = modelName.toLowerCase();
      const existingModelIndex = existingSavedModels.findIndex((item) =>
        String(item?.name || "").trim().toLowerCase() === normalizedModelName
      );

      const nextModelEntry = {
        id: existingModelIndex >= 0
          ? existingSavedModels[existingModelIndex].id || normalizedModelName
          : `${normalizedModelName}-${Date.now()}`,
        name: modelName,
        photoUrl,
        createdAt: existingModelIndex >= 0
          ? existingSavedModels[existingModelIndex].createdAt || new Date()
          : new Date(),
        updatedAt: new Date(),
      };

      let savedModels = [...existingSavedModels];

      if (existingModelIndex >= 0) {
        savedModels[existingModelIndex] = nextModelEntry;
      } else {
        if (savedModels.length >= 4) {
          throw new Error("You can save up to 4 models. Delete one before adding a new model.");
        }

        savedModels.push(nextModelEntry);
      }

      await setDoc(
        userDocRef,
        {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          role: userCollection === "B2BBulkOrders_users" ? "B2B" : "B2C",
          profile: {
            ...existingProfile,
            ...profileData,
            modelName,
            photoUrl,
            savedModels,
            updatedAt: new Date(),
          },
          updatedAt: new Date(),
        },
        { merge: true }
      );

      console.log("✅ Profile saved successfully");
      return {
        ...existingProfile,
        ...profileData,
        modelName,
        photoUrl,
        savedModels,
        updatedAt: new Date(),
      };
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

      const normalizedType = this.normalizeDressTypeKey(dressType);

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

      if (tryOnResults[normalizedType]) {
        console.log(`✅ Found exact match for ${normalizedType}`);
        return tryOnResults[normalizedType];
      }

      // Legacy keys can exist with plurals/spelling variants. Match within the same normalized bucket only.
      for (const [key, value] of Object.entries(tryOnResults)) {
        if (this.normalizeDressTypeKey(key) === normalizedType) {
          console.log(`✅ Found normalized key match: ${key} -> ${normalizedType}`);
          return value;
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

  /** Delete one saved model by id or name */
  async deleteSavedModel(modelIdOrName, overrideCollection = null) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("User must be authenticated");
      if (!modelIdOrName) throw new Error("Please select a model to delete.");

      const userCollection = overrideCollection || await this.getCurrentUserCollection();
      const userDocRef = doc(this.db, userCollection, user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        throw new Error("No profile document found.");
      }

      const currentProfile = docSnap.data().profile || {};
      const savedModels = Array.isArray(currentProfile.savedModels) ? currentProfile.savedModels : [];

      if (!savedModels.length) {
        throw new Error("No saved models found to delete.");
      }

      const target = String(modelIdOrName).toLowerCase().trim();
      const remainingModels = savedModels.filter((item) => {
        const id = String(item?.id || "").toLowerCase().trim();
        const name = String(item?.name || "").toLowerCase().trim();
        return id !== target && name !== target;
      });

      if (remainingModels.length === savedModels.length) {
        throw new Error("Selected model was not found.");
      }

      const nextPrimaryModel = remainingModels[0] || null;
      const updatePayload = {
        "profile.savedModels": remainingModels,
        "profile.updatedAt": new Date(),
        updatedAt: new Date(),
      };

      if (nextPrimaryModel) {
        updatePayload["profile.modelName"] = nextPrimaryModel.name || "";
        updatePayload["profile.photoUrl"] = nextPrimaryModel.photoUrl || "";
      } else {
        updatePayload["profile.modelName"] = deleteField();
        updatePayload["profile.photoUrl"] = deleteField();
      }

      await updateDoc(userDocRef, updatePayload);

      console.log("✅ Saved model deleted successfully");
      return remainingModels;
    } catch (error) {
      console.error("❌ Error deleting saved model:", error);
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