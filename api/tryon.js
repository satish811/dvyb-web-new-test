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
  limits: { fileSize: 20 * 1024 * 1024 }
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
const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

const getMinimaxHeaders = () => ({
  'Authorization': `Bearer ${MINIMAX_API_KEY}`,
  'Content-Type': 'application/json'
});

// Background options with URLs
const backgrounds = {
  hallway: {
    name: "Temple Hall",
    url: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background4_gqcvpg.jpg',
  },
  pool: {
    name: "Grand Hall",
    url: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background6_cmouwo.jpg',
  },
  wedding: {
    name: "Archway",
    url: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background5_a9sfuo.jpg',
  },
  trees: {
    name: "Floral lights",
    url: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background11_lctohz.jpg',
  },
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
  console.log(`🔍 Getting API key for: ${outfitType}`);
  switch (outfitType?.toLowerCase()) {
    case "saree": return process.env.GEMINI_SAREE_KEY || process.env.GEMINI_API_KEY;
    case "lehenga": return process.env.GEMINI_LEHENGA_KEY || process.env.GEMINI_API_KEY;
    case "kurti": return process.env.GEMINI_KURTI_KEY || process.env.GEMINI_API_KEY;
    case "anarkali": return process.env.GEMINI_ANARKALI_KEY || process.env.GEMINI_API_KEY;
    default:
      console.log(`⚠️ Unknown outfit type, using default key`);
      return process.env.GEMINI_API_KEY;
  }
}

async function downloadAsBase64(url) {
  console.log(`📥 Downloading image from: ${url.substring(0, 60)}...`);
  const res = await axios.get(url, { responseType: "arraybuffer" });
  console.log(`✅ Image downloaded successfully (${res.data.length} bytes)`);
  return Buffer.from(res.data).toString("base64");
}

