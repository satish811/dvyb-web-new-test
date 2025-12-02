

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
      return process.env.GEMINI_SAREE_KEY; // fallback key
  }
}



const upload = multer({ storage: multer.memoryStorage() });
const app = express();
app.use(cors());
app.use(express.json());

// Download garment as base64
async function downloadAsBase64(url) {
  console.log(`📥 Downloading image from: ${url}`);
  const res = await axios.get(url, { responseType: "arraybuffer" });
  console.log(`✅ Image downloaded successfully (${res.data.length} bytes)`);
  return Buffer.from(res.data).toString("base64");
}

// Generate try-on for ONE garment
// Generate try-on for ONE garment
async function generateTryOn(modelBase64, garmentBase64, garmentName) {
  console.log(`🎨 Generating AI try-on for: ${garmentName}`);
  
  // Use specialized prompt for sarees (complex draping)
  const isSaree = garmentName.toLowerCase() === 'saree';
  
  const prompt = isSaree ? `
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
` : `
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
              data: modelBase64
            }
          },
          { text: `Garment reference (${garmentName}):` },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: garmentBase64
            }
          }
        ]
      }
    ]
  };





  // Rest of the function stays the same...
  try {
    console.log(`🚀 Sending request to Gemini API...`);
  const apiKeyToUse = getApiKeyByOutfit(garmentName);

const response = await axios.post(GEMINI_URL, payload, {
  headers: {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKeyToUse
  },
  timeout: 180000
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




if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not found in environment variables");
}

// ==================== GEMINI UTILITY FUNCTIONS ====================

/**
 * Download image from URL and convert to base64
 */
async function downloadImageAsBase64(url) {
  console.log(`📥 Downloading image from: ${url.substring(0, 60)}...`);
  try {
    const response = await axios.get(url, { 
      responseType: "arraybuffer",
      timeout: 30000,
      maxContentLength: 10 * 1024 * 1024 // 10MB limit
    });
    
    const base64 = Buffer.from(response.data).toString("base64");
    console.log(`✅ Image downloaded (${(response.data.length / 1024).toFixed(2)} KB)`);
    return base64;
  } catch (error) {
    console.error(`❌ Image download failed:`, error.message);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

/**
 * Generate try-on using Gemini API
 */
async function generateGeminiTryOn(modelBase64, garmentBase64, category = "auto") {
  console.log(`🎨 Generating AI try-on with Gemini...`);
  console.log(`   Category: ${category}`);
  
  // Determine if this is a saree (complex draping)
  const isSaree = category.toLowerCase().includes('saree');
  
  // Choose appropriate prompt based on garment type
  const prompt = isSaree ? `
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
` : `
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


function detectMimeType(base64String) {
  if (base64String.startsWith("iVBOR")) return "image/png"; // PNG
  if (base64String.startsWith("/9j")) return "image/jpeg"; // JPG
  return "image/jpeg"; // fallback
}

const garmentMime = detectMimeType(garmentBase64);

// Prepare Gemini API payload
const payload = {
  contents: [
    {
      parts: [
        { text: prompt },
        { text: "Person to dress:" },
        {
          inline_data: {
            mime_type: "image/jpeg", // Model always JPEG
            data: modelBase64
          }
        },
        { text: `Garment reference (${category}):` },
        {
          inline_data: {
            mime_type: garmentMime, // Garment auto-detected type
            data: garmentBase64
          }
        }
      ]
    }
  ]
};




  try {
    console.log(`🚀 Sending request to Gemini API...`);
    
    const response = await axios.post(GEMINI_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      timeout: 180000, // 3 minutes timeout
      maxContentLength: 50 * 1024 * 1024 // 50MB
    });

    console.log(`📡 Gemini API responded with status: ${response.status}`);

    // Extract image from response
    const parts = response.data.candidates?.[0]?.content?.parts || [];
    let generatedImageBase64 = null;

    for (const part of parts) {
      const imageData = part.inline_data?.data || part.inlineData?.data;
      if (imageData && !generatedImageBase64) {
        generatedImageBase64 = imageData;
        break;
      }
    }

    if (!generatedImageBase64) {
      console.error("❌ NO IMAGE FOUND in Gemini response");
      console.log("Response parts:", JSON.stringify(parts, null, 2));
      throw new Error("No image generated from Gemini AI");
    }

    console.log(`✅ AI generation successful! Image size: ${(generatedImageBase64.length / 1024).toFixed(2)} KB`);
    return generatedImageBase64;

  } catch (error) {
    console.error(`❌ Gemini API error:`, error.message);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    }
    
    throw new Error(`Gemini API failed: ${error.message}`);
  }
}

