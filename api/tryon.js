import axios from "axios";
import multer from "multer";

// ============ VERCEL CONFIG ============
export const config = {
  api: { 
    bodyParser: false, 
    sizeLimit: "20mb",
    responseLimit: false // Allow large responses
  }
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
  const isSaree = outfitType?.toLowerCase() === "saree";

  const prompt = `
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
    contents: [{
      parts: [
        { text: prompt },
        { text: "Person to dress:" },
        { inline_data: { mime_type: "image/jpeg", data: modelBase64 } },
        { text: `Garment reference (${outfitType}):` },
        { inline_data: { mime_type: "image/jpeg", data: garmentBase64 } }
      ]
    }]
  };

  const apiKey = getApiKeyByOutfit(outfitType);
  const response = await axios.post(GEMINI_URL, payload, {
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    timeout: 180000
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
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).json({ message: "OK" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

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

      console.log(`🚀 Generating try-on...`);
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`
      });
    }

    // ======== FILE UPLOAD ENDPOINTS ========
    await runMiddleware(req, res, upload.fields([
      { name: "model", maxCount: 1 },
      { name: "garment", maxCount: 1 }
    ]));

    const modelFile = req.files?.model?.[0];
    const garmentFile = req.files?.garment?.[0];

    // ======== ENDPOINT 2: single (MyProfile single garment) ========
    if (mode === "single") {
      const garmentUrl = req.body.garmentUrl;
      const outfitType = req.body.outfitType || "saree";

      if (!modelFile) return res.status(400).json({ error: "model file missing" });
      if (!garmentUrl) return res.status(400).json({ error: "garmentUrl missing" });

      console.log(`📤 Processing single try-on for ${outfitType}`);
      const modelBase64 = modelFile.buffer.toString("base64");
      
      let garmentBase64;
      if (garmentUrl.startsWith('data:')) {
        garmentBase64 = garmentUrl.split(',')[1];
      } else {
        garmentBase64 = await downloadAsBase64(garmentUrl);
      }

      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`
      });
    }

    // ======== ENDPOINT 3: multi (MyProfile 4 garments) ========
    if (mode === "multi" || mode === "myprofile-multi") {
      if (!modelFile) {
        return res.status(400).json({ error: "model file missing" });
      }

      console.log(`🎨 Processing multi try-on...`);
      const modelBase64 = modelFile.buffer.toString("base64");

      const garments = [
        { name: "saree", url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764159002/saree2_lhrofy.jpg" },
        { name: "kurti", url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764157933/8816O_1_1024x1024_wa4o3j.webp" },
        { name: "lehenga", url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763188140/ChatGPT_Image_Nov_15_2025_11_58_37_AM_cnzfyj.png" },
        { name: "anarkali", url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971671/Anarkali3_uqzket.png" }
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
      if (!modelFile || !garmentFile) {
        return res.status(400).json({ error: "model & garment required" });
      }

      const modelBase64 = modelFile.buffer.toString("base64");
      const garmentBase64 = garmentFile.buffer.toString("base64");
      const outfitType = req.body.outfitType || "saree";

      console.log(`🧪 Test mode try-on for ${outfitType}`);
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`
      });
    }

    // ======== INVALID MODE ========
    return res.status(400).json({ error: `Invalid mode: ${mode}` });

  } catch (err) {
    console.error("❌ API Error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Try-on generation failed"
    });
  }
}