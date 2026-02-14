import { B2BUserModel } from "../models/B2BUserModel";
import { auth, db } from "../config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

class B2BAuthService {
  static instance = null;

  static getInstance() {
    if (!B2BAuthService.instance) {
      B2BAuthService.instance = new B2BAuthService();
    }
    return B2BAuthService.instance;
  }

  constructor() {
    if (B2BAuthService.instance) {
      throw new Error("Use B2BAuthService.getInstance() instead of new B2BAuthService()");
    }
  }

  // -----------------------------
  // Check if FIELD is unique
  // -----------------------------
  async isFieldUnique(field, value) {
    const q = query(collection(db, "B2BBulkOrders_users"), where(field, "==", value));

    const snapshot = await getDocs(q);
    return snapshot.empty;
  }

  // --------------------------------
  // Validate all unique fields
  // --------------------------------
  async validateUniqueFields({ username, mobile, pan, aadhaar }) {
    console.log("&&&&&&&&&&&&&&&&&&& The data we get from frontend", {
      username,
      mobile,
      pan,
      aadhaar,
    });

    if (!(await this.isFieldUnique("username", username)))
      throw new Error("Username already exists");

    if (!(await this.isFieldUnique("mobileNo", mobile)))
      throw new Error("Mobile number already exists");

    if (!(await this.isFieldUnique("pan", pan))) throw new Error("PAN already exists");

    if (!(await this.isFieldUnique("aadhaar", aadhaar))) throw new Error("Aadhaar already exists");
  }

  // -----------------------------
  // Register B2B User
  // -----------------------------
  async registerB2B(userData) {
    let firebaseUser = null;
    try {
      const { email, password } = userData;

      if (!email || !password) throw new Error("Email & Password required");

      // 1. Create Auth User FIRST (to get "isAuthenticated" permission)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;

      // 2. NOW Validate Unique Fields (since we are authenticated)
      // 2. NOW Validate Unique Fields (since we are authenticated)
      try {
        await this.validateUniqueFields(userData);
      } catch (validationError) {
        // If validation fails, delete the created auth user
        console.error("Validation failed, deleting user:", validationError);
        if (firebaseUser) await firebaseUser.delete();
        throw validationError; // Re-throw to be caught by outer catch
      }

      const userModel = new B2BUserModel({
        ...userData,
        uid: firebaseUser.uid,
      });

      const userObject = JSON.parse(JSON.stringify(userModel));

      // 3. Save to Firestore
      await setDoc(doc(db, "B2BBulkOrders_users", firebaseUser.uid), userObject);

      return {
        success: true,
        user: userModel,
      };
    } catch (error) {
      console.error("B2B Registration error:", error);
      return Promise.reject(this.getErrorMessage(error.message, error.code));
    }
  }

  // ---------------------------------------------------
  // LOGIN
  // ---------------------------------------------------

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      // Load B2B data
      const userDoc = await getDoc(doc(db, "B2BBulkOrders_users", user.uid));

      if (!userDoc.exists()) {
        throw new Error("User not found in B2B records.");
      }

