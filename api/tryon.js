// ============================================================
// FILE: api/tryon.js (Vercel Serverless Function)
// Complete virtual try-on API with multiple modes
// ============================================================

import axios from "axios";
import multer from "multer";

// ============ VERCEL CONFIG ============
export const config = {
  api: { 
    bodyParser: false, 
    sizeLimit: "20mb" 
  },
  maxDuration: 300, // 5 minutes for complex operations
};

// ============ MULTER SETUP ============
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// ============ CONSTANTS ============
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

// Background options with URLs
const backgrounds = {
  hallway: {
    name: "Temple Hallway",
    url: "https://res.cloudinary.com/doiezptnn/image/upload/v1765279561/bg1_xz7rvw.jpg"
  },
  pool: {
    name: "Beach Pool",
    url: "https://res.cloudinary.com/doiezptnn/image/upload/v1765279560/bg2_xjq6jk.jpg"
  },
  wedding: {
    name: "Wedding Hall",
    url: "https://res.cloudinary.com/doiezptnn/image/upload/v1765279560/bg3_thakvm.jpg"
  },
  trees: {
    name: "Nature Trees",
    url: "https://res.cloudinary.com/doiezptnn/image/upload/v1765279687/Screenshot_2025-12-09_165745_mj2via.png"
  }
};

// Garments for multi try-on
const garments = [
  { 
    name: "saree", 
    url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764159002/saree2_lhrofy.jpg" 
  },
  { 
    name: "kurti", 
    url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764157933/8816O_1_1024x1024_wa4o3j.webp" 
  },
  { 
    name: "lehenga", 
    url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763188140/ChatGPT_Image_Nov_15_2025_11_58_37_AM_cnzfyj.png" 
  },
  { 
    name: "anarkali", 
    url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971671/Anarkali3_uqzket.png" 
  },
];

// ============ HELPER FUNCTIONS ============
function getApiKeyByOutfit(outfitType) {
  switch (outfitType?.toLowerCase()) {
    case "saree": return process.env.GEMINI_SAREE_KEY || process.env.GEMINI_API_KEY;
    case "lehenga": return process.env.GEMINI_LEHENGA_KEY || process.env.GEMINI_API_KEY;
    case "kurti": return process.env.GEMINI_KURTI_KEY || process.env.GEMINI_API_KEY;
    case "anarkali": return process.env.GEMINI_ANARKALI_KEY || process.env.GEMINI_API_KEY;
    default: return process.env.GEMINI_API_KEY;
  }
}

async function downloadAsBase64(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data).toString("base64");
}

