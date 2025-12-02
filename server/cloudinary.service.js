/**
 * Cloudinary Service
 * ------------------
 * Class-based service for Cloudinary operations
 * Uses Singleton pattern
 */

import cloudinary from "./cloudinaryConfig.js";

class CloudinaryOperationalService {
  static instance = null;

  static getInstance() {
    if (!CloudinaryOperationalService.instance) {
      CloudinaryOperationalService.instance = new CloudinaryOperationalService();
    }
    return CloudinaryOperationalService.instance;
  }

  constructor() {
    this.cloudinary = cloudinary;
  }

  /**
   * Upload file buffer to Cloudinary
   * @param {Buffer} buffer - File buffer to upload
   * @param {string} folder - Cloudinary folder name
   * @param {Object} options - Additional upload options
   * @returns {Promise<Object>} - Cloudinary upload result
   */
  async uploadFile(buffer, folder, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: "auto",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
        ...options,
      };

      const uploadStream = this.cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload failed:", error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            console.log("✅ Cloudinary upload successful:", result.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload image file
   * @param {Buffer} buffer - Image buffer
   * @param {string} folder - Folder path
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Upload result
   */
  async uploadImage(buffer, folder, options = {}) {
    return this.uploadFile(buffer, folder, {
      resource_type: "image",
      ...options,
    });
  }

  /**
   * Upload video file
   * @param {Buffer} buffer - Video buffer
   * @param {string} folder - Folder path
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Upload result
   */
  async uploadVideo(buffer, folder, options = {}) {
    return this.uploadFile(buffer, folder, {
      resource_type: "video",
      ...options,
    });
  }

  /**
   * Delete asset from Cloudinary
   * @param {string} publicId - Public ID of the asset
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteFile(publicId) {
    try {
      const result = await this.cloudinary.uploader.destroy(publicId);
      console.log("✅ Cloudinary deletion successful:", publicId);
      return result;
    } catch (error) {
      console.error("❌ Cloudinary deletion failed:", error);
      throw new Error(`Cloudinary deletion failed: ${error.message}`);
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param {string} url - Cloudinary URL
   * @returns {string} - Public ID
   */
  getPublicIdFromUrl(url) {
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return matches ? matches[1] : null;
  }

  /**
   * Generate optimized image URL with transformations
   * @param {string} publicId - Public ID of the image
   * @param {Object} transformations - Cloudinary transformations
   * @returns {string} - Optimized URL
   */
  generateOptimizedUrl(publicId, transformations = {}) {
    const defaultTransformations = {
      quality: "auto",
      fetch_format: "auto",
    };

    return this.cloudinary.url(publicId, {
      ...defaultTransformations,
      ...transformations,
    });
  }
}

/**
 * Export singleton instance
 */
export const cloudinaryService = CloudinaryOperationalService.getInstance();
export default cloudinaryService;