      return {
        success: true,
        user: { ...user, ...userDoc.data() },
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(this.getErrorMessage(error.code) || error.message);
    }
  }

  // --------------------------------------------------
  // Save Firebase ID Token in LocalStorage
  // --------------------------------------------------
  async saveAuthToken(user) {
    try {
      const token = await user.getIdToken();
      localStorage.setItem("authToken", token);

      // Notify app that auth status changed
      window.dispatchEvent(new Event("authChange"));
    } catch (error) {
      console.error("Token error:", error);
    }
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------
  async logout() {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
      window.dispatchEvent(new Event("authChange"));

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Failed to logout");
    }
  }

  // ---------------------------------------------------
  // CLEAN FIREBASE ERRORS
  // ---------------------------------------------------
  getErrorMessage(code, fallback) {
    const errors = {
      "auth/email-already-in-use": "Email is already registered",
      "auth/invalid-email": "Invalid email address",
      "auth/weak-password": "Weak password, must be stronger",

      // Custom uniqueness errors
      USERNAME_EXISTS: "Username already exists",
      MOBILE_EXISTS: "Mobile number already exists",
      PAN_EXISTS: "PAN already exists",
      AADHAAR_EXISTS: "Aadhaar already exists",
    };

    return errors[code] || fallback || "Registration failed";
  }

  // --------------------------------------------------
  // GET B2B USER DETAILS BY UID
  // --------------------------------------------------
  async getUserById(uid) {
    try {
      console.log("User id we get in service file", uid);
      if (!uid) throw new Error("User ID is required");

      const userRef = doc(db, "B2BBulkOrders_users", uid);
      let snapshot;

      try {
        snapshot = await getDoc(userRef);
      } catch (err) {
        if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
          console.log("Permission denied fetching B2B user, assuming not B2B.");
          return { success: false, data: null };
        }
        throw err;
      }

      console.log("The snapshot data we get", snapshot);

      if (!snapshot.exists()) {
        return { success: false, data: null };
      }

      const user = snapshot.data();

      // Return only selected fields
      const filteredUser = {
        userId: user.uid || user.id || "",
        username: user.username || "",
        email: user.email || "",
        role: user.role || "",
      };

      return {
        success: true,
        data: filteredUser,
      };
    } catch (error) {
      console.error("Get user error:", error);
      // Return false instead of throwing to prevent app crash on role check
      return { success: false, error: error.message };
    }
  }

  async getUserCompleteProfile(uid) {
    try {
      console.log("Getting user complete profile for:", uid);
      if (!uid) throw new Error("User ID is required");

      let user = null;
      let userRole = "";
      let collectionName = "";

      // First try B2B collection
      try {
        const b2bUserRef = doc(db, "B2BBulkOrders_users", uid);
        const b2bSnapshot = await getDoc(b2bUserRef);

        if (b2bSnapshot.exists()) {
          user = b2bSnapshot.data();
          userRole = "B2B";
          collectionName = "B2BBulkOrders_users";
          console.log("User found in B2B collection:", user);

          return {
            success: true,
            data: user,
            role: userRole,
            collection: collectionName,
          };
        }
      } catch (b2bError) {
        // Continue to B2C check if B2B check fails (e.g. permission denied)
        console.warn("B2B check skipped or failed:", b2bError.message);
      }

      // If not found in B2B or error occurred, try B2C collection
      try {
        const b2cUserRef = doc(db, "b2c_users", uid);
        const b2cSnapshot = await getDoc(b2cUserRef);

        if (b2cSnapshot.exists()) {
          user = b2cSnapshot.data();
          userRole = "b2c";
          collectionName = "b2c_users";
          console.log("User found in B2C collection:", user);

          return {
            success: true,
            data: user,
            role: userRole,
            collection: collectionName,
          };
        } else {
          throw new Error("User not found in both B2B and B2C collections");
        }
      } catch (b2cError) {
        throw new Error(`User search failed: ${b2cError.message}`);
      }

      // Return all user data as is
      return {
        success: true,
        data: user,
        role: userRole,
        collection: collectionName,
      };
    } catch (error) {
      console.error("Get user complete profile error:", error);
      throw new Error(error.message || "Failed to fetch user profile");
    }
  }

  // -----------------------------
  // GOOGLE LOGIN FOR B2B ONLY
  // -----------------------------
  async loginWithGoogle(extraData = {}) {
    try {
      console.log("The google login API called");
      const provider = new GoogleAuthProvider();
      console.log("The provider we get", provider);
      provider.setCustomParameters({
        prompt: "select_account",
      });

      provider.addScope("https://www.googleapis.com/auth/userinfo.email");

      const result = await signInWithPopup(auth, provider);
      console.log("The result we get", result);

      const user = result.user;

      const userDoc = await getDoc(doc(db, "B2BBulkOrders_users", user.uid));
      console.log("THe user document we get", userDoc);

      if (userDoc.exists()) {
        await this.saveAuthToken(user);
        return {
          success: true,
          user: { ...user, ...userDoc.data() },
          isNewUser: false,
        };
      } else {
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "",
          photo: user.photoURL || "",
          role: "B2B",
          createdAt: new Date(),
          ...extraData,
        };

        await setDoc(doc(db, "B2BBulkOrders_users", user.uid), userData);

        await this.saveAuthToken(user);
        return {
          success: true,
          user: { ...user, ...userData },
          isNewUser: true,
        };
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw new Error(this.getGoogleErrorMessage(error.code) || "Google login failed");
    }
  }

  // -----------------------------
  // GOOGLE ERROR MESSAGES
  // -----------------------------
  getGoogleErrorMessage(code) {
    const errors = {
      "auth/account-exists-with-different-credential":
        "An account already exists with the same email but different sign-in method",
      "auth/popup-blocked": "Sign-in popup was blocked by the browser",
      "auth/popup-closed-by-user": "Sign-in popup was closed before completing",
      "auth/unauthorized-domain": "This domain is not authorized for Google sign-in",
    };
    return errors[code];
  }
}

export default B2BAuthService.getInstance();