// api/single-tryon.js
import multiparty from "multiparty";
import axios from "axios";

// Gemini API Configuration
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

function getApiKeyByOutfit(outfitType) {
  switch (outfitType?.toLowerCase()) {
    case "saree":
      return process.env.GEMINI_SAREE_KEY;
    case "lehenga":
      return process.env.GEMINI_LEHENGA_KEY;
    case "kurti":
      return process.env.GEMINI_KURTI_KEY;
    case "anarkali":
      return process.env.GEMINI_ANARKALI_KEY;
    default:
      return process.env.GEMINI_SAREE_KEY;
  }
}

// Download garment as base64
async function downloadAsBase64(url) {
  console.log(`📥 Downloading image from: ${url}`);
  const res = await axios.get(url, { responseType: "arraybuffer" });
  console.log(`✅ Image downloaded successfully (${res.data.length} bytes)`);
  return Buffer.from(res.data).toString("base64");
}

// Generate try-on for ONE garment
async function generateTryOn(modelBase64, garmentBase64, garmentName) {
  console.log(`🎨 Generating AI try-on for: ${garmentName}`);

  const isSaree = garmentName.toLowerCase() === "saree";

  const prompt = isSaree
    ? `
You are performing a STRICT virtual try-on for a SAREE.

TASK:
Dress the person in the saree shown in the garment reference image. A saree consists of:
1. A draped cloth (pallu) over the shoulder
2. Pleats at the waist
3. The blouse (visible under the pallu)

CRITICAL SAREE-SPECIFIC REQUIREMENTS:
- Recreate the EXACT saree draping style from the reference image
- Ensure the pallu (draped portion) flows naturally over the left shoulder
- Create realistic pleats at the waist with proper folds and shadows
- Show the blouse under the pallu with matching color/style from reference
- Maintain the saree's border patterns and fabric texture consistently
- Ensure proper length - saree should reach ankles naturally
- Replicate any embroidery, patterns, or embellishments accurately

PERSON PRESERVATION:
- Keep the person's exact face, skin tone, hair, body proportions, and pose UNCHANGED
- Maintain original lighting, shadows, and background
- Do NOT modify facial features, expression, or body shape

REALISM REQUIREMENTS:
- Fabric must drape naturally following body curves and gravity
- Proper perspective and depth in pleats and folds
- Realistic fabric texture (silk, cotton, chiffon, etc.)
- Accurate color matching from reference image
- Smooth blending at all garment edges (NO floating or jagged edges)

PROHIBITED:
- Do NOT change the person's appearance or create a new model
- Do NOT add jewelry, accessories, or props not in original image
- Do NOT modify background or add text/watermarks
- Do NOT return the reference image unchanged

OUTPUT:
- Return ONLY the edited image showing the person wearing the saree
- Single high-resolution inline_data image
- NO text, JSON, descriptions, or explanations

This is a photo-realistic saree virtual try-on task.
Return ONLY the edited try-on image.
`
    : `
You are performing a STRICT virtual try-on task.

TASK:
Replace the person's existing clothing with ONLY the garment from the provided garment image while keeping the person unchanged. The person must wear the garment naturally and convincingly.

REALISM REQUIREMENTS:
- Preserve the person's exact identity: face, skin tone, hair, hands, body shape, pose, and angles must remain identical.
- Garment must follow the person's body curvature, perspective, and pose.
- Match garment fabric material, color accuracy, texture, pattern continuity, and realistic draping.
- Keep correct lighting and shadows consistent with the original model image.
- Ensure garment edges blend smoothly with the body (NO jagged or floating edges).
- Maintain realistic sleeves, neckline, waist, and length according to the garment reference.

PROHIBITED:
- Do NOT modify the face, teeth, eyes, hair, or body proportions.
- Do NOT redraw a new person or change background.
- Do NOT add extra accessories, jewelry, patterns, or text.
- Do NOT generate a fashion catalog model — always use the provided person image.

OUTPUT FORMAT:
- Return ONLY the newly edited image in inline_data format.
- No captions, no description, no JSON, no markdown, no placeholders.
- The final output MUST be a single high-resolution edited image.

STRICT VALIDATION:
If blending the garment is not possible on the exact pose and person, adjust garment to fit correctly — do NOT change the person to fit the garment.

This is a strict photo-realistic clothes replacement task.
Return ONLY the edited try-on image.
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

// Parse multipart form data
function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// Main serverless handler
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("\n🎯 === NEW SINGLE TRY-ON REQUEST ===");

  try {
    const { fields, files } = await parseMultipartForm(req);

    const modelFile = files.model?.[0];
    if (!modelFile) {
      console.log("❌ No model image uploaded");
      return res.status(400).json({ error: "No model image uploaded" });
    }

    const garmentUrl = fields.garmentUrl?.[0];
    const outfitType = fields.outfitType?.[0] || "garment";

    console.log(`👗 Outfit type: ${outfitType}`);
    console.log(`🔗 Garment URL: ${garmentUrl}`);

    if (!garmentUrl) {
      console.log("❌ No garment URL provided");
      return res.status(400).json({ error: "No garment URL provided" });
    }

    const GEMINI_API_KEY = getApiKeyByOutfit(outfitType);
    if (!GEMINI_API_KEY) {
      console.log("❌ GEMINI_API_KEY not configured");
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log(`📊 Model image size: ${modelFile.size} bytes`);

    // Read model file and convert to base64
    const fs = await import("fs");
    const modelBuffer = fs.readFileSync(modelFile.path);
    const modelBase64 = modelBuffer.toString("base64");
    console.log(`✅ Model image converted to base64`);

    // Download and convert garment to base64
    const garmentBase64 = await downloadAsBase64(garmentUrl);

    // Generate try-on
    const output = await generateTryOn(modelBase64, garmentBase64, outfitType);

    if (!output) {
      throw new Error("No image generated from AI");
    }

    console.log(`✨ SUCCESS: Try-on generated for ${outfitType}`);
    console.log("=== REQUEST COMPLETE ===\n");

    res.status(200).json({
      success: true,
      result: `data:image/png;base64,${output}`,
    });
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    console.error(err.stack);
    res.status(500).json({
      error: "Try-on generation failed",
      details: err.message,
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};