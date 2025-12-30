// services/otpService.js
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import app from "../config/firebaseConfig";

const auth = getAuth(app);
let recaptchaVerifier = null;

// Only for local testing - remove in production
if (process.env.NODE_ENV === "development") {
  auth.settings.appVerificationDisabledForTesting = true;
}

// Detect user type based on route or other criteria
const detectUserType = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userType = urlParams.get("usertype");

  if (userType === "b2b") {
    return {
      collection: "B2BBulkOrders_users",
      role: "B2B",
      route: "/usertype=b2b",
    };
  } else {
    return {
      collection: "b2c_users",
      role: "B2C",
      route: "/",
    };
  }
};

// Create user collection after OTP verification
const createUserCollection = async (user, phoneNumber) => {
  try {
    const userData = {
      uid: user.uid,
      phoneNumber: phoneNumber,
      email: user.email || null,
      name: "",
      address: "",
      wishlist: [],
      orders: [],
      gender: "",
      dob: "",
      profilePic: "",
      role: userType.role,
      userType: userType.role.toLowerCase(),
      extraData: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Try to create in b2c_users collection
    const userDocRef = doc(db, userType.collection, user.uid);
    await setDoc(userDocRef, userData);

    console.log(`✅ ${userType.role} User collection created successfully`);
    return { ...userData, collection: userType.collection, route: userType.route };
  } catch (error) {
    console.error("❌ Error creating user collection:", error);
    throw error;
  }
};

// Check if user collection exists
const checkUserCollectionExists = async (userId) => {
  try {
    const collections = ["b2c_users", "B2BBulkOrders_users"];

    for (const collection of collections) {
      const userDoc = await getDoc(doc(db, collection, userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          exists: true,
          collection: collection,
          role: data.role,
          userData: data,
        };
      }
    }
    return { exists: false };
  } catch (error) {
    console.error("Error checking user collection:", error);
    return { exists: false };
  }
};

export const setupRecaptcha = (containerId = "recaptcha-container") => {
  // Clear existing verifier
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Error clearing recaptcha:", e);
    }
    recaptchaVerifier = null;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    throw new Error(`reCAPTCHA container '${containerId}' not found in DOM`);
  }

  try {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: (response) => {
        console.log("reCAPTCHA solved", response);
      },
      "expired-callback": () => {
        console.warn("reCAPTCHA expired");
        if (recaptchaVerifier) {
          try {
            recaptchaVerifier.render().then((widgetId) => {
              window.grecaptcha.reset(widgetId);
            });
          } catch (e) {
            console.error("Error resetting reCAPTCHA:", e);
          }
        }
      },
    });

    return recaptchaVerifier;
  } catch (error) {
    console.error("Error setting up reCAPTCHA:", error);
    throw error;
  }
};

export const sendOtp = async (phoneNumber) => {
  if (!recaptchaVerifier) {
    throw new Error("reCAPTCHA not set up. Call setupRecaptcha() first.");
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    console.error("Error sending OTP:", error);

    // Reset reCAPTCHA on error
    if (recaptchaVerifier) {
      try {
        const widgetId = await recaptchaVerifier.render();
        window.grecaptcha.reset(widgetId);
      } catch (resetError) {
        console.error("Error resetting reCAPTCHA:", resetError);
      }
    }

    throw error;
  }
};

export const verifyOtp = async (confirmationResult, otp, phoneNumber) => {
  if (!confirmationResult) {
    throw new Error("No confirmation result provided");
  }

  try {
    console.log("Verifying OTP...");
    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    // ✅ CHECK IF USER EXISTS AND CREATE COLLECTION
    const userCheck = await checkUserCollectionExists(user.uid);

    let userData;
    if (!userCheck.exists) {
      console.log("🆕 Creating user collection for new OTP user...");
      userData = await createUserCollection(user, phoneNumber);
    } else {
      console.log("✅ User collection already exists:", userCheck.collection);
      userData = {
        ...userCheck.userData,
        collection: userCheck.collection,
        route: userCheck.role === "B2B" ? "/usertype=b2b" : "/",
      };
    }

    // Clean up
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        console.warn("Error clearing recaptcha:", e);
      }
      recaptchaVerifier = null;
    }

    return { user, userData };
  } catch (error) {
    console.error("OTP verification failed:", error);
    throw error;
  }
};

// Cleanup function for unmounting
export const cleanupRecaptcha = () => {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Error during cleanup:", e);
    }
    recaptchaVerifier = null;
  }

  const container = document.getElementById("recaptcha-container");
  if (container) {
    container.innerHTML = "";
  }
};
