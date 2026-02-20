import express from "express";
import multer from "multer";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import FormData from 'form-data';
import cloudinary from 'cloudinary';
import { GoogleAuth } from "google-auth-library";




dotenv.config();



const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

// Vertex AI Virtual Try-On (no prompting)
const VERTEX_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const VERTEX_LOCATION = process.env.GOOGLE_LOCATION || "us-central1";
const VERTEX_MODEL_ID = process.env.VERTEX_VIRTUAL_TRYON_MODEL_ID || "virtual-try-on-001";
const VERTEX_SCOPES = ["https://www.googleapis.com/auth/cloud-platform"];

let _vertexClient;
async function getVertexClient() {
  if (_vertexClient) return _vertexClient;

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  let auth;
  if (serviceAccountJson) {
    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch {
      throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON (must be valid JSON)");
    }
    auth = new GoogleAuth({ credentials, scopes: VERTEX_SCOPES });
  } else {
    auth = new GoogleAuth({ scopes: VERTEX_SCOPES });
  }

  _vertexClient = await auth.getClient();
  return _vertexClient;
}

async function generateVertexVirtualTryOn(personBase64, garmentBase64, garmentType = "upper_and_lower_body") {
  if (!VERTEX_PROJECT_ID) {
    throw new Error("Missing GOOGLE_PROJECT_ID (required for Vertex Virtual Try-On)");
  }

  const url = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/${VERTEX_MODEL_ID}:predict`;

  const requestBody = {
    instances: [
      {
        personImage: { image: { bytesBase64Encoded: personBase64 } },
        productImages: [{ image: { bytesBase64Encoded: garmentBase64 } }],
        productType: "APPAREL",
      },
    ],
    parameters: {
      garmentType,
      sampleCount: 1,
      preserveGarmentShape: true,
      poseAlignment: true,
      outputStyle: "realistic",
    },
  };

  const client = await getVertexClient();
  const response = await client.request({
    url,
    method: "POST",
    data: requestBody,
    timeout: 120000,
  });

  const predictions = response?.data?.predictions || [];
  const first = predictions[0] || {};
  const bytes = first.bytesBase64Encoded || first.image?.bytesBase64Encoded;
  if (!bytes) {
    throw new Error("Vertex Virtual Try-On returned no image bytes");
  }
  return bytes;
}

const MINIMAX_BASE_URL = "https://api.minimax.io/v1";
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY; // Add to your .env file

const getMinimaxHeaders = () => ({
  Authorization: `Bearer ${MINIMAX_API_KEY}`,
  "Content-Type": "application/json",
});


function getApiKeyByOutfit(outfitType) {
  //  return GEMINI_API_KEY;

  console.log(`🔍 Getting API key for: ${outfitType}`);
  switch (outfitType?.toLowerCase()) {
    case "saree":
      return process.env.GEMINI_SAREE_KEY || GEMINI_API_KEY;
    case "lehenga":
      return process.env.GEMINI_LEHENGA_KEY || GEMINI_API_KEY;
    case "kurti":
      return process.env.GEMINI_KURTI_KEY || GEMINI_API_KEY;
    case "anarkali":
      return process.env.GEMINI_ANARKALI_KEY || GEMINI_API_KEY;
    default:
      console.log(`⚠️ Unknown outfit type, using default key`);
      return GEMINI_API_KEY;
  }
}
const upload = multer({ storage: multer.memoryStorage() });
const app = express();

// ✅ Set limits FIRST before any routes
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


cloudinary.v2.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET
});


// Background options with URLs
const backgrounds = [
  {
    id: "hallway",
    name: "Temple Hall",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background4_gqcvpg.jpg",
  },

  {
    id: "pool",
    name: "Grand Hall",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background6_cmouwo.jpg",
  },
  {
    id: "wedding",
    name: "Archway",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background5_a9sfuo.jpg",
  },
  {
    id: "trees",
    name: "Floral lights",
    image: "https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background11_lctohz.jpg",
  },
];

// Download garment as base64
async function downloadAsBase64(url) {
  console.log(`📥 Downloading image from: ${url.substring(0, 60)}...`);
  const res = await axios.get(url, { responseType: "arraybuffer" });
  console.log(`✅ Image downloaded successfully (${res.data.length} bytes)`);
  return Buffer.from(res.data).toString("base64");
}

// 3d video

app.post("/api/video/create", upload.single("tryOnImage"), async (req, res) => {
  console.log("\n🎬 === VIDEO GENERATION REQUEST ===");

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Try-on image required",
      });
    }

    console.log(`📊 Image size: ${req.file.size} bytes`);

    // Upload image to MiniMax (they need a URL)
    // For now, convert to base64 data URL
    const imageBase64 = req.file.buffer.toString("base64");
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

    const payload = {
      model: "MiniMax-Hailuo-2.3-Fast",
      first_frame_image: imageDataUrl,
      prompt:
        "A young woman stands facing the camera. She slowly walks forward three small steps with calm, natural motion. She then performs one slow, graceful full spin with smooth momentum and balanced posture. Finally, she calmly walks backward three steps returning precisely to her original position, ending in the exact starting pose.",
      duration: 6,
      resolution: "1080P",
      prompt_optimizer: true,
      fast_pretreatment: true,
    };

    console.log("🚀 Calling MiniMax API...");

    const response = await axios.post(`${MINIMAX_BASE_URL}/video_generation`, payload, {
      headers: getMinimaxHeaders(),
    });

    const { task_id } = response.data;

    console.log(`✅ Task created: ${task_id}`);

    res.json({
      success: true,
      taskId: task_id,
      message: "Video generation started",
    });
  } catch (error) {
    console.error("❌ Video creation error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Failed to create video generation task",
      details: error.response?.data || error.message,
    });
  }
});

// 2. Check video status
app.get("/api/video/status/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    const response = await axios.get(`${MINIMAX_BASE_URL}/query/video_generation`, {
      headers: getMinimaxHeaders(),
      params: { task_id: taskId },
    });

    const data = response.data;

    // Calculate progress
    let progress = 0;
    if (data.status === "Queueing") progress = 10;
    else if (data.status === "Preparing") progress = 25;
    else if (data.status === "Processing") progress = 60;
    else if (data.status === "Success") progress = 100;

    res.json({
      success: true,
      status: data.status,
      progress: progress,
      file_id: data.file_id,
      taskId: data.task_id,
    });
  } catch (error) {
    console.error("❌ Status check error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Failed to check video status",
      details: error.response?.data || error.message,
    });
  }
});

// 3. Get video download URL
app.get("/api/video/download/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const response = await axios.get(`${MINIMAX_BASE_URL}/files/retrieve`, {
      headers: getMinimaxHeaders(),
      params: { file_id: fileId },
    });

    const download_url = response.data.file?.download_url;

    if (!download_url) {
      return res.status(404).json({
        success: false,
        error: "Download URL not found",
      });
    }

    res.json({
      success: true,
      videoUrl: download_url,
    });
  } catch (error) {
    console.error("❌ Video retrieval error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve video",
      details: error.response?.data || error.message,
    });
  }
});









// ============================================================
// ENDPOINT: Upload Single File to Cloudinary (Used by ProfileService)
// ============================================================
app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log('\n☁️ === SINGLE FILE CLOUDINARY UPLOAD ===');

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const folder = req.body.folder || 'warehouse_uploads';
    console.log(`📤 Uploading file: ${req.file.originalname} to folder: ${folder}...`);

    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'auto'
    });

    console.log(`✅ Upload success: ${result.secure_url}`);

    res.json({
      success: true,
      url: result.secure_url
    });

  } catch (err) {
    console.error("❌ CLOUDINARY UPLOAD ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to upload image",
      details: err.message
    });
  }
});


// ============================================================
// ENDPOINT: Upload Base64 to Cloudinary
// ============================================================
app.post('/api/upload-to-cloudinary', async (req, res) => {
  console.log('\n☁️ === CLOUDINARY UPLOAD REQUEST ===');

  try {
    const { images } = req.body; // Array of { outfitType, base64Image }

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        error: "Images array required"
      });
    }

    console.log(`📤 Uploading ${images.length} images to Cloudinary...`);

    const uploadPromises = images.map(async ({ outfitType, base64Image }) => {
      try {
        // Remove data URL prefix if present
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

        // Upload to Cloudinary
        const result = await cloudinary.v2.uploader.upload(
          `data:image/png;base64,${base64Data}`,
          {
            folder: 'tryon-results',
            public_id: `${Date.now()}_${outfitType}`,
            resource_type: 'image'
          }
        );

        console.log(`✅ ${outfitType} uploaded: ${result.secure_url}`);

        return {
          outfitType,
          url: result.secure_url,
          success: true
        };
      } catch (error) {
        console.error(`❌ Failed to upload ${outfitType}:`, error.message);
        return {
          outfitType,
          error: error.message,
          success: false
        };
      }
    });

    const results = await Promise.all(uploadPromises);

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✨ Upload complete: ${successCount}/${images.length} successful`);

    res.json({
      success: true,
      results: results.reduce((acc, r) => {
        if (r.success) {
          acc[r.outfitType] = r.url;
        }
        return acc;
      }, {})
    });

  } catch (err) {
    console.error("❌ CLOUDINARY UPLOAD ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to upload images",
      details: err.message
    });
  }
});





