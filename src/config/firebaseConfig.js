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
import { getFunctions } from "firebase/functions";
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
      // Enable debug mode for local testing
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN;
      console.log("🔧 App Check Debug Mode enabled for localhost");
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

export { app };

export default app;
