import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cloudinary from "./cloudinaryConfig.js";
import crypto from "crypto";

/**
 * Simple Express server to handle file uploads to Cloudinary
 * Uses multer for handling multipart/form-data
 * Exposes a single POST /upload endpoint
 * Expects a 'file' field in the form data
 */

const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /upload
 * Expects a file in the 'file' field of the form data
 * Uploads the file to Cloudinary and returns the secure URL
 */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileBuffer = `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(fileBuffer, {
      folder: "warehouse_uploads",
    });
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Start the server
 */
const PORT = process.env.VITE_SERVER_PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// api/tryon.js (at root level, NOT in src/)

const FASHN_API_URL = "https://api.fashn.ai/v1";
const AUTH_HEADER = "Bearer fa-kGtS5NyR8vMR-KUYaqFfjeoCM7xBu9BI6aunh";

export default async function handler(req, res) {
  // Set proper headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).json({ message: "OK" });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { modelImage, garmentImage, category } = req.body || {};

    // Validation
    if (!modelImage || !garmentImage) {
      return res.status(400).json({ error: "Both modelImage and garmentImage URLs are required." });
    }

    console.log(" Received request:");
    console.log("   Model Image:", modelImage);
    console.log("   Garment Image:", garmentImage);
    console.log("   Category:", category || "auto");

    // Valid Fashn API categories: "tops", "bottoms", "one-pieces", "auto"
    const garmentCategory = category || "auto";

    console.log("🔄 Calling Fashn API with category:", garmentCategory);

    // Step 1: Call the Fashn API `/run` endpoint with category
    const runResponse = await fetch(`${FASHN_API_URL}/run`, {
      method: "POST",
      headers: {
        Authorization: AUTH_HEADER,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_name: "tryon-v1.6",
        inputs: {
          model_image: modelImage,
          garment_image: garmentImage,
          category: garmentCategory, // Now sending valid category
        },
      }),
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error(" Fashn API error:", errorText);
      return res.status(500).json({ error: `Fashn API error: ${runResponse.status}` });
    }

    const runData = await runResponse.json();
    const predictionId = runData.id;

    if (!predictionId) {
      return res.status(500).json({ error: "No prediction ID received from Fashn API" });
    }

    console.log(` Prediction started with ID: ${predictionId}`);

    // Step 2: Poll the `/status/:id` endpoint
    for (let i = 0; i < 15; i++) {
      console.log(` Polling attempt ${i + 1}/15 for prediction ${predictionId}`);

      const statusResponse = await fetch(`${FASHN_API_URL}/status/${predictionId}`, {
        headers: {
          Authorization: AUTH_HEADER,
        },
      });

      if (!statusResponse.ok) {
        console.error(` Status check error: ${statusResponse.status}`);
        return res.status(500).json({ error: `Status check error: ${statusResponse.status}` });
      }

      const statusData = await statusResponse.json();
      console.log(` Status: ${statusData.status}`);

      if (statusData.status === "completed") {
        console.log(" Try-on completed successfully!");
        return res.status(200).json({
          output: statusData.output,
          category: garmentCategory,
        });
      }

      if (statusData.status === "failed") {
        console.error(" Try-on failed:", statusData.error);
        return res.status(500).json({ error: statusData.error || "Try-on failed." });
      }

      // Wait for 3 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // Timeout case
    console.log(" Try-on timed out after 15 attempts");
    return res.status(504).json({ error: "Try-on timed out. Please try again." });
  } catch (err) {
    console.error(" TryOn error:", err);
    return res.status(500).json({ error: err.message || "Something went wrong." });
  }
}
