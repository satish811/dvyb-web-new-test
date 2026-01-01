import express from "express";
import multer from "multer";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import FormData from 'form-data';


dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";



const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY; // Add to your .env file

const getMinimaxHeaders = () => ({
  'Authorization': `Bearer ${MINIMAX_API_KEY}`,
  'Content-Type': 'application/json'
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
app.use(cors());
app.use(express.json());
app.use(express.json()); // ⭐ This must be BEFORE your routes!
app.use(express.urlencoded({ extended: true }));



// Background options with URLs
const backgrounds = [
  {
    id: "hallway",
    name: "Temple Hall",
    image:
      'https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background4_gqcvpg.jpg',
  },

  { id: "pool", name: "Grand Hall", image: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background6_cmouwo.jpg' },
  { id: "wedding", name: "Archway", image: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background5_a9sfuo.jpg' },
  { id: "trees", name: "Floral lights", image: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background11_lctohz.jpg' },

];

// Download garment as base64
async function downloadAsBase64(url) {

  console.log(`📥 Downloading image from: ${url.substring(0, 60)}...`);
  const res = await axios.get(url, { responseType: "arraybuffer" });
  console.log(`✅ Image downloaded successfully (${res.data.length} bytes)`);
  return Buffer.from(res.data).toString("base64");
}









// 3d video 

app.post('/api/video/create', upload.single('tryOnImage'), async (req, res) => {
  console.log('\n🎬 === VIDEO GENERATION REQUEST ===');

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Try-on image required"
      });
    }

    console.log(`📊 Image size: ${req.file.size} bytes`);

    // Upload image to MiniMax (they need a URL)
    // For now, convert to base64 data URL
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

    res.json({
      success: true,
      taskId: task_id,
      message: 'Video generation started'
    });

  } catch (error) {
    console.error('❌ Video creation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create video generation task',
      details: error.response?.data || error.message
    });
  }
});

// 2. Check video status
app.get('/api/video/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const response = await axios.get(
      `${MINIMAX_BASE_URL}/query/video_generation`,
      {
        headers: getMinimaxHeaders(),
        params: { task_id: taskId }
      }
    );

    const data = response.data;

    // Calculate progress
    let progress = 0;
    if (data.status === 'Queueing') progress = 10;
    else if (data.status === 'Preparing') progress = 25;
    else if (data.status === 'Processing') progress = 60;
    else if (data.status === 'Success') progress = 100;

    res.json({
      success: true,
      status: data.status,
      progress: progress,
      file_id: data.file_id,
      taskId: data.task_id
    });

  } catch (error) {
    console.error('❌ Status check error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to check video status',
      details: error.response?.data || error.message
    });
  }
});

// 3. Get video download URL
app.get('/api/video/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

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

    res.json({
      success: true,
      videoUrl: download_url
    });

  } catch (error) {
    console.error('❌ Video retrieval error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve video',
      details: error.response?.data || error.message
    });
  }
});














// ============================================================
// ENDPOINT: /api/change-tryon-background
// ============================================================
app.post('/api/change-tryon-background', upload.single('tryOnImage'), async (req, res) => {
  console.log('\n🎨 === BACKGROUND CHANGE REQUEST ===');

  try {
    if (!req.file) {
      console.log('❌ No try-on image uploaded');
      return res.status(400).json({
        success: false,
        error: "Try-on image is required"
      });
    }

    const { background } = req.body;

    if (!background || !backgrounds[background]) {
      console.log('❌ Invalid background selection');
      return res.status(400).json({
        error: "Valid background selection required",
        availableBackgrounds: Object.keys(backgrounds)
      });
    }

    console.log(`📸 Try-on image size: ${req.file.size} bytes`);
    console.log(`🌍 Selected background: ${backgrounds[background].name}`);

    // Validate image size (max 10MB)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        error: "Image too large. Please use an image smaller than 10MB"
      });
    }

    // Convert try-on result to base64
    const tryOnBase64 = req.file.buffer.toString("base64");
    console.log(`✅ Try-on image converted to base64`);

    // Download background image
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
    console.log('=== BACKGROUND CHANGE COMPLETE ===\n');

    return res.json({
      success: true,
      result: `data:image/png;base64,${result}`,
      background: backgrounds[background].name
    });

  } catch (err) {
    console.error("❌ BACKGROUND CHANGE ERROR:", err.message);
    console.error("❌ Stack:", err.stack);

    if (!res.headersSent) {
      return res.status(500).json({
        error: "Background change failed",
        details: err.message,
      });
    }
  }
});

// Get available backgrounds
app.get("/api/tryon-backgrounds", (req, res) => {
  const bgList = Object.entries(backgrounds).map(([key, value]) => ({
    id: key,
    name: value.name,
    preview: value.url
  }));
  res.json({
    success: true,
    backgrounds: bgList
  });
});


