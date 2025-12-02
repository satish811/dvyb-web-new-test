import { envConfig } from "../config";

class FashnTryOnOperationalService {
  static #instance = null;

  constructor() {
    if (FashnTryOnOperationalService.#instance) return FashnTryOnOperationalService.#instance;

    this.baseUrl = envConfig.fashnApi.baseUrl;
    this.authHeader = `Bearer ${envConfig.fashnApi.authHeader}`;

    if (!this.baseUrl || !this.authHeader) {
      throw new Error("❌ Missing Fashn API configuration");
    }

    FashnTryOnOperationalService.#instance = this;
  }

  /**
   * Start Try-On Task
   */
  async startTryOn(modelImage, garmentImage, category = "auto") {
    const payload = {
      model_name: "tryon-v1.6",
      inputs: {
        model_image: modelImage,
        garment_image: garmentImage,
        category,
      },
    };

    const response = await fetch(`${this.baseUrl}/run`, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Fashn API error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    if (!data.id) throw new Error("No prediction ID received from Fashn API");

    return data.id;
  }

  /**
   * Poll for Try-On Status
   */
  async pollStatus(predictionId, maxAttempts = 15, intervalMs = 3000) {
    for (let i = 0; i < maxAttempts; i++) {
      const statusResponse = await fetch(`${this.baseUrl}/status/${predictionId}`, {
        headers: { Authorization: this.authHeader },
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const data = await statusResponse.json();

      if (data.status === "completed") return data;
      if (data.status === "failed") throw new Error(data.error || "Try-on failed");

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error("Try-on timed out after multiple attempts");
  }
}

export const fashnService = new FashnTryOnOperationalService();