// ✅ Single try-on endpoint


// BEST & FINAL SINGLE TRY-ON ENDPOINT — Supports both file upload & URL


// UNIVERSAL SINGLE TRY-ON ENDPOINT
// app.post('/api/single-tryon', upload.fields([
//   { name: 'model', maxCount: 1 },
//   { name: 'garment', maxCount: 1 }
// ]), async (req, res) => {
//   console.log('\n🎯 === SINGLE TRY-ON REQUEST ===');

//   try {
//     let modelBase64 = null;
//     let garmentBase64 = null;

//     const outfitType = req.body.outfitType || "outfit";

//     // ✅ Model is ALWAYS required (file upload)
//     if (!req.files?.model?.[0]) {
//       return res.status(400).json({ error: "Model image required" });
//     }
//     modelBase64 = req.files.model[0].buffer.toString("base64");
//     console.log("📌 Model received (file)");

//     // =======================
//     //  Garment Input Handling
//     // =======================
    
//     // Option A: Garment file upload (TRY-ON SWAPPING)
//     if (req.files?.garment?.[0]) {
//       garmentBase64 = req.files.garment[0].buffer.toString("base64");
//       console.log("👗 Garment received (FILE)");
//     }

//     // Option B: Garment via URL (PROFILE CREATION FLOW)
//     else if (req.body.garmentUrl) {
//       console.log("🔗 Garment via URL:", req.body.garmentUrl);
//       garmentBase64 = await downloadImageAsBase64(req.body.garmentUrl);
//       console.log("🎯 Garment downloaded from URL");
//     }

//     else {
//       return res.status(400).json({ error: "Garment file or garmentUrl required" });
//     }

//     // =======================
//     //    AI Try-On Request
//     // =======================
//     console.log(`🚀 Processing try-on for: ${outfitType}`);
//     const aiOutputBase64 = await generateGeminiTryOn(modelBase64, garmentBase64, outfitType);

//     if (!aiOutputBase64) {
//       throw new Error("AI did not return an image");
//     }

//     console.log("🎉 Try-on successful!");

//     // Response
//     return res.json({
//       success: true,
//       result: `data:image/png;base64,${aiOutputBase64}`
//     });

//   } catch (err) {
//     console.error("❌ Try-on failed ➜", err.message);
//     res.status(500).json({
//       success: false,
//       error: "Try-on failed",
//       details: err.message
//     });
//   }
// });


















// 2d latest tryon 
// app.post('/api/single-tryon', upload.fields([
//   { name: 'model', maxCount: 1 },
//   { name: 'garment', maxCount: 1 }
// ]), async (req, res) => {
//   console.log('\n=== NEW GEMINI TRY-ON REQUEST ===');

//   try {
//     let modelBase64, garmentBase64;
//     let outfitType = req.body.outfitType || "garment";

//     // 1. Model image (uploaded file)
//     if (req.files?.model?.[0]) {
//       modelBase64 = req.files.model[0].buffer.toString("base64");
//       console.log("Model image from upload");
//     } else {
//       return res.status(400).json({ error: "Model image required" });
//     }

//     // 2. Garment image — accept EITHER uploaded file OR URL

//     if (req.files?.garment?.[0]) {
//       garmentBase64 = req.files.garment[0].buffer.toString("base64");
//       console.log("Garment from uploaded file");
//     } else if (req.body.garmentUrl) {
//       console.log("Garment from URL:", req.body.garmentUrl);
//       garmentBase64 = await downloadImageAsBase64(req.body.garmentUrl);
//     } else {
//       return res.status(400).json({ error: "Garment image or URL required" });
//     }

