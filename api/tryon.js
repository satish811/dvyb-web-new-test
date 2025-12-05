import axios from "axios";
import multer from "multer";

// ============ VERCEL CONFIG ============
export const config = {
  api: { bodyParser: false, sizeLimit: "20mb" },
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

function getApiKeyByOutfit(outfitType) {
  switch (outfitType?.toLowerCase()) {
    case "saree": return process.env.GEMINI_SAREE_KEY || process.env.GEMINI_API_KEY;
    case "lehenga": return process.env.GEMINI_LEHENGA_KEY || process.env.GEMINI_API_KEY;
    case "kurti": return process.env.GEMINI_KURTI_KEY || process.env.GEMINI_API_KEY;
    case "anarkali": return process.env.GEMINI_ANARKALI_KEY || process.env.GEMINI_API_KEY;
    default: return process.env.GEMINI_API_KEY;
  }
}

// ============ HELPER FUNCTIONS ============
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
          { text: "Person to dress:" },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: modelBase64,
            },
          },
          { text: `Garment reference (${outfitType}):` },
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
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const mode = req.query.mode;
  console.log(`🎯 API called with mode: ${mode}`);

  try {
    // ======== ENDPOINT 1: from-urls (MyProfile URL-based) ========
    if (mode === "from-urls") {
      const { modelUrl, garmentUrl, outfitType } = req.body;

      if (!modelUrl || !garmentUrl) {
        return res.status(400).json({ error: "modelUrl & garmentUrl required" });
      }

      console.log(`📥 Downloading images...`);
      const modelBase64 = await downloadAsBase64(modelUrl);
      const garmentBase64 = await downloadAsBase64(garmentUrl);

      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`,
      });
    }

    // ======== ENDPOINTS THAT USE FILE UPLOAD ========
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

    // ======== ENDPOINT 2: /api/tryon?mode=single ========
    // ======== ENDPOINT 2: /api/tryon?mode=single ========
    if (mode === "single") {
      const garmentUrl = req.body.garmentUrl;
      const outfitType = req.body.outfitType || "saree";

      if (!modelFile) return res.status(400).json({ error: "model file missing" });
      if (!garmentUrl) return res.status(400).json({ error: "garmentUrl missing" });

      const modelBase64 = modelFile.buffer.toString("base64");

      // Handle both data URLs and regular URLs
      let garmentBase64;
      if (garmentUrl.startsWith("data:")) {
        // It's already a base64 data URL
        garmentBase64 = garmentUrl.split(",")[1];
      } else {
        // It's a regular URL, download it
        garmentBase64 = await downloadAsBase64(garmentUrl);
      }

      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`,
      });
    }

    // ======== ENDPOINT 3: /api/tryon?mode=multi ========
    if (mode === "multi") {
      if (!modelFile) return res.status(400).json({ error: "model file missing" });

      console.log(`🎨 Processing multi try-on...`);
      const modelBase64 = modelFile.buffer.toString("base64");

      const garments = [
        { name: "saree", url: "https://res.cloudinary.com/.../saree2.jpg" },
        { name: "kurti", url: "https://res.cloudinary.com/.../kurti.webp" },
        { name: "lehenga", url: "https://res.cloudinary.com/.../lehenga.png" },
        { name: "anarkali", url: "https://res.cloudinary.com/.../anarkali.png" },
      ];

      const results = {};
      for (const g of garments) {
        try {
          console.log(`📸 Processing ${g.name}...`);
          const garmentBase64 = await downloadAsBase64(g.url);

          const output = await generateTryOnWithRetry(modelBase64, garmentBase64, g.name);

          results[g.name] = `data:image/png;base64,${output}`;
          console.log(`✅ ${g.name} done`);
        } catch (err) {
          console.error(`❌ ${g.name} failed:`, err.message);
          results[g.name] = null;
        }
      }

      return res.json({ success: true, results });
    }

    // ======== ENDPOINT 4: test (Preview Modal test mode) ========
    if (mode === "test") {
      if (!modelFile || !garmentFile)
        return res.status(400).json({
          error: "model & garment required",
        });

      const modelBase64 = modelFile.buffer.toString("base64");
      const garmentBase64 = garmentFile.buffer.toString("base64");
      const outfitType = req.body.outfitType || "saree";

      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`,
      });
    }

    // ======== INVALID MODE ========
    return res.status(400).json({ error: `Invalid mode: ${mode}` });

  } catch (err) {
    console.error("❌ API Error:", err.message);
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