async function generateTryOn(modelBase64, garmentBase64, outfitType) {
  console.log(`🎨 Generating AI try-on for: ${outfitType}`);

  const lowerType = (outfitType || "").toLowerCase();
  const isSaree = lowerType === "saree";
  const isBackgroundSwap = lowerType === "background-swap";

  const prompt = isBackgroundSwap ? `
ROLE
You are a professional photo editor performing a REALISTIC background replacement.

CORE TASK
- Image 1 contains a real person with transparent or removed background
- Image 2 is the new background scene
- Place the SAME person naturally into the new background

PERSON PRESERVATION (STRICT)
- Keep the person EXACTLY the same:
  - Face, expression, skin tone, hair, body, clothing, pose
- Do NOT modify, replace, or enhance the person in any way

REALISTIC INTEGRATION
- Match lighting direction, intensity, and color temperature to Image 2
- Add realistic ground shadows and contact shadows
- Match perspective and scale so the person fits the environment
- Blend edges cleanly (no cutout artifacts)
- Apply subtle ambient light spill from environment onto the person
- Respect depth of field if present in the background

PROHIBITED
- NO clothing changes
- NO face/body edits
- NO floating placement
- NO text, watermarks, frames, or multiple images
- NEVER return the unchanged input image

OUTPUT
Return ONLY one high-resolution inline_data image of the person realistically placed in the new background.
NO text, JSON, or explanations.
` : `
ROLE
You are a professional fashion photo editor performing a STRICT, photorealistic virtual try-on.

INPUT IMAGES
- Image 1: the real person
- Image 2: the garment reference

MAIN OBJECTIVE
Create ONE realistic photo where:
- The SAME person from Image 1 is wearing the EXACT garment from Image 2
- ONLY the clothing changes — nothing else

IDENTITY & SCENE PRESERVATION (NON-NEGOTIABLE)
- Do NOT change face, facial expression, skin tone, hair, body shape, height, or pose
- Do NOT change background, camera angle, framing, or environment
- Preserve original lighting and shadows from Image 1

CLOTHING TRANSFER RULES
- Completely REMOVE the original outfit from Image 1
- Replace it ONLY with the garment from Image 2
- ALWAYS follow Image 2 for:
  - Neckline
  - Sleeve style and sleeve length (including sleeveless)
  - Cut, fit, silhouette, and garment length
- If Image 1 conflicts with Image 2, Image 2 ALWAYS wins

FABRIC & DESIGN ACCURACY
- Copy ALL visible details from Image 2 exactly:
  - Fabric type, texture, color
  - Embroidery, prints, motifs, borders, sequins, shine, transparency
- Do NOT invent new patterns
- Do NOT simplify or remove embroidery
- Preserve motif placement while adapting to body pose

${isSaree ? `
SAREE-SPECIFIC RULES
- Drape the saree in a natural Nivi style:
  - 8–10 neat pleats tucked at the waist
  - Pallu flowing naturally over the LEFT shoulder
- Saree length should reach the ankles
- The blouse MUST come from Image 2:
  - EXACT neckline, sleeve style and length, back design, and fit
  - If Image 2 blouse is sleeveless, the result MUST be sleeveless
- IGNORE any blouse or top worn in Image 1
` : ``}

REALISM & INTEGRATION
- Garment must follow natural gravity, folds, and body contours
- No floating fabric, broken seams, or cut-and-paste artifacts
- Shadows, highlights, and reflections must match Image 1 lighting
- Output must look like a real camera photograph (not illustration)

STRICTLY PROHIBITED
- NO changes to face, hair, body, pose, or background
- NO added or removed jewelry, accessories, makeup, props, or text
- NO logos, watermarks, frames, or split images
- NEVER return the unchanged input image

OUTPUT
Return ONLY one high-resolution photorealistic inline_data image.
NO text, JSON, or explanations.
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
  console.log(`🚀 Sending request to Gemini API...`);

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
    if (img) {
      console.log(`✅ AI generation successful for ${outfitType}`);
      return img;
    }
  }

  console.log("❌ NO IMAGE FOUND. RAW PARTS:");
  console.log(JSON.stringify(parts, null, 2));
  throw new Error("No image generated from AI");
}

async function generateTryOnWithRetry(m, g, type, max = 3) {
  for (let i = 1; i <= max; i++) {
    try {
      console.log(`🔄 Attempt ${i}/${max} for ${type}`);
      return await generateTryOn(m, g, type);
    } catch (err) {
      const isRateLimit = err.response?.status === 429 ||
        err.response?.status === 503 ||
        err.message?.includes('quota') ||
        err.message?.includes('rate limit');

      if (isRateLimit && i < max) {
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`⏳ Rate limited. Waiting ${waitTime / 1000}s before retry...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }

      console.error(`❌ Attempt ${i} failed:`, err.message);
      throw err;
    }
  }
}


async function generateBlouseChange(tryOnBase64, blouseType) {
  const prompt = `
ROLE
You are a professional fashion photo editor specializing in saree blouse modifications.

TASK
Modify ONLY the blouse in this saree image to a ${blouseType} design.

STRICT RULES
- Keep the SAME person, face, pose, and body
- Keep the SAME saree (fabric, color, design, draping)
- ONLY change the blouse sleeve style to: ${blouseType}
- Maintain realistic fit and proportions
- NO other changes to the image

OUTPUT
Return ONLY one high-resolution photorealistic inline_data image.
NO text or explanations.
`;

  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: tryOnBase64
          }
        }
      ]
    }]
  };

  const response = await axios.post(GEMINI_URL, payload, {
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY
    },
    timeout: 180000
  });

  const parts = response.data.candidates?.[0]?.content?.parts || [];
  const img = parts.find(p => p.inline_data?.data || p.inlineData?.data);
 
  return img?.inline_data?.data || img?.inlineData?.data;
}




