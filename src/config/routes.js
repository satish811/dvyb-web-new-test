// src/config/envConfig.js

/**
 * Vite environment variables are accessed using import.meta.env
 * (dotenv is not needed in frontend builds)
 */

export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || "Dvyb Web",
    mode: import.meta.env.MODE || "development",
    baseUrl: import.meta.env.VITE_BASE_URL || "http://localhost:5173",
    deepLink: import.meta.env.VITE_DEEP_LINK || "",
    timeZone: import.meta.env.VITE_TIMEZONE || "Asia/Kolkata",
  },

  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
};
