import axios from "axios";
import crypto from "crypto";
import { Buffer } from "buffer";
import { envConfig } from "../config";

/**
 * KlingOperationalService
 * -----------------------
 * Handles secure communication with the Kling AI API.
 * Uses Singleton pattern — only one instance is ever created.
 */
class KlingOperationalService {
  static #instance = null;

  constructor() {
    if (KlingOperationalService.#instance) return KlingOperationalService.#instance;

    this.baseUrl = envConfig.klingApi.baseUrl;
    this.accessKey = envConfig.klingApi.accessKey;
    this.secretKey = envConfig.klingApi.secretKey;

    if (!this.baseUrl || !this.accessKey || !this.secretKey) {
      throw new Error("❌ Missing Kling API credentials in environment configuration.");
    }

    KlingOperationalService.#instance = this;
  }

  /**
   * Generates a secure JWT token for Kling API authentication
   */
  generateAuthToken() {
    try {
      const header = { alg: "HS256", typ: "JWT" };
      const payload = {
        iss: this.accessKey,
        exp: Math.floor(Date.now() / 1000) + 1800, // 30 minutes expiry
        nbf: Math.floor(Date.now() / 1000) - 5,
      };

      const base64UrlEncode = (obj) =>
        Buffer.from(JSON.stringify(obj))
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "");

      const headerEncoded = base64UrlEncode(header);
      const payloadEncoded = base64UrlEncode(payload);

      const signature = crypto
        .createHmac("sha256", this.secretKey)
        .update(`${headerEncoded}.${payloadEncoded}`)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      return `${headerEncoded}.${payloadEncoded}.${signature}`;
    } catch (error) {
      console.error("❌ Kling token generation failed:", error);
      throw new Error("Failed to generate Kling API token");
    }
  }

  /**
   * Centralized request handler for any HTTP method
   */
  async request(method, endpoint, data = null) {
    const token = this.generateAuthToken();

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data,
        timeout: 60000,
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Kling API ${method.toUpperCase()} ${endpoint} failed:`, error.message);
      throw new Error(error.response?.data?.message || error.message || "Kling API request error");
    }
  }

  /**
   * Submit a new image-to-video generation task
   */
  async createVideoFromImage(imageUrl, options = {}) {
    const payload = {
      image_url: imageUrl,
      ...options,
    };

    return this.request("POST", "/videos/image2video", payload);
  }

  /**
   * Fetch the status of a task using its ID
   */
  async getTaskStatus(taskId) {
    if (!taskId) throw new Error("Task ID is required for status check");
    return this.request("GET", `/videos/image2video/${taskId}`);
  }
}

/**
 * Export a single, shared instance
 */
export const klingService = new KlingOperationalService();