async function generateTryOn(modelBase64, garmentBase64, outfitType) {
  const lowerType = (outfitType || "").toLowerCase();
  const isSaree = lowerType === "saree";
  const isBackgroundSwap = lowerType === "background-swap";

  const prompt = isBackgroundSwap ? `
You are performing a REALISTIC background replacement task. Place the person naturally into the new environment.

CORE TASK:
- Take the person from the first image (with transparent/removed background)
- Place them realistically into the background scene from the second image
- Make it look like the person is actually standing/present in that location

CRITICAL REQUIREMENTS:
1. PRESERVE THE PERSON 100%:
   - Keep their EXACT pose, outfit, face, body, and all details unchanged
   - Do NOT modify their clothing, appearance, or any aspect of them
   - Only change the background/environment around them

2. NATURAL INTEGRATION:
   - Match lighting direction and intensity from the background scene
   - Add appropriate shadows on the ground/floor where person stands
   - Adjust color temperature to match the scene (warm/cool tones)
   - Ensure perspective matches (person's size should fit the scene naturally)
   - Add subtle ambient occlusion where person meets the ground

3. DEPTH & REALISM:
   - If background has depth of field, apply slight blur to match
   - Ensure person's edges blend naturally (no harsh cutouts)
   - Add reflected light from the environment onto the person
   - Match the scene's atmosphere (indoor/outdoor, time of day)

4. PROHIBITED:
   - NO changes to the person's clothing, face, or body
   - NO text, watermarks, or multiple images
   - NO floating or unrealistic placement
   - NEVER return the unchanged reference image

OUTPUT:
ONLY one high-resolution inline_data image showing the person naturally integrated into the new background scene.
NO text, JSON, explanations, or additional content.
` : `
You are performing a STRICT photo-realistic virtual try-on. Dress the person in the EXACT garment from the reference image.

CORE TASK:
- Replace ONLY the person's clothing with the garment from the reference image
- Preserve person's exact face, skin tone, hair, body shape, pose, lighting, shadows, and background 100% unchanged

GARMENT-SPECIFIC GUIDELINES:
${isSaree ? `
SAREE REQUIREMENTS:
- Drape saree in Nivi style (most common): pleats tucked at waist, pallu flowing naturally over LEFT shoulder
- Create 8-10 realistic pleats at waist with proper folds/shadows
- Show fitted blouse underneath pallu (match reference blouse color/style)
- Saree length reaches ankles; pallu extends to mid-back
- Replicate ALL fabric texture, borders, embroidery, patterns exactly from reference
` : `
GENERAL GARMENT REQUIREMENTS:
- Adapt garment to fit person's exact pose/body naturally
- Match fabric material, color, texture, patterns, sleeves, neckline, length precisely
- Ensure realistic draping following body curves/gravity
`}

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
          { text: isBackgroundSwap ? "Person to place in new background:" : "Person to dress:" },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: modelBase64,
            },
          },
          { text: isBackgroundSwap ? "Target background scene:" : `Garment reference (${outfitType}):` },
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

  const apiKey = getApiKeyByOutfit(outfitType);
  const response = await axios.post(GEMINI_URL, payload, {
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    timeout: 180000,
  });

  const parts = response.data.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    const img = p.inline_data?.data || p.inlineData?.data;
    if (img) return img;
  }

  throw new Error("No image generated from AI");
}

async function generateTryOnWithRetry(m, g, type, max = 3) {
  for (let i = 1; i <= max; i++) {
    try {
      return await generateTryOn(m, g, type);
    } catch (err) {
      const isRateLimit = err.response?.status === 429 ||
        err.response?.status === 503 ||
        err.message?.includes('quota');

      if (isRateLimit && i < max) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        continue;
      }
      throw err;
    }
  }
}

// ============ MAIN HANDLER ============
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const mode = req.query.mode;
  console.log(`🎯 API called with mode: ${mode}`);

  try {
    // ======== GET: backgrounds ========
    if (req.method === "GET" && mode === "backgrounds") {
      console.log('📋 Fetching available backgrounds...');
      const bgList = Object.entries(backgrounds).map(([key, value]) => ({
        id: key,
        name: value.name,
        preview: value.url
      }));
      return res.json({ 
        success: true,
        backgrounds: bgList 
      });
    }

    // ======== POST: change-background ========
    if (mode === "change-background") {
      console.log('🌍 === BACKGROUND CHANGE REQUEST ===');
      
      await runMiddleware(req, res, upload.single("tryOnImage"));

      if (!req.file) {
        console.log('❌ No try-on image uploaded');
        return res.status(400).json({ 
          success: false,
          error: "Try-on image is required" 
        });
      }

      const background = req.body.background;
      
      if (!background || !backgrounds[background]) {
        console.log('❌ Invalid background selection');
        return res.status(400).json({
          error: "Valid background selection required",
          availableBackgrounds: Object.keys(backgrounds)
        });
      }

      console.log(`📸 Try-on image size: ${req.file.size} bytes`);
      console.log(`🌍 Selected background: ${backgrounds[background].name}`);

      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          error: "Image too large. Please use an image smaller than 10MB"
        });
      }

      const tryOnBase64 = req.file.buffer.toString("base64");
      console.log(`✅ Try-on image converted to base64`);
      
      console.log("⬇️ Downloading background image...");
      const bgBase64 = await downloadAsBase64(backgrounds[background].url);

      console.log("🔁 Calling Gemini API for background swap...");
      const result = await generateTryOnWithRetry(
        tryOnBase64, 
        bgBase64, 
        "background-swap"
      );

      if (!result) {
        throw new Error("No image returned from AI");
      }

      console.log("✨ SUCCESS — Background Changed! 🎉");
      
      return res.json({
        success: true,
        result: `data:image/png;base64,${result}`,
        background: backgrounds[background].name
      });
    }

    // ======== POST: from-urls ========
    if (mode === "from-urls") {
      console.log('🔗 === FROM-URLS TRY-ON REQUEST ===');
      
      const { modelUrl, garmentUrl, outfitType } = req.body;

      if (!modelUrl || !garmentUrl) {
        return res.status(400).json({ 
          error: "modelUrl & garmentUrl required" 
        });
      }

      console.log(`📥 Model URL: ${modelUrl}`);
      console.log(`📥 Garment URL: ${garmentUrl}`);
      console.log(`👗 Outfit Type: ${outfitType || 'default'}`);

      console.log(`⬇️ Downloading images...`);
      const modelBase64 = await downloadAsBase64(modelUrl);
      const garmentBase64 = await downloadAsBase64(garmentUrl);

      console.log('🔁 Generating try-on...');
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      console.log('✨ Try-on completed successfully!');
      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`,
      });
    }

    // ======== FILE UPLOAD MODES (single, multi, test) ========
    await runMiddleware(
      req,
      res,
      upload.fields([
        { name: "model", maxCount: 1 },
        { name: "garment", maxCount: 1 },
      ])
    );

    const modelFile = req.files?.model?.[0];
    const garmentFile = req.files?.garment?.[0];

    // ======== POST: single ========
    if (mode === "single") {
      console.log('👤 === SINGLE TRY-ON REQUEST ===');
      
      const garmentUrl = req.body.garmentUrl;
      const outfitType = req.body.outfitType || "saree";

      if (!modelFile) {
        console.log('❌ No model file uploaded');
        return res.status(400).json({ error: "model file missing" });
      }
      if (!garmentUrl) {
        console.log('❌ No garment URL provided');
        return res.status(400).json({ error: "garmentUrl missing" });
      }

      console.log(`📸 Model image size: ${modelFile.size} bytes`);
      console.log(`👗 Garment URL: ${garmentUrl}`);
      console.log(`🎨 Outfit Type: ${outfitType}`);

      const modelBase64 = modelFile.buffer.toString("base64");

      let garmentBase64;
      if (garmentUrl.startsWith("data:")) {
        console.log('📊 Extracting base64 from data URL...');
        garmentBase64 = garmentUrl.split(",")[1];
      } else {
        console.log('⬇️ Downloading garment from URL...');
        garmentBase64 = await downloadAsBase64(garmentUrl);
      }

      console.log('🔁 Generating try-on...');
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      console.log('✨ Try-on completed successfully!');
      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`,
      });
    }

    // ======== POST: multi (MyProfile Multi Try-On) ========
    if (mode === "multi") {
      console.log('\n🎯 === MY PROFILE MULTI TRY-ON REQUEST ===');
      
      if (!modelFile) {
        console.log('❌ No model file uploaded');
        return res.status(400).json({ 
          success: false,
          error: "model file missing" 
        });
      }

      console.log(`📊 Model image size: ${modelFile.size} bytes`);
      console.log(`🚀 Generating try-ons for ${garments.length} garments...`);

      const modelBase64 = modelFile.buffer.toString("base64");
      console.log(`✅ Model image converted to base64`);

      const results = {};
      
      for (const g of garments) {
        try {
          console.log(`\n📸 Processing ${g.name}...`);
          console.log(`⬇️ Downloading ${g.name} garment...`);
          const garmentBase64 = await downloadAsBase64(g.url);
          
          console.log(`🔁 Generating ${g.name} try-on...`);
          const output = await generateTryOnWithRetry(modelBase64, garmentBase64, g.name);
          
          results[g.name] = `data:image/png;base64,${output}`;
          console.log(`✅ ${g.name} completed successfully!`);
        } catch (err) {
          console.error(`❌ ${g.name} failed:`, err.message);
          results[g.name] = null;
        }
      }

      const successCount = Object.values(results).filter(r => r !== null).length;
      console.log(`\n✨ Completed: ${successCount}/${garments.length} successful`);
      console.log('=== REQUEST COMPLETE ===\n');

      return res.json({ 
        success: true, 
        results 
      });
    }

    // ======== POST: test ========
    if (mode === "test") {
      console.log('🧪 === TEST TRY-ON REQUEST ===');
      
      if (!modelFile || !garmentFile) {
        console.log('❌ Missing files');
        return res.status(400).json({
          error: "model & garment files required",
        });
      }

      console.log(`📸 Model size: ${modelFile.size} bytes`);
      console.log(`👗 Garment size: ${garmentFile.size} bytes`);

      const modelBase64 = modelFile.buffer.toString("base64");
      const garmentBase64 = garmentFile.buffer.toString("base64");
      const outfitType = req.body.outfitType || "saree";

      console.log(`🎨 Outfit Type: ${outfitType}`);
      console.log('🔁 Generating try-on...');

      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      console.log('✨ Test try-on completed successfully!');
      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`,
      });
    }

    // ======== INVALID MODE ========
    console.log(`❌ Invalid mode: ${mode}`);
    return res.status(400).json({ 
      error: `Invalid mode: ${mode}`,
      validModes: ['backgrounds', 'change-background', 'from-urls', 'single', 'multi', 'test']
    });

  } catch (err) {
    console.error("❌ API Error:", err.message);
    console.error("Stack:", err.stack);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}


