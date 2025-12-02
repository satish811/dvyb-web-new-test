// /**
//  * Cloudinary Configuration Module
//  * -------------------------------
//  * This file handles only Cloudinary configuration.
//  * Upload functionality will be handled in separate service files.
//  */

// import { v2 as cloudinary } from "cloudinary";
// import { envConfig } from "./envConfig.js";

// // Validate required configuration
// const requiredConfig = {
//   name: envConfig.cloudinary?.name,
//   apiKey: envConfig.cloudinary?.apiKey,
//   apiSecret: envConfig.cloudinary?.apiSecret,
// };

// Object.entries(requiredConfig).forEach(([key, value]) => {
//   if (!value) {
//     throw new Error(`Missing required Cloudinary config: cloudinary.${key}`);
//   }
// });

// /**
//  * Initialize Cloudinary configuration using environment variables.
//  */
// cloudinary.config({
//   cloud_name: envConfig.cloudinary.name,
//   api_key: envConfig.cloudinary.apiKey,
//   api_secret: envConfig.cloudinary.apiSecret,
//   secure: true,
// });

// /**
//  * Export the configured Cloudinary instance.
//  * Services will use this instance for upload/delete operations.
//  */
// export default cloudinary;