//     console.log(`Outfit type: ${outfitType}`);
//     console.log(`Starting AI generation...`);

//     // Use your existing generateGeminiTryOn (the best one)
//     const resultBaseBase64 = await generateGeminiTryOn(modelBase64, garmentBase64, outfitType);

//     console.log("SUCCESS: Try-on generated perfectly!");
//     console.log('=== REQUEST COMPLETE ===\n');

//     res.json({
//       success: true,
//       result: `data:image/png;base64,${resultBase64}`
//     });

//   } catch (err) {
//     console.error("TRY-ON FAILED:", err.message);
//     res.status(500).json({
//       success: false,
//       error: "Try-on failed",
//       details: err.message
//     });
//   }
// });




// old single tryon in profile 





app.post('/api/single-tryon', upload.single('model'), async (req, res) => {
  console.log('\n🎯 === NEW SINGLE TRY-ON REQUEST ===');
  
  try {
    if (!req.file) {
      console.log('❌ No model image uploaded');
      return res.status(400).json({ error: "No model image uploaded" });
    }

    const { garmentUrl, outfitType } = req.body;
    console.log(`👗 Outfit type: ${outfitType}`);
    console.log(`🔗 Garment URL: ${garmentUrl}`);
    
    if (!garmentUrl) {
      console.log('❌ No garment URL provided');
      return res.status(400).json({ error: "No garment URL provided" });
    }

    if (!GEMINI_API_KEY) {
      console.log('❌ GEMINI_API_KEY not configured');
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log(`📊 Model image size: ${req.file.size} bytes`);

    // Convert model image to base64
    const modelBase64 = req.file.buffer.toString("base64");
    console.log(`✅ Model image converted to base64`);
    
    // Download and convert garment to base64
    const garmentBase64 = await downloadAsBase64(garmentUrl);
    
    // Generate try-on
    const output = await generateTryOn(modelBase64, garmentBase64, outfitType);

    if (!output) {
      throw new Error("No image generated from AI");
    }

    console.log(`✨ SUCCESS: Try-on generated for ${outfitType}`);
    console.log('=== REQUEST COMPLETE ===\n');

    res.json({
      success: true,
      result: `data:image/png;base64,${output}`
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    console.error(err.stack);
    res.status(500).json({
      error: "Try-on generation failed",
      details: err.message
    });
  }
});




// Multi try-on endpoint (original)
app.post("/api/multi-tryon", upload.single("model"), async (req, res) => {
  console.log('\n🎯 === NEW MULTI TRY-ON REQUEST ===');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No model image uploaded" });
    }

    const modelBase64 = req.file.buffer.toString("base64");
    const garments = [
      {
        name: "saree",
        url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763213100/modeltryon_wsilt2.jpg"
      },
      {
        name: "kurti",
        url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763963486/uocufnkfbgsfranfg28w.jpg"
      },
      {
        name: "lehenga",
        url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763188140/ChatGPT_Image_Nov_15_2025_11_58_37_AM_cnzfyj.png"
      }
    ];

    const results = {};

    for (const g of garments) {
      console.log(`\n📸 Processing ${g.name}...`);
      const garmentBase64 = await downloadAsBase64(g.url);
      const output = await generateTryOn(modelBase64, garmentBase64, g.name);

      results[g.name] = output ? `data:image/png;base64,${output}` : null;
      
      if (output) {
        console.log(`✅ ${g.name} generated successfully`);
      } else {
        console.log(`❌ ${g.name} generation failed`);
      }
    }

    console.log("\n🎉 All try-ons completed");
    console.log('=== REQUEST COMPLETE ===\n');

    res.json({
      success: true,
      results
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({
      error: "Try-on generation failed",
      details: err.message
    });
  }
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`\n✨ Try-On Server Started`);
  console.log(`🌐 Running at: http://localhost:${PORT}`);
  console.log(`🔑 Gemini API Key: ${GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`📡 Ready to receive requests...\n`);
});