async function generateMultipleTryOns(modelBase64, garments) {
  console.log(`🎨 Starting multi try-on for ${garments.length} garments`);
  const results = {};
  
  for (const garment of garments) {
    console.log(`\n📸 Processing ${garment.name}...`);
    
    try {
      const garmentBase64 = await downloadAsBase64(garment.url);
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


// async function generateMultipleTryOns(modelBase64, garments) {

//   console.log(`🎨 Starting multi try-on for ${garments.length} garments`);
//   const results = {};

//   for (const garment of garments) {
//     console.log(`\n📸 Processing ${garment.name}...`);

//     try {
//       const garmentBase64 = await downloadAsBase64(garment.url);
//       const output = await generateTryOnWithRetry(modelBase64, garmentBase64, garment.name);

//       if (output) {
//         results[garment.name] = `data:image/png;base64,${output}`;
//         console.log(`✅ ${garment.name} generated successfully`);
//       } else {
//         console.log(`❌ ${garment.name} generation failed - no output`);
//         results[garment.name] = null;
//       }
//     } catch (error) {
//       console.error(`❌ Error generating ${garment.name}:`, error.message);
//       results[garment.name] = null;
//     }
//   }

//   return results;
// }

// ============ ROUTE HANDLER ============
export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  console.log(`🎯 API called: ${req.method} ${path}`);

  try {
    // ======== GET: /api/tryon-backgrounds ========
    if (req.method === "GET" && path === "/api/tryon-backgrounds") {
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

    // ======== GET: /api/video/status/:taskId ========
    if (req.method === "GET" && path.startsWith("/api/video/status/")) {
      const taskId = path.split('/').pop();

      const response = await axios.get(
        `${MINIMAX_BASE_URL}/query/video_generation`,
        {
          headers: getMinimaxHeaders(),
          params: { task_id: taskId }
        }
      );

      const data = response.data;
      let progress = 0;
      if (data.status === 'Queueing') progress = 10;
      else if (data.status === 'Preparing') progress = 25;
      else if (data.status === 'Processing') progress = 60;
      else if (data.status === 'Success') progress = 100;

      return res.json({
        success: true,
        status: data.status,
        progress: progress,
        file_id: data.file_id,
        taskId: data.task_id
      });
    }

    // ======== GET: /api/video/download/:fileId ========
    if (req.method === "GET" && path.startsWith("/api/video/download/")) {
      const fileId = path.split('/').pop();

      const response = await axios.get(
        `${MINIMAX_BASE_URL}/files/retrieve`,
        {
          headers: getMinimaxHeaders(),
          params: { file_id: fileId }
        }
      );

      const download_url = response.data.file?.download_url;

      if (!download_url) {
        return res.status(404).json({
          success: false,
          error: 'Download URL not found'
        });
      }

      return res.json({
        success: true,
        videoUrl: download_url
      });
    }

    // ======== POST: /api/video/create ========
    if (req.method === "POST" && path === "/api/video/create") {
      console.log('\n🎬 === VIDEO GENERATION REQUEST ===');

      await runMiddleware(req, res, upload.single('tryOnImage'));

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Try-on image required"
        });
      }

      console.log(`📊 Image size: ${req.file.size} bytes`);

      const imageBase64 = req.file.buffer.toString("base64");
      const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

      const payload = {
        model: 'MiniMax-Hailuo-2.3-Fast',
        first_frame_image: imageDataUrl,
        prompt: 'A young woman stands facing the camera. She slowly walks forward three small steps with calm, natural motion. She then performs one slow, graceful full spin with smooth momentum and balanced posture. Finally, she calmly walks backward three steps returning precisely to her original position, ending in the exact starting pose.',
        duration: 6,
        resolution: '1080P',
        prompt_optimizer: true,
        fast_pretreatment: true
      };

      console.log('🚀 Calling MiniMax API...');

      const response = await axios.post(
        `${MINIMAX_BASE_URL}/video_generation`,
        payload,
        { headers: getMinimaxHeaders() }
      );

      const { task_id } = response.data;
      console.log(`✅ Task created: ${task_id}`);

      return res.json({
        success: true,
        taskId: task_id,
        message: 'Video generation started'
      });
    }

    // ======== POST: /api/change-tryon-background ========
    if (req.method === "POST" && path === "/api/change-tryon-background") {
      console.log('\n🎨 === BACKGROUND CHANGE REQUEST ===');

      await runMiddleware(req, res, upload.single('tryOnImage'));

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



    // ======== POST: /api/change-blouse ========
if (req.method === "POST" && path === "/api/change-blouse") {
  console.log('\n👚 === BLOUSE CHANGE REQUEST ===');

  // Run multer in serverless
  await runMiddleware(req, res, upload.single('tryOnImage'));

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Try-on image is required"
    });
  }

  const { blouseType } = req.body;

  if (!blouseType) {
    return res.status(400).json({
      success: false,
      error: "blouseType is required"
    });
  }

  console.log(`👚 Blouse type: ${blouseType}`);
  console.log(`📊 Image size: ${req.file.size} bytes`);

  // Convert image to base64
  const tryOnBase64 = req.file.buffer.toString("base64");

  console.log("🎨 Calling Gemini for blouse modification...");
  const result = await generateBlouseChange(tryOnBase64, blouseType);

  if (!result) {
    throw new Error("No image returned from AI");
  }

  console.log("✨ SUCCESS — Blouse Changed!");

  return res.json({
    success: true,
    blouseType,
    result: `data:image/png;base64,${result}`
  });
}



    // ======== POST: /api/test-tryon ========
    if (req.method === "POST" && path === "/api/garnment-swap") {
      console.log('\n🎯 === TEST TRY-ON REQUEST ===');

      await runMiddleware(
        req,
        res,
        upload.fields([
          { name: 'model', maxCount: 1 },
          { name: 'garment', maxCount: 1 }
        ])
      );

      if (!req.files?.model || !req.files?.garment) {
        return res.status(400).json({
          success: false,
          error: "Both model and garment images required"
        });
      }

      const modelBase64 = req.files.model[0].buffer.toString("base64");
      const garmentBase64 = req.files.garment[0].buffer.toString("base64");

      const outfitType = req.body.outfitType || "saree";

      console.log(`🚀 Generating try-on for ${outfitType}...`);
      const output = await generateTryOnWithRetry(
        modelBase64,
        garmentBase64,
        outfitType
      );

      if (!output) {
        throw new Error("No image generated");
      }

      console.log(`✨ SUCCESS`);
      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`
      });
    }



    // ======== POST: /api/tryon-from-urls ========
    if (req.method === "POST" && path === "/api/tryon-from-urls") {
      console.log('\n🎯 === TRY-ON FROM URLs (MyProfile) ===');

      const { modelUrl, garmentUrl, outfitType } = req.body;

      console.log(`👗 Outfit type: ${outfitType}`);
      console.log(`👤 Model URL: ${modelUrl?.substring(0, 60)}...`);
      console.log(`🔗 Garment URL: ${garmentUrl?.substring(0, 60)}...`);

      if (!modelUrl || !garmentUrl) {
        console.log('❌ Missing URLs');
        return res.status(400).json({
          success: false,
          error: "Both modelUrl and garmentUrl are required"
        });
      }

      const apiKey = getApiKeyByOutfit(outfitType);
      if (!apiKey) {
        console.log('❌ API key not configured');
        return res.status(500).json({
          success: false,
          error: "API key not configured"
        });
      }

      console.log(`📥 Downloading model image...`);
      const modelBase64 = await downloadAsBase64(modelUrl);

      console.log(`📥 Downloading garment image...`);
      const garmentBase64 = await downloadAsBase64(garmentUrl);

      console.log(`🚀 Starting try-on with retry logic...`);
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      if (!output) {
        throw new Error("No image generated from AI");
      }

      console.log(`✨ SUCCESS: Try-on generated for ${outfitType}`);

      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`,
      });
    }

    // ======== POST: /api/single-tryon ========
    if (req.method === "POST" && path === "/api/single-tryon") {
      console.log('\n🎯 === SINGLE TRY-ON REQUEST ===');

      await runMiddleware(req, res, upload.single('model'));

      if (!req.file) {
        console.log('❌ No model image uploaded');
        return res.status(400).json({
          success: false,
          error: "No model image uploaded"
        });
      }

      const { garmentUrl, outfitType } = req.body;
      console.log(`👗 Outfit type: ${outfitType}`);
      console.log(`🔗 Garment URL: ${garmentUrl}`);

      if (!garmentUrl) {
        console.log('❌ No garment URL provided');
        return res.status(400).json({
          success: false,
          error: "No garment URL provided"
        });
      }

      const apiKey = getApiKeyByOutfit(outfitType);
      if (!apiKey) {
        console.log('❌ API key not configured');
        return res.status(500).json({
          success: false,
          error: "API key not configured"
        });
      }

      console.log(`📊 Model image size: ${req.file.size} bytes`);

      const modelBase64 = req.file.buffer.toString("base64");
      console.log(`✅ Model image converted to base64`);

      let garmentBase64;
      if (garmentUrl.startsWith("data:")) {
        console.log('📊 Extracting base64 from data URL...');
        garmentBase64 = garmentUrl.split(",")[1];
      } else {
        console.log('⬇️ Downloading garment from URL...');
        garmentBase64 = await downloadAsBase64(garmentUrl);
      }

      console.log(`🚀 Starting try-on with retry logic...`);
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      if (!output) {
        throw new Error("No image generated from AI");
      }

      console.log(`✅ SUCCESS: Try-on generated for ${outfitType}`);

      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`,
      });
    }

    // ======== POST: /api/multi-tryon ========
    if (req.method === "POST" && path === "/api/multi-tryon") {
      console.log('\n🎯 === MULTI TRY-ON REQUEST ===');

      await runMiddleware(req, res, upload.single("model"));

      if (!req.file) {
        console.log('❌ No model image uploaded');
        return res.status(400).json({
          success: false,
          error: "No model image uploaded"
        });
      }

      console.log(`📊 Model image size: ${req.file.size} bytes`);

      const modelBase64 = req.file.buffer.toString("base64");
      console.log(`✅ Model image converted to base64`);

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
        }
      ];

      console.log(`🚀 Generating try-ons for ${garments.length} garments...`);

      const results = await generateMultipleTryOns(modelBase64, garments);

      const successCount = Object.values(results).filter(r => r !== null).length;
      console.log(`\n✨ Completed: ${successCount}/${garments.length} successful`);

      return res.json({
        success: true,
        results: results
      });
    }

    // ======== POST: /api/tryon ========
    if (req.method === "POST" && path === "/api/tryon") {
      console.log('\n🎯 === GENERAL TRYON REQUEST ===');

      await runMiddleware(
        req,
        res,
        upload.fields([
          { name: 'model', maxCount: 1 },
          { name: 'garment', maxCount: 1 }
        ])
      );

      if (!req.files?.model) {
        return res.status(400).json({
          success: false,
          error: "Model image required"
        });
      }

      const modelBase64 = req.files.model[0].buffer.toString("base64");

      let garmentBase64;
      if (req.files?.garment) {
        garmentBase64 = req.files.garment[0].buffer.toString("base64");
      } else if (req.body.garmentUrl) {
        garmentBase64 = await downloadAsBase64(req.body.garmentUrl);
      } else {
        return res.status(400).json({
          success: false,
          error: "Garment image or URL required"
        });
      }

      const outfitType = req.body.outfitType || "saree";

      console.log(`🚀 Generating try-on for ${outfitType}...`);
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      if (!output) {
        throw new Error("No image generated");
      }

      console.log(`✨ SUCCESS`);
      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`
      });
    }

    // ======== POST: /api/test-tryon ========
    if (req.method === "POST" && path === "/api/test-tryon") {
      console.log('\n🎯 === TEST TRY-ON REQUEST ===');

      await runMiddleware(
        req,
        res,
        upload.fields([
          { name: 'model', maxCount: 1 },
          { name: 'garment', maxCount: 1 }
        ])
      );

      if (!req.files?.model || !req.files?.garment) {
        return res.status(400).json({
          success: false,
          error: "Both model and garment images required"
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
      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`
      });
    }

    // ======== INVALID ROUTE ========
    return res.status(404).json({ error: `Route not found: ${path}` });

  } catch (err) {
    console.error("❌ API Error:", err.message);
    console.error("❌ Stack:", err.stack);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
