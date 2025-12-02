/**
 * Vite environment variables are accessed using import.meta.env
 * (dotenv is not needed in frontend builds)
 */

const getEnvVar = (key, required = true) => {
  const value = import.meta.env[key];

  if (required && (value === undefined || value === null || value === "")) {
    throw new Error(`❌ Missing required environment variable: ${key}
Please check your .env or .env.example file.`);
  }

  return value;
};

const envConfig = {
  app: {
    serverPort: getEnvVar("VITE_SERVER_PORT"),
    name: getEnvVar("VITE_APP_NAME"),
    mode: getEnvVar("VITE_MODE", false),
    developmentBaseUrl: getEnvVar("VITE_BASE_DEVELOPMENT_URL"),
    productionBaseUrl: getEnvVar("VITE_BASE_PRODUCTION_URL"),
    timeZone: getEnvVar("VITE_TIMEZONE"),
  },

  firebase: {
    apiKey: getEnvVar("VITE_FIREBASE_API_KEY"),
    authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN"),
    databaseURL: getEnvVar("VITE_FIREBASE_DATABASE_URL"),
    projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: getEnvVar("VITE_FIREBASE_APP_ID"),
    // measurementId: getEnvVar("VITE_FIREBASE_MEASUREMENT_ID"),
  },

  cloudinary: {
    name: getEnvVar("VITE_CLOUDINARY_CLOUD_NAME"),
    apiKey: getEnvVar("VITE_CLOUDINARY_API_KEY"),
    apiSecret: getEnvVar("VITE_CLOUDINARY_API_SECRET"),
  },

  firebaseStorage: {
    b2cCollection: getEnvVar("VITE_FIREBASE_B2C_COLLECTION"),
    b2bCollection: getEnvVar("VITE_FIREBASE_B2B_COLLECTION"),
    productsCollection: getEnvVar("VITE_FIREBASE_PRODUCTS_COLLECTION"),
    usersCollection: getEnvVar("VITE_FIREBASE_USERS_COLLECTION"),
    ordersCollection: getEnvVar("VITE_FIREBASE_ORDERS_COLLECTION"),
    tryOnCollection: getEnvVar("VITE_FIREBASE_TRYON_COLLECTION"),
  },

  userRole: {
    b2cUserRole: getEnvVar("VITE_DEFAULT_USER_ROLE_B2C"),
    b2bUserRole: getEnvVar("VITE_DEFAULT_USER_ROLE_B2B"),
  },

  klingApi: {
    baseUrl: getEnvVar("VITE_KLING_API_BASE_URL"),
    accessKey: getEnvVar("VITE_KLING_ACCESS_KEY"),
    secretKey: getEnvVar("VITE_KLING_SECRET_KEY"),
  },

  fashnApi: {
    apiUrl: getEnvVar("VITE_FASHN_API_URL"),
    authHeader: getEnvVar("VITE_FASHN_AUTH_HEADER"),
  },
};

export default envConfig;
