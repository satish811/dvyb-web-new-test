/**
 * Authentication service file
 * ------------------------------
 * Class based approach
 * ------------------------------
 * Handles user registration, login, Google sign-in, and logout
 * Supports both email and phone number authentication
 * Uses Firebase Authentication and Firestore
 */

import { B2CUserModel, B2BUserModel } from "../models";
import { auth, db, envConfig } from "../config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";

class AuthenticationService {
  static instance = null;

  static getInstance() {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  constructor() {
    this.auth = auth;
    this.db = db;
    this.googleProvider = new GoogleAuthProvider();

    this.b2cCollection = envConfig.firebaseStorage.b2cCollection;
    this.b2bCollection = envConfig.firebaseStorage.b2bCollection;
    this.b2cRole = envConfig.userRole.b2cUserRole;
    this.b2bRole = envConfig.userRole.b2bUserRole;
  }

  /** Converting phone → dummy email */
  phoneToEmail(phone) {
    return `${phone.replace(/[^0-9+]/g, "")}@phone.dvyb.com`;
  }

  /** Saving Firebase token */
  async saveAuthToken(user) {
    try {
      const token = await user.getIdToken();
      localStorage.setItem("authToken", token);
      window.dispatchEvent(new Event("authChange"));
    } catch (error) {
      console.error("Token save error:", error);
    }
  }

  /** Register user (Email or Phone) */
  async register(input, password, roleType, extraData = {}) {
    const isPhone = input.startsWith("+");
    const email = isPhone ? this.phoneToEmail(input) : input;

    try {
      const { user } = await createUserWithEmailAndPassword(this.auth, email, password);

      const isB2B = roleType === "B2B";
      const collection = isB2B ? this.b2bCollection : this.b2cCollection;

      /**
       * Create structured user data using models
       * ------------------------------------------------------------------------------
       * Using B2BUserModel for B2B users and B2CUserModel for b2c users
       * This ensures consistent data structure and easy future modifications
       * --------------------------------------------------------------------
       */
      const userData = isB2B
        ? new B2BUserModel({
            uid: user.uid,
            email: isPhone ? null : input,
            phoneNumber: isPhone ? input : null,
            ...extraData,
          })
        : new B2CUserModel({
            uid: user.uid,
            email: isPhone ? null : input,
            phoneNumber: isPhone ? input : null,
            ...extraData,
          });

      await setDoc(doc(db, collection, user.uid), { ...userData });

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async login(email, password) {
    try {
      // Add validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user || !user.uid) {
        throw new Error("Login failed - no user data returned");
      }

      const userRoleInfo = await this.getUserRole(user.uid);

      if (!userRoleInfo) {
        throw new Error("User data not found in any collection");
      }

      return {
        success: true,
        user: { ...user, ...userRoleInfo.data },
        role: userRoleInfo.role,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async getUserRole(uid) {
    try {
      const [b2bSnap, b2cSnap] = await Promise.all([
        getDoc(doc(db, "B2BBulkOrders_users", uid)),
        getDoc(doc(db, "b2c_users", uid)),
      ]);

      if (b2bSnap.exists()) {
        return { role: "B2B", data: b2bSnap.data() };
      } else if (b2cSnap.exists()) {
        return { role: "B2C", data: b2cSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  }

  /** Logout */
  async logout() {
    try {
      await signOut(this.auth);
      localStorage.removeItem("authToken");
      window.dispatchEvent(new Event("authChange"));
      toast.info("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.message);
    }
  }

  /** Get user details by ID (checks both B2B and B2C collections) */
  async getUserById(uid) {
    try {
      console.log("User id we get in service file", uid);
      if (!uid) {
        console.log("No user ID provided");
        return {
          success: false,
          data: null,
          error: "User ID is required",
        };
      }

      // First check B2B collection
      const b2bUserRef = doc(this.db, this.b2bCollection, uid);
      const b2bSnapshot = await getDoc(b2bUserRef);

      if (b2bSnapshot.exists()) {
        const user = b2bSnapshot.data();
        const filteredUser = {
          userId: user.uid || user.id,
          username: user.username || "",
          email: user.email || "",
          role: user.role || this.b2bRole,
        };
        return {
          success: true,
          data: filteredUser,
        };
      }

      // Then check B2C collection
      const b2cUserRef = doc(this.db, this.b2cCollection, uid);
      const b2cSnapshot = await getDoc(b2cUserRef);

      if (b2cSnapshot.exists()) {
        const user = b2cSnapshot.data();
        const filteredUser = {
          userId: user.uid || user.id,
          username: user.username || user.name || "",
          email: user.email || "",
          role: user.role || this.b2cRole,
        };
        return {
          success: true,
          data: filteredUser,
        };
      }

      console.log("User not found in both B2B and B2C collections for UID:", uid);
      return {
        success: false,
        data: null,
        error: "User not found",
      };
    } catch (error) {
      console.error("Get user error:", error);
      return {
        success: false,
        data: null,
        error: error.message || "Failed to fetch user",
      };
    }
  }

  /** Google Login for B2C */
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;

      // Check if user already exists in B2C collection
      const userDoc = await getDoc(doc(this.db, this.b2cCollection, user.uid));

      let userData;
      if (userDoc.exists()) {
        const existingData = userDoc.data();
        userData = {
          ...existingData,
          collection: this.b2cCollection,
          role: "B2C",
          route: "/",
        };
        await this.saveAuthToken(user);
        return { user, userData };
      } else {
        // Create new B2C user model
        const newUserModel = new B2CUserModel({
          uid: user.uid,
          email: user.email,
          name: user.displayName || "",
          profilePic: user.photoURL || "",
        });

        const userObject = JSON.parse(JSON.stringify(newUserModel));
        await setDoc(doc(this.db, this.b2cCollection, user.uid), userObject);

        userData = {
          ...userObject,
          collection: this.b2cCollection,
          role: "B2C",
          route: "/",
        };
        await this.saveAuthToken(user);
        return { user, userData };
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /** Translate Firebase error codes to readable messages */
  getErrorMessage(code) {
    const errors = {
      "auth/email-already-in-use": "This email is already registered. Please login instead.",
      "auth/invalid-email": "Invalid email address format.",
      "auth/weak-password": "Password is too weak. (Min 6 characters)",
      "auth/wrong-password": "Incorrect password.",
      "auth/user-not-found": "No account found with this email.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/popup-closed-by-user": "Login popup was closed before completion.",
      "auth/cancelled-popup-request": "Login process was cancelled.",
    };
    return errors[code] || "Authentication failed. Please try again.";
  }
}

/**
 * Export a single instance (Singleton)
 */
export const authService = AuthenticationService.getInstance();
export default authService;