// FASHION API
// // api/tryon.js (at root level, NOT in src/)

// const FASHN_API_URL = "https://api.fashn.ai/v1";
// const AUTH_HEADER = "Bearer fa-F9DTlio3iFtN-rIeGevtCjEsC8mf2StyWRLDz";

// export default async function handler(req, res) {
//   // Set proper headers
//   res.setHeader("Content-Type", "application/json");
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   // Handle preflight requests
//   if (req.method === "OPTIONS") {
//     return res.status(200).json({ message: "OK" });
//   }

//   // Only allow POST requests
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const { modelImage, garmentImage, category } = req.body || {};

//     // Validation
//     if (!modelImage || !garmentImage) {
//       return res.status(400).json({ error: "Both modelImage and garmentImage URLs are required." });
//     }

//     console.log(" Received request:");
//     console.log("   Model Image:", modelImage);
//     console.log("   Garment Image:", garmentImage);
//     console.log("   Category:", category || "auto");

//     // Valid Fashn API categories: "tops", "bottoms", "one-pieces", "auto"
//     const garmentCategory = category || "auto";

//     console.log("🔄 Calling Fashn API with category:", garmentCategory);

//     // Step 1: Call the Fashn API `/run` endpoint with category
//     const runResponse = await fetch(`${FASHN_API_URL}/run`, {
//       method: "POST",
//       headers: {
//         Authorization: AUTH_HEADER,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model_name: "tryon-v1.6",
//         inputs: {
//           model_image: modelImage,
//           garment_image: garmentImage,
//           category: garmentCategory, // Now sending valid category
//         },
//       }),
//     });

