// ============================================================
// FILE: api/tryon.js - SINGLE FILE FOR ALL ROUTES
// Works with both /api/tryon AND /api/garnment-swap
// ============================================================

import axios from "axios";
import multer from "multer";

// ============ VERCEL CONFIG ============
export const config = {
  api: { 
    bodyParser: false, 
    sizeLimit: "20mb" 
  },
  maxDuration: 300,
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
ROLE: Professional photo editor performing REALISTIC background replacement.
CORE TASK: Place the SAME person from Image 1 into the new background from Image 2.
PERSON PRESERVATION: Keep face, expression, skin, hair, body, clothing, pose EXACTLY the same.
REALISTIC INTEGRATION: Match lighting, add shadows, blend edges cleanly.
OUTPUT: Return ONLY one high-resolution inline_data image.
` : `
ROLE: Professional fashion photo editor performing STRICT, photorealistic virtual try-on.
INPUT: Image 1 = real person, Image 2 = garment reference.
MAIN OBJECTIVE: Same person wearing EXACT garment from Image 2. ONLY clothing changes.
IDENTITY PRESERVATION: Do NOT change face, hair, body, pose, background, lighting.
${isSaree ? `
SAREE-SPECIFIC: Drape in Nivi style with 8-10 pleats, pallu over LEFT shoulder.
Blouse MUST match Image 2 exactly (neckline, sleeves, fit).
` : ''}
OUTPUT: Return ONLY one high-resolution photorealistic inline_data image.
`;

  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { text: isBackgroundSwap ? "Person:" : "Person to dress:" },
        { inline_data: { mime_type: "image/jpeg", data: modelBase64 } },
        { text: isBackgroundSwap ? "Background:" : `Garment (${outfitType}):` },
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
      const isRateLimit = err.response?.status === 429 || err.response?.status === 503;
      if (isRateLimit && i < max) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        continue;
      }
      throw err;
    }
  }
}

async function generateMultipleTryOns(modelBase64, garments) {
  const results = {};
  for (const g of garments) {
    try {
      const garmentBase64 = await downloadAsBase64(g.url);
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, g.name);
      results[g.name] = output ? `data:image/png;base64,${output}` : null;
    } catch (error) {
      results[g.name] = null;
    }
  }
  return results;
}

// ============ MAIN HANDLER ============
export default async function handler(req, res) {
  // ⭐ KEY FIX: Use req.url directly (Vercel provides full path)
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  console.log(`🎯 ${req.method} ${path}`);

  try {
    // ======== GET: /api/tryon-backgrounds ========
    if (req.method === "GET" && path === "/api/tryon-backgrounds") {
      const bgList = Object.entries(backgrounds).map(([key, value]) => ({
        id: key,
        name: value.name,
        preview: value.url
      }));
      return res.json({ success: true, backgrounds: bgList });
    }

    // ======== GET: /api/video/status/:taskId ========
    if (req.method === "GET" && path.startsWith("/api/video/status/")) {
      const taskId = path.split('/').pop();
      const response = await axios.get(
        `${MINIMAX_BASE_URL}/query/video_generation`,
        { headers: getMinimaxHeaders(), params: { task_id: taskId } }
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
        progress,
        file_id: data.file_id,
        taskId: data.task_id
      });
    }

    // ======== GET: /api/video/download/:fileId ========
    if (req.method === "GET" && path.startsWith("/api/video/download/")) {
      const fileId = path.split('/').pop();
      const response = await axios.get(
        `${MINIMAX_BASE_URL}/files/retrieve`,
        { headers: getMinimaxHeaders(), params: { file_id: fileId } }
      );

      const download_url = response.data.file?.download_url;
      if (!download_url) {
        return res.status(404).json({ success: false, error: 'Download URL not found' });
      }

      return res.json({ success: true, videoUrl: download_url });
    }

    // ======== POST: /api/video/create ========
    if (req.method === "POST" && path === "/api/video/create") {
      await runMiddleware(req, res, upload.single('tryOnImage'));

      if (!req.file) {
        return res.status(400).json({ success: false, error: "Try-on image required" });
      }

      const imageBase64 = req.file.buffer.toString("base64");
      const payload = {
        model: 'MiniMax-Hailuo-2.3-Fast',
        first_frame_image: `data:image/jpeg;base64,${imageBase64}`,
        prompt: req.body.prompt || 'Professional fashion model pose',
        duration: 6,
        resolution: '1080P',
        prompt_optimizer: true,
        fast_pretreatment: true
      };

      const response = await axios.post(
        `${MINIMAX_BASE_URL}/video_generation`,
        payload,
        { headers: getMinimaxHeaders() }
      );

      return res.json({ 
        success: true,
        taskId: response.data.task_id,
        message: 'Video generation started'
      });
    }

    // ======== POST: /api/change-tryon-background ========
    if (req.method === "POST" && path === "/api/change-tryon-background") {
      await runMiddleware(req, res, upload.single('tryOnImage'));

      if (!req.file) {
        return res.status(400).json({ success: false, error: "Try-on image required" });
      }

      const background = req.body.background;
      if (!background || !backgrounds[background]) {
        return res.status(400).json({
          error: "Valid background required",
          availableBackgrounds: Object.keys(backgrounds)
        });
      }

      const tryOnBase64 = req.file.buffer.toString("base64");
      const bgBase64 = await downloadAsBase64(backgrounds[background].url);
      const result = await generateTryOnWithRetry(tryOnBase64, bgBase64, "background-swap");

      return res.json({
        success: true,
        result: `data:image/png;base64,${result}`,
        background: backgrounds[background].name
      });
    }

    // ⭐ KEY ROUTE: POST: /api/garnment-swap ========
    if (req.method === "POST" && path === "/api/garnment-swap") {
      console.log('🎯 === GARMENT SWAP REQUEST ===');
      
      await runMiddleware(req, res, upload.fields([
        { name: 'model', maxCount: 1 },
        { name: 'garment', maxCount: 1 }
      ]));

      if (!req.files?.model || !req.files?.garment) {
        return res.status(400).json({ 
          success: false,
          error: "Both model and garment images required" 
        });
      }

      const modelBase64 = req.files.model[0].buffer.toString("base64");
      const garmentBase64 = req.files.garment[0].buffer.toString("base64");
      const outfitType = req.body.outfitType || "saree";

      console.log(`🚀 Generating ${outfitType}...`);
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      console.log(`✅ SUCCESS`);
      return res.status(200).json({
        success: true,
        result: `data:image/png;base64,${output}`
      });
    }

    // ======== POST: /api/tryon-from-urls ========
    if (req.method === "POST" && path === "/api/tryon-from-urls") {
      const { modelUrl, garmentUrl, outfitType } = req.body;

      if (!modelUrl || !garmentUrl) {
        return res.status(400).json({ success: false, error: "Both URLs required" });
      }

      const modelBase64 = await downloadAsBase64(modelUrl);
      const garmentBase64 = await downloadAsBase64(garmentUrl);
      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`
      });
    }

    // ======== POST: /api/single-tryon ========
    if (req.method === "POST" && path === "/api/single-tryon") {
      await runMiddleware(req, res, upload.single('model'));

      if (!req.file) {
        return res.status(400).json({ success: false, error: "Model image required" });
      }

      const { garmentUrl, outfitType } = req.body;
      if (!garmentUrl) {
        return res.status(400).json({ success: false, error: "Garment URL required" });
      }

      const modelBase64 = req.file.buffer.toString("base64");
      const garmentBase64 = garmentUrl.startsWith("data:") 
        ? garmentUrl.split(",")[1]
        : await downloadAsBase64(garmentUrl);

      const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

      return res.json({
        success: true,
        result: `data:image/png;base64,${output}`
      });
    }

    // ======== POST: /api/multi-tryon ========
    if (req.method === "POST" && path === "/api/multi-tryon") {
      await runMiddleware(req, res, upload.single("model"));

      if (!req.file) {
        return res.status(400).json({ success: false, error: "Model image required" });
      }

      const modelBase64 = req.file.buffer.toString("base64");
      const garments = [
        { name: "saree", url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764159002/saree2_lhrofy.jpg" },
        { name: "kurti", url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764157933/8816O_1_1024x1024_wa4o3j.webp" },
        { name: "lehenga", url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763188140/ChatGPT_Image_Nov_15_2025_11_58_37_AM_cnzfyj.png" },
        { name: "anarkali", url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971671/Anarkali3_uqzket.png" }
      ];

      const results = await generateMultipleTryOns(modelBase64, garments);
      return res.json({ success: true, results });
    }

    // ======== 404 - Route Not Found ========
    console.log(`❌ Route not found: ${path}`);
    return res.status(404).json({ 
      error: "Route not found",
      path,
      method: req.method
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}