// ============================================================
// ENDPOINT: /api/tryon-from-urls (For Firebase Storage URLs)
// ============================================================
// ============================================================
// ENDPOINT: /api/tryon-from-urls (For Firebase Storage URLs)
// ============================================================
app.post('/api/tryon-from-urls', async (req, res) => {
  console.log('\n🎯 === TRY-ON FROM URLs (MyProfile) ===');

  try {
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
    console.log('=== REQUEST COMPLETE ===\n');

    res.json({
      success: true,
      result: `data:image/png;base64,${output}`
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({
      success: false,
      error: "Try-on generation failed",
      details: err.message
    });
  }
});



// Generate try-on for ONE garment
async function generateTryOn(modelBase64, garmentBase64, garmentName) {
  console.log(`🎨 Generating AI try-on for: ${garmentName}`);

  const isSaree = garmentName.toLowerCase() === 'saree';
  const isBackgroundSwap = garmentName?.toLowerCase()?.includes('background');


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
`
    :
    `
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
              data: modelBase64
            }
          },
          { text: isBackgroundSwap ? "Target background scene:" : `Garment reference (${garmentName}):` },
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

// ⭐ RETRY FUNCTION - FIXED NAME (no typo)
async function generateTryOnWithRetry(modelBase64, garmentBase64, garmentName, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${garmentName}`);
      return await generateTryOn(modelBase64, garmentBase64, garmentName);
    } catch (error) {
      const isRateLimit = error.response?.status === 429 ||
        error.response?.status === 503 ||
        error.message?.includes('quota') ||
        error.message?.includes('rate limit');

      if (isRateLimit && attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Rate limited. Waiting ${waitTime / 1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
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
app.post('/api/tryon', upload.fields([
  { name: 'model', maxCount: 1 },
  { name: 'garment', maxCount: 1 }
]), async (req, res) => {
  console.log('\n🎯 === TRYON REQUEST ===');

  try {
    if (!req.files?.model) {
      return res.status(400).json({
        success: false,
        error: "Model image required"
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
    res.json({
      success: true,
      result: `data:image/png;base64,${output}`
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});



// ============================================================
// ENDPOINT: /api/myprofile-multi-tryon (MyProfile Multi Try-On)
// ============================================================
app.post("/api/myprofile-multi-tryon", upload.single("model"), async (req, res) => {
  console.log('\n🎯 === MY PROFILE MULTI TRY-ON REQUEST ===');

  try {
    // Validate model image
    if (!req.file) {
      console.log('❌ No model image uploaded');
      return res.status(400).json({
        success: false,
        error: "No model image uploaded"
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

    // Generate all try-ons
    const results = await generateMultipleTryOns(modelBase64, garments);

    // Count successful results
    const successCount = Object.values(results).filter(r => r !== null).length;
    console.log(`\n✨ Completed: ${successCount}/${garments.length} successful`);
    console.log('=== REQUEST COMPLETE ===\n');

    res.json({
      success: true,
      results: results
    });

  } catch (err) {
    console.error("❌ MYPROFILE MULTI TRY-ON ERROR:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({
      success: false,
      error: "Multi try-on generation failed",
      details: err.message
    });
  }
});





// ============================================================
// ENDPOINT 1: /api/single-tryon (Used by MyProfile)
// ============================================================
app.post('/api/single-tryon', upload.single('model'), async (req, res) => {
  console.log('\n🎯 === SINGLE TRY-ON REQUEST (MyProfile) ===');

  try {
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

    const garmentBase64 = await downloadAsBase64(garmentUrl);

    // ⭐ USE RETRY FUNCTION
    console.log(`🚀 Starting try-on with retry logic...`);
    const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

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
    console.error("❌ Stack:", err.stack);
    res.status(500).json({
      success: false,
      error: "Try-on generation failed",
      details: err.message
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
  console.log('\n🎯 === MULTI TRY-ON REQUEST (MyProfile) ===');

  try {
    // Validate model image
    if (!req.file) {
      console.log('❌ No model image uploaded');
      return res.status(400).json({
        success: false,
        error: "No model image uploaded"
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

    // Generate all try-ons
    const results = await generateMultipleTryOns(modelBase64, garments);

    // Count successful results
    const successCount = Object.values(results).filter(r => r !== null).length;
    console.log(`\n✨ Completed: ${successCount}/${garments.length} successful`);
    console.log('=== REQUEST COMPLETE ===\n');

    res.json({
      success: true,
      results: results
    });

  } catch (err) {
    console.error("❌ MULTI TRY-ON ERROR:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({
      success: false,
      error: "Multi try-on generation failed",
      details: err.message
    });
  }
});

// Add BEFORE the PORT declaration
app.post('/api/garnment-swap', upload.fields([
  { name: 'model', maxCount: 1 },
  { name: 'garment', maxCount: 1 }
]), async (req, res) => {
  console.log('\n🎯 === TEST TRY-ON REQUEST ===');

  try {
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
    res.json({
      success: true,
      result: `data:image/png;base64,${output}`
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


const PORT = 3004
app.listen(PORT, () => {
  console.log(`\n✨ Try-On Server Started`);
  console.log(`🌐 Running at: http://localhost:${PORT}`);
  console.log(`🔑 Gemini API Key: ${GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`📡 Ready to receive requests...\n`);
});