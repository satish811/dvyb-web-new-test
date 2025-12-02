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

      await setDoc(doc(db, "B2BBulkOrders_users", user.uid), userDoc);

      return {
        success: true,
        user: userDoc,
      };
    } catch (error) {
      console.error("B2B Registration error:", error);
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
}

  /**
   * Export a single instance (Singleton)
   */
  export const authService = AuthenticationService.getInstance();
  export default authService;