// ============================================================
// ENDPOINT: /api/change-tryon-background
// ============================================================
app.post('/api/change-tryon-background', upload.single('tryOnImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Try-on image is required" });
    }

    const { background } = req.body;
    const selectedBg = backgrounds.find(bg => bg.id === background);

    if (!background || !selectedBg) {
      return res.status(400).json({
        error: "Valid background selection required",
        availableBackgrounds: backgrounds.map(b => b.id),
      });
    }

    const tryOnBase64 = req.file.buffer.toString("base64");
    const bgBase64 = await downloadAsBase64(selectedBg.image);

    const result = await generateTryOnWithRetry(
      tryOnBase64,
      bgBase64,
      "background-swap"
    );

    return res.json({
      success: true,
      result: `data:image/png;base64,${result}`,
      background: selectedBg.name,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available backgrounds
app.get("/api/tryon-backgrounds", (req, res) => {
  const bgList = Object.entries(backgrounds).map(([key, value]) => ({
    id: key,
    name: value.name,
    preview: value.url,
  }));
  res.json({
    success: true,
    backgrounds: bgList,
  });
});

// ============================================================
// ENDPOINT: /api/tryon-from-urls (For Firebase Storage URLs)
// ============================================================
// ============================================================
// ENDPOINT: /api/tryon-from-urls (For Firebase Storage URLs)
// ============================================================
app.post("/api/tryon-from-urls", async (req, res) => {
  console.log("\n🎯 === TRY-ON FROM URLs (MyProfile) ===");

  try {
    const { modelUrl, garmentUrl, outfitType } = req.body;

    console.log(`👗 Outfit type: ${outfitType}`);
    console.log(`👤 Model URL: ${modelUrl?.substring(0, 60)}...`);
    console.log(`🔗 Garment URL: ${garmentUrl?.substring(0, 60)}...`);

    if (!modelUrl || !garmentUrl) {
      console.log("❌ Missing URLs");
      return res.status(400).json({
        success: false,
        error: "Both modelUrl and garmentUrl are required",
      });
    }

    // Download both images from URLs
    console.log(`📥 Downloading model image...`);
    const modelBase64 = await downloadAsBase64(modelUrl);

    console.log(`📥 Downloading garment image...`);
    const garmentBase64 = await downloadAsBase64(garmentUrl);

    // Generate try-on with retry
    console.log(`🚀 Starting try-on with retry logic...`);
    const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

    if (!output) {
      throw new Error("No image generated from AI");
    }

    console.log(`✨ SUCCESS: Try-on generated for ${outfitType}`);
    console.log("=== REQUEST COMPLETE ===\n");

    res.json({
      success: true,
      result: `data:image/png;base64,${output}`,
    });
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({
      success: false,
      error: "Try-on generation failed",
      details: err.message,
    });
  }
});

// Generate try-on for ONE garment
async function generateTryOn(modelBase64, garmentBase64, garmentName) {
  console.log(`🎨 Generating AI try-on for: ${garmentName}`);

  // const isSaree = garmentName.toLowerCase() === 'saree';
  // const islehenga = garmentName.toLowerCase()=== 'lehenga'

  const isBackgroundSwap = garmentName?.toLowerCase()?.includes('background');
  const lowerName = garmentName?.toLowerCase() || "";

  // const isBackgroundSwap = lowerName.includes("background");
  const isSaree = lowerName === "saree";
  const isLehenga = lowerName === "lehenga";
  const isAnarkali = lowerName === "anarkali";
  const isSharara = lowerName === "sharara";
  const isKurtaSet = lowerName === "kurta set" || lowerName === "kurta sets";

  // Apparel try-on uses Vertex Virtual Try-On.
  // Background swap can optionally use Vertex too (guarded by env flag), otherwise Gemini.
  if (!isBackgroundSwap) {
    console.log("🧵 Using Vertex Virtual Try-On model...");
    return await generateVertexVirtualTryOn(modelBase64, garmentBase64);
  }

  if (process.env.VERTEX_ENABLE_BACKGROUND_SWAP === "true") {
    try {
      console.log("🧵 Using Vertex Virtual Try-On for background swap (enabled by VERTEX_ENABLE_BACKGROUND_SWAP=true)...");
      return await generateVertexVirtualTryOn(modelBase64, garmentBase64);
    } catch (error) {
      console.warn("⚠️ Vertex background swap failed; falling back to Gemini.");
      console.warn(error?.response?.data || error?.message || error);
    }
  }

  const prompt = `
ROLE
You are a professional photo editor performing a REALISTIC background replacement.

CORE TASK
- Image 1 contains a person with transparent or removed background (human OR AI-generated)
- Image 2 is the new background scene
- Place the SAME person naturally into Image 2

IDENTITY LOCK (ABSOLUTE)
- Face, expression, skin tone, hair, body shape, pose → UNCHANGED
- Clothing remains exactly the same
- No beautification, enhancement, or reshaping

REALISTIC INTEGRATION
- Match lighting direction, intensity, and color temperature
- Add natural ground and contact shadows
- Match perspective and scale
- Clean edge blending only
- Subtle ambient light spill if present

PROHIBITED
- No clothing changes
- No face/body edits
- No floating placement
- No text, watermarks, or frames
- NEVER return unchanged input

OUTPUT
Return ONE high-resolution inline_data image only.
`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          { text: isBackgroundSwap ? "Person to place in new background:" : "Person to dress:" },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: modelBase64,
            },
          },
          {
            text: isBackgroundSwap
              ? "Target background scene:"
              : `Garment reference (${garmentName}):`,
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: garmentBase64,
            },
          },
        ],
      },
    ],
  };

  try {
    console.log(`🚀 Sending request to Gemini API...`);
    const apiKeyToUse = getApiKeyByOutfit(garmentName);

    const response = await axios.post(GEMINI_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKeyToUse,
      },
      timeout: 180000,
    });

    const parts = response.data.candidates?.[0]?.content?.parts || [];
    let img = null;

    for (const p of parts) {
      const base = p.inline_data?.data || p.inlineData?.data;
      if (base && !img) {
        img = base;
      }
    }

    if (!img) {
      console.log("❌ NO IMAGE FOUND. RAW PARTS:");
      console.log(JSON.stringify(parts, null, 2));
      throw new Error("No image generated from AI");
    }

    console.log(`✅ AI generation successful for ${garmentName}`);
    return img;
  } catch (error) {
    console.error(`❌ Gemini API error:`, error.message);
    throw error;
  }
}

