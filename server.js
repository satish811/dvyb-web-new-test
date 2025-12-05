import express from "express";
import multer from "multer";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

function getApiKeyByOutfit(outfitType) {
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
app.use(cors());
app.use(express.json());
app.use(express.json()); // ⭐ This must be BEFORE your routes!
app.use(express.urlencoded({ extended: true }));

// Download garment as base64
async function downloadAsBase64(url) {
  console.log(`📥 Downloading image from: ${url.substring(0, 60)}...`);
  const res = await axios.get(url, { responseType: "arraybuffer" });
  console.log(`✅ Image downloaded successfully (${res.data.length} bytes)`);
  return Buffer.from(res.data).toString("base64");
}

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

    const apiKey = getApiKeyByOutfit(outfitType);
    if (!apiKey) {
      console.log("❌ API key not configured");
      return res.status(500).json({
        success: false,
        error: "API key not configured",
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

  const isSaree = garmentName.toLowerCase() === "saree";

  const prompt = `
You are performing a STRICT photo-realistic virtual try-on. Dress the person in the EXACT garment from the reference image.

CORE TASK:
- Replace ONLY the person's clothing with the garment from the reference image
- Preserve person's exact face, skin tone, hair, body shape, pose, lighting, shadows, and background 100% unchanged

GARMENT-SPECIFIC GUIDELINES:
${
  isSaree
    ? `
SAREE REQUIREMENTS:
- Drape saree in Nivi style (most common): pleats tucked at waist, pallu flowing naturally over LEFT shoulder
- Create 8-10 realistic pleats at waist with proper folds/shadows
- Show fitted blouse underneath pallu (match reference blouse color/style)
- Saree length reaches ankles; pallu extends to mid-back
- Replicate ALL fabric texture, borders, embroidery, patterns exactly from reference
`
    : `
GENERAL GARMENT REQUIREMENTS:
- Adapt garment to fit person's exact pose/body naturally
- Match fabric material, color, texture, patterns, sleeves, neckline, length precisely
- Ensure realistic draping following body curves/gravity
`
}

UNIVERSAL REALISM RULES:
- Perfect edge blending (NO floating, jagged, or visible seams)
- Fabric follows body's exact perspective/curvature
- Lighting/shadows match original image completely
- Photo-realistic quality, high-resolution

STRICTLY PROHIBITED:
- NO changes to face, expression, hair, body, pose, or background
- NO added jewelry, accessories, makeup, or props
- NO text, watermarks, or multiple images
- NEVER return unchanged reference image

OUTPUT:
ONLY one high-resolution inline_data image of the person wearing the garment correctly.
NO text, JSON, explanations, or additional content.
`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          { text: "Person to dress:" },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: modelBase64,
            },
          },
          { text: `Garment reference (${garmentName}):` },
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

    const apiKey = getApiKeyByOutfit(outfitType);
    if (!apiKey) {
      console.log("❌ API key not configured");
      return res.status(500).json({
        success: false,
        error: "API key not configured",
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
  "/api/test-tryon",
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
  console.log(`🔑 Gemini API Key: ${GEMINI_API_KEY ? "✅ Configured" : "❌ Missing"}`);
  console.log(`📡 Ready to receive requests...\n`);
});
