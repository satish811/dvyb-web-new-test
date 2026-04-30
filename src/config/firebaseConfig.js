/**
 * Firebase Configuration File
 * ----------------------------
 * This file initializes Firebase using environment variables
 * imported from the Vite environment. It ensures that Firebase
 * is initialized only once and exports the commonly used
 * Firebase services for use across the application.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import envConfig from "./envConfig";

const firebaseConfig = {
  apiKey: envConfig.firebase.apiKey,
  authDomain: envConfig.firebase.authDomain,
  databaseURL: envConfig.firebase.databaseURL,
  projectId: envConfig.firebase.projectId,
  storageBucket: envConfig.firebase.storageBucket,
  messagingSenderId: envConfig.firebase.messagingSenderId,
  appId: envConfig.firebase.appId,
  measurementId: envConfig.firebase.measurementId,
};

// Validate config (prevents partial init leading to internal-error)
const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];

for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    throw new Error(`Missing Firebase config key: ${key}. Check envConfig.`);
  }
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize App Check
if (typeof window !== 'undefined') {
  try {
    // Use debug token in development (localhost)
    if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN) {
      // Accept a real debug token or the special string "true" to generate one.
      self.FIREBASE_APPCHECK_DEBUG_TOKEN =
        import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN === "true"
          ? true
          : import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN;
      console.log(
        "🔧 App Check Debug Mode enabled for localhost",
        self.FIREBASE_APPCHECK_DEBUG_TOKEN === true
          ? "(generate new debug token)"
          : self.FIREBASE_APPCHECK_DEBUG_TOKEN
      );
    }
    
    // Initialize App Check with ReCAPTCHA (works in both debug and production)
    if (import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true
      });
      console.log("✅ Firebase App Check initialized");
    }
  } catch (error) {
    console.warn("⚠️ App Check initialization failed:", error);
  }
}

export const auth = getAuth(app);

try {
  await setPersistence(auth, browserLocalPersistence);
  console.log("Firebase persistence set to local."); // Optional log
} catch (error) {
  console.error("Failed to set auth persistence:", error);
  // Fallback to default (session) if needed
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulator if on localhost
// Connect to emulator if on localhost AND VITE_USE_EMULATOR is set
if (location.hostname === "localhost" && import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectFunctionsEmulator(functions, "localhost", 5001);
  console.log("🔥 Connected to Functions Emulator");
} else if (location.hostname === "localhost") {
  console.log("🌍 Connected to Production Functions (Localhost)");
}

export { app };

export default app;