//     if (!runResponse.ok) {
//       const errorText = await runResponse.text();
//       console.error(" Fashn API error:", errorText);
//       return res.status(500).json({ error: `Fashn API error: ${runResponse.status}` });
//     }

//     const runData = await runResponse.json();
//     const predictionId = runData.id;

//     if (!predictionId) {
//       return res.status(500).json({ error: "No prediction ID received from Fashn API" });
//     }

//     console.log(` Prediction started with ID: ${predictionId}`);

//     // Step 2: Poll the `/status/:id` endpoint
//     for (let i = 0; i < 15; i++) {
//       console.log(` Polling attempt ${i + 1}/15 for prediction ${predictionId}`);

//       const statusResponse = await fetch(`${FASHN_API_URL}/status/${predictionId}`, {
//         headers: {
//           Authorization: AUTH_HEADER,
//         },
//       });

//       if (!statusResponse.ok) {
//         console.error(` Status check error: ${statusResponse.status}`);
//         return res.status(500).json({ error: `Status check error: ${statusResponse.status}` });
//       }

//       const statusData = await statusResponse.json();
//       console.log(` Status: ${statusData.status}`);

//       if (statusData.status === "completed") {
//         console.log(" Try-on completed successfully!");
//         return res.status(200).json({
//           output: statusData.output,
//           category: garmentCategory,
//         });
//       }

//       if (statusData.status === "failed") {
//         console.error(" Try-on failed:", statusData.error);
//         return res.status(500).json({ error: statusData.error || "Try-on failed." });
//       }

//       // Wait for 3 seconds before next poll
//       await new Promise((resolve) => setTimeout(resolve, 3000));
//     }

//     // Timeout case
//     console.log(" Try-on timed out after 15 attempts");
//     return res.status(504).json({ error: "Try-on timed out. Please try again." });
//   } catch (err) {
//     console.error(" TryOn error:", err);
//     return res.status(500).json({ error: err.message || "Something went wrong." });
//   }
// }