// ⭐ RETRY FUNCTION - FIXED NAME (no typo)
async function generateTryOnWithRetry(modelBase64, garmentBase64, garmentName, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${garmentName}`);
      return await generateTryOn(modelBase64, garmentBase64, garmentName);
    } catch (error) {
      const isRateLimit =
        error.response?.status === 429 ||
        error.response?.status === 503 ||
        error.message?.includes("quota") ||
        error.message?.includes("rate limit");

      if (isRateLimit && attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Rate limited. Waiting ${waitTime / 1000}s before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      throw error;
    }
  }
}

//blouse change function

async function generateBlouseChange(tryOnBase64, blouseType) {
  const prompt = `
ROLE
You are a professional Indian fashion photo editor.

TASK
Change ONLY the blouse sleeve style to: ${blouseType}.

ABSOLUTE LOCKS
- SAME person, face, pose, body
- SAME saree (fabric, color, drape)
- SAME blouse body and neckline
- SAME background and lighting

SLEEVE RULES (VERY IMPORTANT)
- Sleeve style MUST visibly change
- Half sleeve, full sleeve, sleeveless must be OBVIOUS
- No neckline or fabric change
- No color change

FAILURE CONDITION
- If sleeve style is unchanged → regenerate correctly

OUTPUT
Return ONE high-resolution photorealistic image only.
NO text.
`;



  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: tryOnBase64,
            },
          },
        ],
      },
    ],
  };

  const response = await axios.post(GEMINI_URL, payload, {
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    timeout: 180000,
  });

  const parts = response.data.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inline_data?.data || p.inlineData?.data);

  return img?.inline_data?.data || img?.inlineData?.data;
}

//neck change function

async function generateNeckChange(tryOnBase64, neckType) {
  const prompt = `
ROLE
You are a professional Indian fashion photo editor.

TASK
Modify ONLY the blouse NECKLINE to: ${neckType}.

ABSOLUTE LOCKS (NON-NEGOTIABLE)
- SAME person (face, hair, skin tone, expression)
- SAME body shape, pose, proportions
- SAME saree (fabric, color, design, draping)
- SAME blouse fabric, sleeves, length, fit
- SAME background, camera angle, lighting

NECKLINE RULES (CRITICAL)
- Change ONLY the neckline shape
- Clearly visible neckline difference is REQUIRED
- No sleeve or blouse body change
- No jewelry or accessories added
- No color or fabric change

FAILURE CONDITION
- If neckline does not visibly change → regenerate correctly

OUTPUT
Return ONE high-resolution photorealistic image only.
NO text.
`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: tryOnBase64,
            },
          },
        ],
      },
    ],
  };

  const response = await axios.post(GEMINI_URL, payload, {
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    timeout: 180000,
  });

  const parts = response.data.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inline_data?.data || p.inlineData?.data);

  return img?.inline_data?.data || img?.inlineData?.data;
}

// ============================================================
// MULTI TRY-ON FUNCTION - Specifically for MyProfile
// ============================================================
async function generateMultipleTryOns(modelBase64, garments) {
  console.log(`🎨 Starting multi try-on for ${garments.length} garments`);
  const results = {};

  for (const garment of garments) {
    console.log(`\n📸 Processing ${garment.name}...`);

    try {
      // Download garment image
      const garmentBase64 = await downloadAsBase64(garment.url);

      // Generate try-on with retry logic
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, garment.name);

      if (output) {
        results[garment.name] = `data:image/png;base64,${output}`;
        console.log(`✅ ${garment.name} generated successfully`);
      } else {
        console.log(`❌ ${garment.name} generation failed - no output`);
        results[garment.name] = null;
      }
    } catch (error) {
      console.error(`❌ Error generating ${garment.name}:`, error.message);
      results[garment.name] = null;
    }
  }

  return results;
}

// Add BEFORE the PORT declaration
app.post(
  "/api/tryon",
  upload.fields([
    { name: "model", maxCount: 1 },
    { name: "garment", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log("\n🎯 === TRYON REQUEST ===");

    try {
      if (!req.files?.model) {
        return res.status(400).json({
          success: false,
          error: "Model image required",
        });
      }

      const modelBase64 = req.files.model[0].buffer.toString("base64");

      // Handle garment - either from file or URL
      let garmentBase64;
      if (req.files?.garment) {
        garmentBase64 = req.files.garment[0].buffer.toString("base64");
      } else if (req.body.garmentUrl) {
        garmentBase64 = await downloadAsBase64(req.body.garmentUrl);
      } else {
        return res.status(400).json({
          success: false,
          error: "Garment image or URL required",
        });
      }

      const outfitType = req.body.outfitType || "saree";

      console.log(`🚀 Generating try-on for ${outfitType}...`);
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      if (!output) {
        throw new Error("No image generated");
      }

      console.log(`✨ SUCCESS`);
      res.json({
        success: true,
        result: `data:image/png;base64,${output}`,
      });
    } catch (err) {
      console.error("❌ ERROR:", err.message);
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

// ============================================================
// ENDPOINT: /api/myprofile-multi-tryon (MyProfile Multi Try-On)
// ============================================================
app.post("/api/myprofile-multi-tryon", upload.single("model"), async (req, res) => {
  console.log("\n🎯 === MY PROFILE MULTI TRY-ON REQUEST ===");

  try {
    // Validate model image
    if (!req.file) {
      console.log("❌ No model image uploaded");
      return res.status(400).json({
        success: false,
        error: "No model image uploaded",
      });
    }

    console.log(`📊 Model image size: ${req.file.size} bytes`);

    // Convert model to base64
    const modelBase64 = req.file.buffer.toString("base64");
    console.log(`✅ Model image converted to base64`);

    // Define garments for MyProfile
    const garments = [
      {
        name: "saree",
        url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764159002/saree2_lhrofy.jpg",
      },
      {
        name: "kurti",
        url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764157933/8816O_1_1024x1024_wa4o3j.webp",
      },
      {
        name: "lehenga",
        url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763188140/ChatGPT_Image_Nov_15_2025_11_58_37_AM_cnzfyj.png",
      },
      {
        name: "anarkali",
        url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971671/Anarkali3_uqzket.png",
      },
    ];

    console.log(`🚀 Generating try-ons for ${garments.length} garments...`);

    // Generate all try-ons
    const results = await generateMultipleTryOns(modelBase64, garments);

    // Count successful results
    const successCount = Object.values(results).filter((r) => r !== null).length;
    console.log(`\n✨ Completed: ${successCount}/${garments.length} successful`);
    console.log("=== REQUEST COMPLETE ===\n");

    res.json({
      success: true,
      results: results,
    });
  } catch (err) {
    console.error("❌ MYPROFILE MULTI TRY-ON ERROR:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({
      success: false,
      error: "Multi try-on generation failed",
      details: err.message,
    });
  }
});

app.post("/api/change-blouse", upload.single("tryOnImage"), async (req, res) => {
  console.log("\n👚 === BLOUSE CHANGE REQUEST ===");

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Try-on image is required",
      });
    }

    const { blouseType } = req.body;

    console.log(`👚 Blouse type: ${blouseType}`);

    const tryOnBase64 = req.file.buffer.toString("base64");

    // Call Gemini with blouse-specific prompt
    const result = await generateBlouseChange(tryOnBase64, blouseType);

    if (!result) {
      throw new Error("No image returned from AI");
    }

    console.log("✨ SUCCESS — Blouse Changed! 👚");

    return res.json({
      success: true,
      result: `data:image/png;base64,${result}`,
      blouseType: blouseType,
    });
  } catch (err) {
    console.error("❌ BLOUSE CHANGE ERROR:", err.message);
    return res.status(500).json({
      error: "Blouse change failed",
      details: err.message,
    });
  }
});

app.post("/api/change-neck", upload.single("tryOnImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Try-on image required" });
    }

    const { neckType } = req.body;
    const resolvedNeckType =
      neckType === "collar"
        ? "boat neck neckline"
        : "regular round neckline";

    const base64 = req.file.buffer.toString("base64");
    const result = await generateNeckChange(base64, resolvedNeckType);

    if (!result) throw new Error("No image returned");

    res.json({
      success: true,
      result: `data:image/png;base64,${result}`,
      neckType,
    });
  } catch (err) {
    res.status(500).json({
      error: "Neck change failed",
      details: err.message,
    });
  }
});

// ============================================================
// ENDPOINT 1: /api/single-tryon (Used by MyProfile)
// ============================================================
app.post("/api/single-tryon", upload.single("model"), async (req, res) => {
  console.log("\n🎯 === SINGLE TRY-ON REQUEST (MyProfile) ===");

  try {
    if (!req.file) {
      console.log("❌ No model image uploaded");
      return res.status(400).json({
        success: false,
        error: "No model image uploaded",
      });
    }

    const { garmentUrl, outfitType } = req.body;
    console.log(`👗 Outfit type: ${outfitType}`);
    console.log(`🔗 Garment URL: ${garmentUrl}`);

    if (!garmentUrl) {
      console.log("❌ No garment URL provided");
      return res.status(400).json({
        success: false,
        error: "No garment URL provided",
      });
    }

    console.log(`📊 Model image size: ${req.file.size} bytes`);

    const modelBase64 = req.file.buffer.toString("base64");
    console.log(`✅ Model image converted to base64`);

    const garmentBase64 = await downloadAsBase64(garmentUrl);

    // ⭐ USE RETRY FUNCTION
    console.log(`🚀 Starting try-on with retry logic...`);
    const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

    if (!output) {
      throw new Error("No image generated from AI");
    }

    console.log(`✨ SUCCESS: Try-on generated for ${outfitType}`);
    console.log("=== REQUEST COMPLETE ===\n");

    res.json({
      success: true,
      result: `data:image/png;base64,${output}`,
    });
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({
      success: false,
      error: "Try-on generation failed",
      details: err.message,
    });
  }
});

// ============================================================
// ENDPOINT 2: /api/multi-tryon (NOT USED - Can be removed or kept for future)
// ============================================================
// This was your old multi-garment endpoint - keeping it commented out

// ============================================================
// ENDPOINT: /api/multi-tryon (Used by MyProfile ONLY)
// ============================================================
app.post("/api/multi-tryon", upload.single("model"), async (req, res) => {
  console.log("\n🎯 === MULTI TRY-ON REQUEST (MyProfile) ===");

  try {
    // Validate model image
    if (!req.file) {
      console.log("❌ No model image uploaded");
      return res.status(400).json({
        success: false,
        error: "No model image uploaded",
      });
    }

    console.log(`📊 Model image size: ${req.file.size} bytes`);

    // Convert model to base64
    const modelBase64 = req.file.buffer.toString("base64");
    console.log(`✅ Model image converted to base64`);

    // Define garments for MyProfile
    const garments = [
      {
        name: "saree",
        url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764159002/saree2_lhrofy.jpg",
      },
      {
        name: "kurti",
        url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764157933/8816O_1_1024x1024_wa4o3j.webp",
      },
      {
        name: "lehenga",
        url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763188140/ChatGPT_Image_Nov_15_2025_11_58_37_AM_cnzfyj.png",
      },
      {
        name: "anarkali",
        url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971671/Anarkali3_uqzket.png",
      },
    ];

    console.log(`🚀 Generating try-ons for ${garments.length} garments...`);

    // Generate all try-ons
    const results = await generateMultipleTryOns(modelBase64, garments);

    // Count successful results
    const successCount = Object.values(results).filter((r) => r !== null).length;
    console.log(`\n✨ Completed: ${successCount}/${garments.length} successful`);
    console.log("=== REQUEST COMPLETE ===\n");

    res.json({
      success: true,
      results: results,
    });
  } catch (err) {
    console.error("❌ MULTI TRY-ON ERROR:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({
      success: false,
      error: "Multi try-on generation failed",
      details: err.message,
    });
  }
});

// Add BEFORE the PORT declaration
app.post(
  "/api/garnment-swap",
  upload.fields([
    { name: "model", maxCount: 1 },
    { name: "garment", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log("\n🎯 === TEST TRY-ON REQUEST ===");

    try {
      if (!req.files?.model || !req.files?.garment) {
        return res.status(400).json({
          success: false,
          error: "Both model and garment images required",
        });
      }

      const modelBase64 = req.files.model[0].buffer.toString("base64");
      const garmentBase64 = req.files.garment[0].buffer.toString("base64");

      const outfitType = req.body.outfitType || "saree";

      console.log(`🚀 Generating try-on for ${outfitType}...`);
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      if (!output) {
        throw new Error("No image generated");
      }

      console.log(`✨ SUCCESS`);
      res.json({
        success: true,
        result: `data:image/png;base64,${output}`,
      });
    } catch (err) {
      console.error("❌ ERROR:", err.message);
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`\n✨ Try-On Server Started`);
  console.log(`🌐 Running at: http://localhost:${PORT}`);
  console.log(`🔑 Gemini API Key: ${GEMINI_API_KEY ? "✅ Configured" : "❌ Missing"} (used for edits/background swap)`);
  console.log(
    `🧵 Vertex Virtual Try-On: ${VERTEX_PROJECT_ID ? "✅ Configured" : "❌ Missing GOOGLE_PROJECT_ID"} (used for apparel try-on)`
  );
  console.log(`📡 Ready to receive requests...\n`);
});
