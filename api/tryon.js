// // ============================================================
// // FILE: api/tryon.js (Vercel Serverless Function)
// // Complete virtual try-on API with multiple modes
// // ============================================================

// import axios from "axios";
// import multer from "multer";
// import cloudinary from "cloudinary";
// import { GoogleAuth } from "google-auth-library";


// // ============ VERCEL CONFIG ============
// export const config = {
//   api: {
//     bodyParser: false,
//     sizeLimit: "20mb"
//   },
//   maxDuration: 300, // 5 minutes for complex operations
// };

// // CLAUDINARY CONFIGS

// cloudinary.v2.config({
//   cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.VITE_CLOUDINARY_API_KEY,
//   api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
// });



// // ============ MULTER SETUP ============
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 20 * 1024 * 1024 }
// });

// function runMiddleware(req, res, fn) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result) => {
//       if (result instanceof Error) return reject(result);
//       return resolve(result);
//     });
//   });
// }

// // ============ CONSTANTS ============
// const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";
// const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
// const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

// // Vertex AI Virtual Try-On (no prompting)
// const VERTEX_PROJECT_ID = process.env.GOOGLE_PROJECT_ID || "dvyb-8b572";
// const VERTEX_LOCATION = process.env.GOOGLE_LOCATION || "us-central1";
// const VERTEX_MODEL_ID = process.env.VERTEX_VIRTUAL_TRYON_MODEL_ID || "virtual-try-on-001";
// const VERTEX_SCOPES = ["https://www.googleapis.com/auth/cloud-platform"];

// let _vertexClient;
// async function getVertexClient() {
//   if (_vertexClient) return _vertexClient;

//   const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
//   let auth;
//   if (serviceAccountJson) {
//     let credentials;
//     try {
//       credentials = JSON.parse(serviceAccountJson);
//     } catch {
//       throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON (must be valid JSON)");
//     }
//     auth = new GoogleAuth({ credentials, scopes: VERTEX_SCOPES });
//   } else {
//     auth = new GoogleAuth({ scopes: VERTEX_SCOPES });
//   }

//   _vertexClient = await auth.getClient();
//   return _vertexClient;
// }

// async function generateVertexVirtualTryOn(personBase64, garmentBase64, garmentType = "upper_and_lower_body") {
//   if (!VERTEX_PROJECT_ID) {
//     throw new Error("Missing GOOGLE_PROJECT_ID (required for Vertex Virtual Try-On)");
//   }

//   const url = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/${VERTEX_MODEL_ID}:predict`;

//   const requestBody = {
//     instances: [
//       {
//         personImage: { image: { bytesBase64Encoded: personBase64 } },
//         productImages: [{ image: { bytesBase64Encoded: garmentBase64 } }],
//         productType: "APPAREL",
//       },
//     ],
//     parameters: {
//       garmentType,
//       sampleCount: 1,
//       preserveGarmentShape: true,
//       poseAlignment: true,
//       outputStyle: "realistic",
//     },
//   };

//   const client = await getVertexClient();
//   const response = await client.request({
//     url,
//     method: "POST",
//     data: requestBody,
//     timeout: 120000,
//   });

//   const predictions = response?.data?.predictions || [];
//   const first = predictions[0] || {};
//   const bytes = first.bytesBase64Encoded || first.image?.bytesBase64Encoded;
//   if (!bytes) {
//     throw new Error("Vertex Virtual Try-On returned no image bytes");
//   }
//   return bytes;
// }

// const getMinimaxHeaders = () => ({
//   'Authorization': `Bearer ${MINIMAX_API_KEY}`,
//   'Content-Type': 'application/json'
// });

// // Background options with URLs
// const backgrounds = {
//   hallway: {
//     name: "Temple Hall",
//     url: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background4_gqcvpg.jpg',
//   },
//   pool: {
//     name: "Grand Hall",
//     url: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background6_cmouwo.jpg',
//   },
//   wedding: {
//     name: "Archway",
//     url: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970854/background5_a9sfuo.jpg',
//   },
//   trees: {
//     name: "Floral lights",
//     url: 'https://res.cloudinary.com/doiezptnn/image/upload/v1765970853/background11_lctohz.jpg',
//   },
// };

// // Garments for multi try-on
// const garments = [
//   {
//     name: "saree",
//     url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764159002/saree2_lhrofy.jpg"
//   },
//   {
//     name: "kurti",
//     url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764157933/8816O_1_1024x1024_wa4o3j.webp"
//   },
//   {
//     name: "lehenga",
//     url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763188140/ChatGPT_Image_Nov_15_2025_11_58_37_AM_cnzfyj.png"
//   },
//   {
//     name: "anarkali",
//     url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971671/Anarkali3_uqzket.png"
//   },
// ];

// // ============ HELPER FUNCTIONS ============
// function getApiKeyByOutfit(outfitType) {
//   console.log(`🔍 Getting API key for: ${outfitType}`);
//   switch (outfitType?.toLowerCase()) {
//     case "saree": return process.env.GEMINI_SAREE_KEY || process.env.GEMINI_API_KEY;
//     case "lehenga": return process.env.GEMINI_LEHENGA_KEY || process.env.GEMINI_API_KEY;
//     case "kurti": return process.env.GEMINI_KURTI_KEY || process.env.GEMINI_API_KEY;
//     case "anarkali": return process.env.GEMINI_ANARKALI_KEY || process.env.GEMINI_API_KEY;
//     default:
//       console.log(`⚠️ Unknown outfit type, using default key`);
//       return process.env.GEMINI_API_KEY;
//   }
// }

// async function downloadAsBase64(url) {
//   console.log(`📥 Downloading image from: ${url.substring(0, 60)}...`);
//   const res = await axios.get(url, { responseType: "arraybuffer" });
//   console.log(`✅ Image downloaded successfully (${res.data.length} bytes)`);
//   return Buffer.from(res.data).toString("base64");
// }
// async function generateTryOn(modelBase64, garmentBase64, garmentName, outfitType) {
//   console.log(`🎨 Generating AI try-on for: ${outfitType}`);

//   // const lowerType = (outfitType || "").toLowerCase();
//   // const isSaree = lowerType === "saree";
//   // const isBackgroundSwap = lowerType === "background-swap";

//   const isBackgroundSwap = garmentName?.toLowerCase()?.includes('background');
//   const lowerName = garmentName?.toLowerCase() || "";

//   // const isBackgroundSwap = lowerName.includes("background");
//   const isSaree = lowerName === "saree";
//   const isLehenga = lowerName === "lehenga";
//   const isAnarkali = lowerName === "anarkali";
//   const isSharara = lowerName === "sharara";
//   const isKurtaSet = lowerName === "kurta set" || lowerName === "kurta sets";

//   // Apparel try-on uses Vertex Virtual Try-On.
//   // Background swap can optionally use Vertex too (guarded by env flag), otherwise Gemini.
//   if (!isBackgroundSwap) {
//     console.log("🧵 Using Vertex Virtual Try-On model...");
//     return await generateVertexVirtualTryOn(modelBase64, garmentBase64);
//   }

//   if (process.env.VERTEX_ENABLE_BACKGROUND_SWAP === "true") {
//     try {
//       console.log("🧵 Using Vertex Virtual Try-On for background swap (enabled by VERTEX_ENABLE_BACKGROUND_SWAP=true)...");
//       return await generateVertexVirtualTryOn(modelBase64, garmentBase64);
//     } catch (error) {
//       console.warn("⚠️ Vertex background swap failed; falling back to Gemini.");
//       console.warn(error?.response?.data || error?.message || error);
//     }
//   }

//   const prompt = `
//   ROLE
//   You are a professional photo editor performing a REALISTIC background replacement.

//   CORE TASK
//   - Image 1 contains a person with transparent or removed background (human OR AI-generated)
//   - Image 2 is the new background scene
//   - Place the SAME person naturally into Image 2

//   IDENTITY LOCK (ABSOLUTE)
//   - Face, expression, skin tone, hair, body shape, pose → UNCHANGED
//   - Clothing remains exactly the same
//   - No beautification, enhancement, or reshaping

//   REALISTIC INTEGRATION
//   - Match lighting direction, intensity, and color temperature
//   - Add natural ground and contact shadows
//   - Match perspective and scale
//   - Clean edge blending only
//   - Subtle ambient light spill if present

//   PROHIBITED
//   - No clothing changes
//   - No face/body edits
//   - No floating placement
//   - No text, watermarks, or frames
//   - NEVER return unchanged input

//   OUTPUT
//   Return ONE high-resolution inline_data image only.
//   `;








//   // async function generateTryOn(modelBase64, garmentBase64,garmentName, outfitType) {

//   //   // const lowerType = (outfitType || "").toLowerCase();
//   //   // const isSaree = lowerType === "saree";
//   //   // const isBackgroundSwap = lowerType === "background-swap";

//   //    const isBackgroundSwap = garmentName?.toLowerCase()?.includes('background');
//   // const lowerName = garmentName?.toLowerCase() || "";

//   // // const isBackgroundSwap = lowerName.includes("background");
//   // const isSaree = lowerName === "saree";
//   // const isLehenga = lowerName === "lehenga";
//   // const isAnarkali = lowerName === "anarkali";
//   // const isSharara = lowerName === "sharara";
//   // const isKurtaSet = lowerName === "kurta set" || lowerName === "kurta sets";

//   // const prompt = isBackgroundSwap
//   // ? `
//   // ROLE
//   // You are a professional photo editor performing a REALISTIC background replacement.

//   // CORE TASK
//   // - Image 1 contains a person with transparent or removed background (human OR AI-generated)
//   // - Image 2 is the new background scene
//   // - Place the SAME person naturally into Image 2

//   // IDENTITY LOCK (ABSOLUTE)
//   // - Face, expression, skin tone, hair, body shape, pose → UNCHANGED
//   // - Clothing remains exactly the same
//   // - No beautification, enhancement, or reshaping

//   // REALISTIC INTEGRATION
//   // - Match lighting direction, intensity, and color temperature
//   // - Add natural ground and contact shadows
//   // - Match perspective and scale
//   // - Clean edge blending only
//   // - Subtle ambient light spill if present

//   // PROHIBITED
//   // - No clothing changes
//   // - No face/body edits
//   // - No floating placement
//   // - No text, watermarks, or frames
//   // - NEVER return unchanged input

//   // OUTPUT
//   // Return ONE high-resolution inline_data image only.
//   // `
//   // :
//   // `
//   // ROLE
//   // Expert fashion AI specializing in STRICT photorealistic Indian ethnic wear virtual try-on.

//   // INPUT IMAGES
//   // - Image 1: Person image (HUMAN OR AI-generated)
//   // - Image 2: Garment reference (HUMAN photo OR AI-generated design)

//   // CORE OBJECTIVE
//   // Create ONE realistic photograph where:
//   // - The SAME person from Image 1 wears the EXACT garment from Image 2
//   // - ONLY the clothing may change

//   // ━━━━━━━━━━ INTELLIGENT IMAGE ANALYSIS ━━━━━━━━━━
//   // Analyze BOTH images before generation:

//   // PERSON IMAGE (Image 1)
//   // - If human → preserve natural anatomy and lighting
//   // - If AI-generated → preserve proportions, pose, and facial identity
//   // In ALL cases: Image 1 defines identity, pose, body shape, and background

//   // GARMENT IMAGE (Image 2)
//   // - If AI-generated (flat lighting, symmetry, clean background):
//   //   → Extract garment design as TEMPLATE
//   //   → Ignore model/background
//   //   → Reconstruct realistic fabric physics and drape
//   // - If real photograph:
//   //   → Copy garment appearance EXACTLY
//   //   → Preserve natural folds, texture, and imperfections

//   // Image 2 is the ABSOLUTE SOURCE OF TRUTH for garment design.

//   // ━━━━━━━━━━ GLOBAL IDENTITY & SCENE LOCK ━━━━━━━━━━
//   // - Face, hair, skin tone, body shape, height, pose → UNCHANGED
//   // - Background, camera angle, framing → UNCHANGED
//   // - No beautification, stylisation, cleanup, or enhancement

//   // ━━━━━━━━━━ UNIVERSAL GARMENT TRANSFER RULES ━━━━━━━━━━

//   // 1. COLOR ACCURACY
//   // - Extract exact fabric colors from Image 2 only
//   // - Ignore background color bleeding
//   // - No hue, saturation, brightness, gamma shifts
//   // - Adapt shadows ONLY to Image 1 lighting

//   // 2. PATTERN & EMBELLISHMENT
//   // - Transfer ALL embroidery, prints, zari, motifs, borders
//   // - Maintain exact scale, density, and placement
//   // - No simplification or regeneration

//   // 3. FABRIC PROPERTIES
//   // - Preserve texture: silk shine, cotton matte, georgette flow
//   // - Maintain transparency and fabric weight
//   // - Retain weave and material realism

//   // 4. DRAPING & PHYSICS
//   // - Apply natural gravity-based folds
//   // - If Image 2 is flat/ideal → add realistic draping
//   // - If Image 2 shows natural drape → preserve style
//   // - No floating or broken fabric

//   // ━━━━━━━━━━ GARMENT STRUCTURE RULES ━━━━━━━━━━
//   // ${isSaree ? `
//   // SAREE (CRITICAL)
//   // - ONE continuous fabric (not skirt + dupatta)
//   // - Natural Nivi drape ONLY
//   // - 6–8 waist pleats
//   // - Pallu over LEFT shoulder
//   // - Blouse must match Image 2 EXACTLY
//   // ` : ``}

//   // ${isLehenga ? `
//   // LEHENGA
//   // - Choli + Lehenga skirt + Dupatta are DISTINCT
//   // - Preserve panel count, flare, hem embroidery
//   // - No silhouette conversion
//   // ` : ``}

//   // ${isAnarkali ? `
//   // ANARKALI
//   // - Bodice + panelled flare + dupatta
//   // - Preserve seam positions and flare volume
//   // - No gown or skirt conversion
//   // ` : ``}

//   // ${isSharara ? `
//   // SHARARA
//   // - Kurta + upper flare + lower wide panels + dupatta
//   // - No palazzo/churidar/lehenga conversion
//   // - Preserve flare rate and panel width
//   // ` : ``}

//   // ${isKurtaSet ? `
//   // KURTA SET
//   // - Kurta + bottom + dupatta are DISTINCT
//   // - Bottom type must match Image 2 exactly
//   // - No silhouette changes
//   // ` : ``}

//   // ━━━━━━━━━━ LIGHTING & REALISM ━━━━━━━━━━
//   // - Match Image 1 lighting direction and intensity
//   // - Add contact shadows at body–fabric intersections
//   // - Final output must look like a real camera photograph
//   // - No AI-rendered appearance

//   // ━━━━━━━━━━ STRICT PROHIBITIONS ━━━━━━━━━━
//   // - No face/body/background edits
//   // - No accessories or props
//   // - No logos, text, borders, watermarks
//   // - Do NOT return Image 1 or Image 2 unchanged
//   // - Do NOT create collage or split views

//   // QUALITY CHECK BEFORE OUTPUT
//   // ✓ Face matches Image 1 exactly  
//   // ✓ Garment matches Image 2 exactly  
//   // ✓ Natural draping and physics  
//   // ✓ Accurate colors  
//   // ✓ No artifacts or floating fabric  

//   // OUTPUT REQUIREMENT
//   // Return ONE high-resolution photorealistic inline_data image only.
//   // `;


//   const payload = {
//     contents: [
//       {
//         parts: [
//           { text: prompt },
//           { text: isBackgroundSwap ? "Person to place in new background:" : "Person to dress:" },
//           {
//             inline_data: {
//               mime_type: "image/jpeg",
//               data: modelBase64,
//             },
//           },
//           { text: isBackgroundSwap ? "Target background scene:" : `Garment reference (${outfitType}):` },
//           {
//             inline_data: {
//               mime_type: "image/jpeg",
//               data: garmentBase64,
//             },
//           },
//         ],
//       },
//     ],
//   };

//   const apiKey = getApiKeyByOutfit(outfitType);
//   console.log(`🚀 Sending request to Gemini API...`);

//   const response = await axios.post(GEMINI_URL, payload, {
//     headers: {
//       "Content-Type": "application/json",
//       "x-goog-api-key": apiKey,
//     },
//     timeout: 180000,
//   });

//   const parts = response.data.candidates?.[0]?.content?.parts || [];
//   for (const p of parts) {
//     const img = p.inline_data?.data || p.inlineData?.data;
//     if (img) {
//       console.log(`✅ AI generation successful for ${outfitType}`);
//       return img;
//     }
//   }

//   console.log("❌ NO IMAGE FOUND. RAW PARTS:");
//   console.log(JSON.stringify(parts, null, 2));
//   throw new Error("No image generated from AI");
// }

// async function generateTryOnWithRetry(m, g, type, max = 3) {
//   for (let i = 1; i <= max; i++) {
//     try {
//       console.log(`🔄 Attempt ${i}/${max} for ${type}`);
//       return await generateTryOn(m, g, type);
//     } catch (err) {
//       const isRateLimit = err.response?.status === 429 ||
//         err.response?.status === 503 ||
//         err.message?.includes('quota') ||
//         err.message?.includes('rate limit');

//       if (isRateLimit && i < max) {
//         const waitTime = Math.pow(2, i) * 1000;
//         console.log(`⏳ Rate limited. Waiting ${waitTime / 1000}s before retry...`);
//         await new Promise(r => setTimeout(r, waitTime));
//         continue;
//       }

//       console.error(`❌ Attempt ${i} failed:`, err.message);
//       throw err;
//     }
//   }
// }


// async function generateBlouseChange(tryOnBase64, blouseType, mimeType = "image/jpeg") {
//   const prompt = `
// ROLE
// You are a master Indian saree blouse photo retoucher. You ONLY edit sleeve regions — nothing else.

// TASK
// In the provided saree image, **surgically replace ONLY the existing sleeves** with **${blouseType} sleeves** (normalized to classic Indian saree style).  
// Leave every other pixel in the image completely untouched.

// ABSOLUTE PRESERVATION RULES
// • 🔒 FACE / HEAD COMPLETELY FROZEN — treat the face, eyes, nose, mouth, jaw, ears, hairline, makeup, skin texture and tone of the face as a LOCKED LAYER that CANNOT be touched, moved, smoothed, regenerated or altered in ANY way — any face change = IMMEDIATE INTERNAL REJECT & REGENERATE
// • 🔒 HAIR FROZEN — hair strands, volume, colour and style must be pixel-identical
// • 🔒 JEWELLERY FROZEN — earrings, necklaces, bindis must remain exactly as in source
// • Identical body & pose: shoulder slope, arm angle/position, bust/waist shape, hand placement, posture — zero anatomy shift
// • Identical saree: drape folds, pleat crispness, pallu placement, border motifs, fabric sheen/weave/color gradient, pinning points
// • CRITICAL SAREE LOCK: The pallu MUST remain draped over and onto the LEFT SHOULDER — do NOT let it fall below the shoulder or change its draping position in any way
// • Identical blouse except sleeves: fabric match (color, texture, subtle print continuity), exact blouse body length/waist fit, dart positions, side seams, underarm curve, back design (if visible)
// • Identical scene: lighting direction/intensity, cast shadows, highlights on skin & fabric, background, depth-of-field, noise/grain

// SLEEVE MODIFICATION – MATCH THIS STYLE PRECISELY
// The requested sleeve type is: **${blouseType}**

// ${blouseType.toLowerCase().includes('sleeveless') || blouseType.toLowerCase().includes('no sleeve') ?
// `SLEEVELESS
// - ZERO fabric on arm — clean armhole edge only
// - Smooth rounded armhole edge at shoulder
// - Full bust/ribcage coverage MUST be kept — NEVER crop-top or bra-style
// - If original is already sleeveless → output image UNCHANGED` :

// blouseType.toLowerCase().includes('cap') ?
// `CAP SLEEVES
// - Ends 1–2 inches BELOW the shoulder seam
// - Covers the shoulder cap ONLY — NO arm coverage below the deltoid
// - Do NOT extend past the top of the upper arm` :

// blouseType.toLowerCase().includes('full') || blouseType.toLowerCase().includes('long') ?
// `⚠️ FULL / LONG SLEEVES — CRITICAL
// - THE SLEEVE FABRIC MUST COVER THE ENTIRE FOREARM FROM ELBOW ALL THE WAY TO THE WRIST BONE
// - Hem sits AT the wrist joint — the hands are visible BELOW the sleeve hem
// - ZERO exposed forearm skin between the elbow and the wrist
// - VISUAL TEST: Mentally trace a path from the elbow crease down to the wrist bump — every single centimetre of that path must be covered by sleeve fabric. If even 1 cm of forearm skin is exposed → WRONG → REGENERATE
// - The sleeve must be long enough that you can see the sleeve cuff/hem right above where the hand begins
// - Fitted or slightly loose with optional subtle cuff at wrist` :

// blouseType.toLowerCase().includes('3/4') || blouseType.toLowerCase().includes('three quarter') || blouseType.toLowerCase().includes('3-4') || blouseType.toLowerCase().includes('three-quarter') ?
// `THREE QUARTER / 3/4 SLEEVES
// - Ends at EXACTLY the midpoint of the forearm
// - Halfway between the elbow bend and the wrist bone
// - NOT at the elbow — NOT at the wrist — strictly at the mid-forearm point
// - Elegant, modest` :

// blouseType.toLowerCase().includes('short') || blouseType.toLowerCase().includes('half') ?
// `SHORT / HALF SLEEVES
// - Ends EXACTLY AT THE ELBOW JOINT — the visible bend/crease of the elbow
// - NOT above the elbow, NOT below the elbow
// - Fitted or gently flared` :

// blouseType.toLowerCase().includes('elbow') ?
// `ELBOW SLEEVES
// - Ends EXACTLY AT THE ELBOW JOINT
// - The elbow bend point is the hem termination — no further` :

// blouseType.toLowerCase().includes('puff') ?
// `PUFF / PUFFED SLEEVES
// - Volume and gathering concentrated at the shoulder cap
// - Tapers down from the shoulder puff
// - Length typically at or ABOVE the elbow
// - Festive, classic South Indian saree blouse style` :

// blouseType.toLowerCase().includes('bell') || blouseType.toLowerCase().includes('flared') ?
// `BELL / FLARED SLEEVES
// - Fitted at the upper arm from shoulder to elbow
// - Dramatically flares/widens from elbow downward
// - Hem reaches wrist level — flowy, dramatic silhouette` :

// blouseType.toLowerCase().includes('flutter') || blouseType.toLowerCase().includes('ruffle') ?
// `FLUTTER / RUFFLE SLEEVES
// - Short wavy ruffle extending 2–4 inches from the shoulder seam
// - Feminine, flowing — no full arm coverage` :

// blouseType.toLowerCase().includes('bishop') || blouseType.toLowerCase().includes('balloon') ?
// `BISHOP / BALLOON SLEEVES
// - Voluminous throughout the entire arm length from shoulder to wrist
// - Gathered tightly into a fitted cuff at the wrist
// - Reaches the wrist` :

// `${blouseType.toUpperCase()} SLEEVES
// - Apply a clean, realistic, moderately fitted ${blouseType} sleeve
// - Match traditional Indian saree blouse tailoring aesthetics`}

// CRITICAL LENGTH RULE: The sleeve hem MUST end at EXACTLY the anatomical point defined above — do NOT shorten, do NOT approximate — if the length is wrong → INTERNALLY REJECT and REGENERATE before returning output.

// EDITING CONSTRAINTS
// • Regenerate ONLY sleeve fabric, seams & arm coverage area
// • Perfect fabric physics: natural drape over shoulder/bicep, realistic stretch & fold shadows
// • Believable tailoring: subtle stitching lines, no floating fabric, correct shoulder seam placement
// • Seamless skin transition: natural armhole edge, shadow inside armhole if sleeveless
// • No added lace, beads, embroidery, contrast piping, buttons unless standard/classic for that exact sleeve name
// • No change to sleeve attachment point, armhole height, or overall blouse silhouette

// STRICT FORBIDDEN CHANGES (IF ANY DETECTED → INTERNALLY REJECT & REGENERATE)
// • ANY change to the face, eyes, expression, skin texture of the face — ZERO TOLERANCE
// • Any neckline, back, length, fit, colour, texture, embellishment change
// • Any hair, jewellery, pose, body reshaping
// • Lighting/shadow inconsistency, smoothing artifacts, anatomy errors

// OUTPUT
// Return ONLY one single HIGH-QUALITY photorealistic edited image — maximum resolution, sharp details, no compression artifacts, no blur.
// NO text whatsoever. NO explanations. NO markdown. NO extra images. NO UI elements.
// `;

//   const payload = {
//     contents: [{
//       parts: [
//         { text: prompt },
//         {
//           inline_data: {
//             mime_type: mimeType,
//             data: tryOnBase64
//           }
//         }
//       ]
//     }]
//   };

//   const response = await axios.post(GEMINI_URL, payload, {
//     headers: {
//       "Content-Type": "application/json",
//       "x-goog-api-key": process.env.GEMINI_API_KEY
//     },
//     timeout: 180000
//   });

//   const parts = response.data.candidates?.[0]?.content?.parts || [];
//   const img = parts.find(p => p.inline_data?.data || p.inlineData?.data);

//   return img?.inline_data?.data || img?.inlineData?.data;
// }



// //neck change function

// async function generateNeckChange(tryOnBase64, neckType, mimeType = "image/jpeg") {
//   // Normalize neck type input
//   const normalizedType = neckType.toLowerCase().includes('neck')
//     ? neckType.toLowerCase()
//     : `${neckType.toLowerCase()} neck`;

//   // Define neck type specifications
//   //   const neckTypeSpecs = {
//   //     'boat neck': `BOAT NECK DEFINITION (CRITICAL)
//   // - Wide horizontal neckline
//   // - Runs close to the collarbone
//   // - Straight or gently curved line
//   // - NO depth, NO plunge, NO collar stand
//   // - Elegant, classic Indian saree blouse style`,

//   //     'regular neck': `REGULAR NECK DEFINITION (CRITICAL)
//   // - Round neckline
//   // - Medium depth (2-3 inches below collarbone)
//   // - Natural, comfortable fit
//   // - Traditional saree blouse style
//   // - Not too high, not too low`,

//   //     'v neck': `V NECK DEFINITION (CRITICAL)
//   // - V-shaped neckline
//   // - Moderate depth pointing downward
//   // - Flattering and elegant
//   // - Traditional saree blouse proportions`,

//   //     'square neck': `SQUARE NECK DEFINITION (CRITICAL)
//   // - Straight horizontal top edge
//   // - Straight vertical side edges forming 90° angles
//   // - Clean, modern look
//   // - Traditional saree blouse fit`,

//   //     'sweetheart neck': `SWEETHEART NECK DEFINITION (CRITICAL)
//   // - Curved neckline resembling top of a heart
//   // - Romantic and feminine
//   // - Moderate depth
//   // - Traditional saree blouse style`,

//   //     'collar neck': `COLLAR NECK DEFINITION (CRITICAL)
//   // - Stand collar or shirt-style collar
//   // - Professional and structured look
//   // - Covers collarbone area
//   // - Traditional yet modern saree blouse style`
//   //   };

//   //   const neckSpec = neckTypeSpecs[normalizedType] || `NECKLINE MODIFICATION
//   // - Apply ${neckType} neckline style
//   // - Maintain appropriate coverage and fit
//   // - Keep traditional blouse proportions`;

//   const prompt = `
// ROLE
// You are an expert Indian ethnic wear photo retoucher specializing in precise saree blouse neckline edits only.

// TASK
// Using the provided input image, surgically modify **ONLY the front neckline / décolletage area** of the blouse to a **${neckType} neck** style (normalized to: ${normalizedType.toUpperCase()}).
// Do NOT touch or regenerate anything else in the entire image.

// STRICT LOCKS – PRESERVE 100% UNCHANGED
// • Exact same woman: face identity, expression, eyes, lips, makeup, hair style/volume, earrings, necklace, bindi, skin tone/texture/pores
// • Exact same body: posture, shoulder angle, bust/waist/hip proportions, arm position, hand placement
// • Exact same saree: drape, pleats, pallu folds & placement, fabric sheen/texture, color, border patterns, pinning
// • CRITICAL SAREE LOCK: The pallu MUST remain draped over and onto the LEFT SHOULDER — do NOT let it fall below the shoulder or change its draping position in any way
// • Exact same blouse everywhere except neckline edge: fabric color & texture match, sleeve style/length/cuffs, blouse length at waist, darts, side seams, underarm fit, back (if visible)
// • Exact same lighting, shadows, highlights, background, depth of field, grain/noise

// NECKLINE SPECIFICATIONS – MATCH THIS EXACT STYLE
// Use the most classic/traditional Indian saree blouse interpretation of the requested type:

// ${neckType.toLowerCase().includes('boat') ?
//       `BOAT NECK (BATEAU)
// - Wide, straight or softly curved horizontal neckline
// - Sits high, close to / along the collarbone
// - Exposes shoulders minimally to moderately
// - No plunge, no curve downward in center
// - Elegant, modest, timeless for silk/cotton sarees` :

//       neckType.toLowerCase().includes('regular') || neckType.toLowerCase().includes('round') ?
//         `ROUND / REGULAR NECK
// - Rounded neckline with a slight front dip — deeper at center front (3-4 inches below collarbone), shallower at sides
// - Visible front hooks at center neckline opening
// - Traditional Indian blouse style with front depth
// - Smooth curve, no sharp angles
// - No back changes` :

//         neckType.toLowerCase().includes('v') ?
//           `V-NECK
// - Clean V-shape pointing downward
// - Moderate depth (not too deep/plunging)
// - Flattering elongation of neck & torso
// - Common elegant saree blouse style
// - Sharp or softly pointed apex` :

//           neckType.toLowerCase().includes('square') ?
//             `SQUARE NECK
// - Straight horizontal top line across collarbone
// - Vertical straight sides forming ~90° corners
// - Geometric, structured, modern-traditional look
// - Clean edges, good collarbone emphasis` :

//             neckType.toLowerCase().includes('sweetheart') ?
//               `SWEETHEART NECK
// - Curved top resembling upper half of a heart
// - Two soft upward curves meeting at gentle central dip
// - Romantic, feminine, flattering on bust
// - Moderate depth, elegant drape` :

//               neckType.toLowerCase().includes('collar') ?
//                 `COLLAR NECK / SHIRT COLLAR
// - Structured stand-up or fold-over collar
// - Shirt-style or mandarin-inspired
// - Covers base of neck / collarbone area
// - Crisp, formal-modern fusion look` :

//                 `Apply a clean, well-tailored ${neckType} neckline that fits traditional saree blouse aesthetics – moderate coverage, realistic tailoring`}

// EDITING RULES
// • Change ONLY the fabric edge/contour at the neck opening
// • Re-draw the neckline fabric boundary precisely to new shape
// • Maintain exact fabric texture, weave, sheen, color gradient, subtle print continuity
// • Perfect stitching realism along new neck edge (subtle seam allowance if appropriate)
// • Natural skin-to-fabric transition, realistic shadows inside neckline
// • No added embellishments, piping, buttons, embroidery unless standard for this exact classic style
// • No change to blouse overall shape, tightness, or dart placement
// • No anatomy distortion, no extra skin exposure beyond the new neckline definition

// FORBIDDEN (IF ANY OCCURS → INTERNALLY REJECT & REGENERATE)
// • Sleeve, back, length, fit, color, texture change
// • Jewelry, makeup, hair, pose shift
// • Face or body reshaping
// • Lighting inconsistency or over-smoothing

// OUTPUT
// Return ONLY one high-resolution photorealistic edited image.
// NO text, NO captions, NO explanations, NO UI overlays, NO multiple variants.
// `;

//   const payload = {
//     contents: [{
//       parts: [
//         { text: prompt },
//         {
//           inline_data: {
//             mime_type: mimeType,
//             data: tryOnBase64
//           }
//         }
//       ]
//     }]
//   };

//   const response = await axios.post(GEMINI_URL, payload, {
//     headers: {
//       "Content-Type": "application/json",
//       "x-goog-api-key": process.env.GEMINI_API_KEY
//     },
//     timeout: 180000
//   });

//   const parts = response.data.candidates?.[0]?.content?.parts || [];
//   const img = parts.find(p => p.inline_data?.data || p.inlineData?.data);

//   return img?.inline_data?.data || img?.inlineData?.data;
// }




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


// // async function generateMultipleTryOns(modelBase64, garments) {

// //   console.log(`🎨 Starting multi try-on for ${garments.length} garments`);
// //   const results = {};

// //   for (const garment of garments) {
// //     console.log(`\n📸 Processing ${garment.name}...`);

// //     try {
// //       const garmentBase64 = await downloadAsBase64(garment.url);
// //       const output = await generateTryOnWithRetry(modelBase64, garmentBase64, garment.name);

// //       if (output) {
// //         results[garment.name] = `data:image/png;base64,${output}`;
// //         console.log(`✅ ${garment.name} generated successfully`);
// //       } else {
// //         console.log(`❌ ${garment.name} generation failed - no output`);
// //         results[garment.name] = null;
// //       }
// //     } catch (error) {
// //       console.error(`❌ Error generating ${garment.name}:`, error.message);
// //       results[garment.name] = null;
// //     }
// //   }

// //   return results;
// // }

// // ============ ROUTE HANDLER ============
// export default async function handler(req, res) {
//   const url = new URL(req.url, `http://${req.headers.host}`);
//   const path = url.pathname;

//   console.log(`🎯 API called: ${req.method} ${path}`);

//   try {

//     if (req.method === "POST" && req.headers["content-type"]?.includes("application/json")) {
//       let body = "";
//       await new Promise((resolve) => {
//         req.on("data", (chunk) => (body += chunk));
//         req.on("end", resolve);
//       });
//       try {
//         req.body = JSON.parse(body);
//       } catch {
//         req.body = {};
//       }
//     }


//     // ======== GET: /api/tryon-backgrounds ========
//     if (req.method === "GET" && path === "/api/tryon-backgrounds") {
//       const bgList = Object.entries(backgrounds).map(([key, value]) => ({
//         id: key,
//         name: value.name,
//         preview: value.url
//       }));
//       return res.json({
//         success: true,
//         backgrounds: bgList
//       });
//     }

//     // ======== GET: /api/video/status/:taskId ========
//     if (req.method === "GET" && path.startsWith("/api/video/status/")) {
//       const taskId = path.split('/').pop();

//       const response = await axios.get(
//         `${MINIMAX_BASE_URL}/query/video_generation`,
//         {
//           headers: getMinimaxHeaders(),
//           params: { task_id: taskId }
//         }
//       );

//       const data = response.data;
//       let progress = 0;
//       if (data.status === 'Queueing') progress = 10;
//       else if (data.status === 'Preparing') progress = 25;
//       else if (data.status === 'Processing') progress = 60;
//       else if (data.status === 'Success') progress = 100;

//       return res.json({
//         success: true,
//         status: data.status,
//         progress: progress,
//         file_id: data.file_id,
//         taskId: data.task_id
//       });
//     }

//     // ======== GET: /api/video/download/:fileId ========
//     if (req.method === "GET" && path.startsWith("/api/video/download/")) {
//       const fileId = path.split('/').pop();

//       const response = await axios.get(
//         `${MINIMAX_BASE_URL}/files/retrieve`,
//         {
//           headers: getMinimaxHeaders(),
//           params: { file_id: fileId }
//         }
//       );

//       const download_url = response.data.file?.download_url;

//       if (!download_url) {
//         return res.status(404).json({
//           success: false,
//           error: 'Download URL not found'
//         });
//       }

//       return res.json({
//         success: true,
//         videoUrl: download_url
//       });
//     }

//     // ======== POST: /api/video/create ========
//     if (req.method === "POST" && path === "/api/video/create") {
//       console.log('\n🎬 === VIDEO GENERATION REQUEST ===');

//       await runMiddleware(req, res, upload.single('tryOnImage'));

//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           error: "Try-on image required"
//         });
//       }

//       console.log(`📊 Image size: ${req.file.size} bytes`);

//       const imageBase64 = req.file.buffer.toString("base64");
//       const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

//       const payload = {
//         model: 'MiniMax-Hailuo-2.3-Fast',
//         first_frame_image: imageDataUrl,
//         prompt: 'A calm, graceful young woman stands centered facing camera in relaxed natural stance. She walks forward three small measured steps with smooth realistic gait and gentle arm swing. She performs one elegant slow full-body pirouette / 360 spin with poise, balanced posture, soft momentum, hair and fabric moving naturally. She then walks backward three precise steps, returning perfectly to starting location and exact original pose. Extremely natural human kinematics, coherent motion, no warping or sliding, photorealistic details, serene mood.',
//         duration: 6,
//         resolution: '1080P',
//         prompt_optimizer: true,
//         fast_pretreatment: true
//       };

//       console.log('🚀 Calling MiniMax API...');

//       const response = await axios.post(
//         `${MINIMAX_BASE_URL}/video_generation`,
//         payload,
//         { headers: getMinimaxHeaders() }
//       );

//       const { task_id } = response.data;
//       console.log(`✅ Task created: ${task_id}`);

//       return res.json({
//         success: true,
//         taskId: task_id,
//         message: 'Video generation started'
//       });
//     }

//     // ======== POST: /api/change-tryon-background ========
//     if (req.method === "POST" && path === "/api/change-tryon-background") {
//       console.log('\n🎨 === BACKGROUND CHANGE REQUEST ===');

//       await runMiddleware(req, res, upload.single('tryOnImage'));

//       if (!req.file) {
//         console.log('❌ No try-on image uploaded');
//         return res.status(400).json({
//           success: false,
//           error: "Try-on image is required"
//         });
//       }

//       const background = req.body.background;

//       if (!background || !backgrounds[background]) {
//         console.log('❌ Invalid background selection');
//         return res.status(400).json({
//           error: "Valid background selection required",
//           availableBackgrounds: Object.keys(backgrounds)
//         });
//       }

//       console.log(`📸 Try-on image size: ${req.file.size} bytes`);
//       console.log(`🌍 Selected background: ${backgrounds[background].name}`);

//       if (req.file.size > 10 * 1024 * 1024) {
//         return res.status(400).json({
//           error: "Image too large. Please use an image smaller than 10MB"
//         });
//       }

//       const tryOnBase64 = req.file.buffer.toString("base64");
//       console.log(`✅ Try-on image converted to base64`);

//       console.log("⬇️ Downloading background image...");
//       const bgBase64 = await downloadAsBase64(backgrounds[background].url);

//       console.log("🔁 Calling Gemini API for background swap...");
//       const result = await generateTryOnWithRetry(
//         tryOnBase64,
//         bgBase64,
//         "background-swap"
//       );

//       if (!result) {
//         throw new Error("No image returned from AI");
//       }

//       console.log("✨ SUCCESS — Background Changed! 🎉");

//       return res.json({
//         success: true,
//         result: `data:image/png;base64,${result}`,
//         background: backgrounds[background].name
//       });
//     }



//     // ======== POST: /api/change-blouse ========
//     if (req.method === "POST" && path === "/api/change-blouse") {
//       console.log('\n👚 === BLOUSE CHANGE REQUEST ===');

//       // Run multer in serverless
//       await runMiddleware(req, res, upload.single('tryOnImage'));

//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           error: "Try-on image is required"
//         });
//       }

//       const { blouseType } = req.body;

//       if (!blouseType) {
//         return res.status(400).json({
//           success: false,
//           error: "blouseType is required"
//         });
//       }

//       console.log(`👚 Blouse type: ${blouseType}`);
//       console.log(`📊 Image size: ${req.file.size} bytes`);

//       // Convert image to base64
//       const tryOnBase64 = req.file.buffer.toString("base64");
//       const imageMimeType = req.file.mimetype || "image/jpeg";

//       console.log("🎨 Calling Gemini for blouse modification...");
//       const result = await generateBlouseChange(tryOnBase64, blouseType, imageMimeType);

//       if (!result) {
//         throw new Error("No image returned from AI");
//       }

//       console.log("✨ SUCCESS — Blouse Changed!");

//       return res.json({
//         success: true,
//         blouseType,
//         result: `data:image/png;base64,${result}`
//       });
//     }



//     // ======== POST: /api/change-neck ========
//     if (req.method === "POST" && path === "/api/change-neck") {
//       console.log('\n👗 === NECK CHANGE REQUEST ===');

//       // Run multer in serverless
//       await runMiddleware(req, res, upload.single('tryOnImage'));

//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           error: "Try-on image is required"
//         });
//       }

//       const { neckType } = req.body;

//       if (!neckType) {
//         return res.status(400).json({
//           success: false,
//           error: "neckType is required"
//         });
//       }

//       console.log(`👗 Neck type: ${neckType}`);
//       console.log(`📊 Image size: ${req.file.size} bytes`);

//       // Convert image to base64
//       const tryOnBase64 = req.file.buffer.toString("base64");
//       const imageMimeType = req.file.mimetype || "image/jpeg";

//       console.log("🎨 Calling Gemini for neckline modification...");
//       const result = await generateNeckChange(tryOnBase64, neckType, imageMimeType);

//       if (!result) {
//         throw new Error("No image returned from AI");
//       }

//       console.log("✨ SUCCESS — Neckline Changed!");

//       return res.json({
//         success: true,
//         neckType,
//         result: `data:image/png;base64,${result}`
//       });
//     }



//     // ======== POST: /api/test-tryon ========
//     if (req.method === "POST" && path === "/api/garnment-swap") {
//       console.log('\n🎯 === TEST TRY-ON REQUEST ===');

//       await runMiddleware(
//         req,
//         res,
//         upload.fields([
//           { name: 'model', maxCount: 1 },
//           { name: 'garment', maxCount: 1 }
//         ])
//       );

//       if (!req.files?.model || !req.files?.garment) {
//         return res.status(400).json({
//           success: false,
//           error: "Both model and garment images required"
//         });
//       }

//       const modelBase64 = req.files.model[0].buffer.toString("base64");
//       const garmentBase64 = req.files.garment[0].buffer.toString("base64");

//       const outfitType = req.body.outfitType || "saree";

//       console.log(`🚀 Generating try-on for ${outfitType}...`);
//       const output = await generateTryOnWithRetry(
//         modelBase64,
//         garmentBase64,
//         outfitType
//       );

//       if (!output) {
//         throw new Error("No image generated");
//       }

//       console.log(`✨ SUCCESS`);
//       return res.json({
//         success: true,
//         result: `data:image/png;base64,${output}`
//       });
//     }




//     // CLAUDINARY UPLOAD HANDLER

//     // ======== POST: /api/upload-to-cloudinary ========
//     if (req.method === "POST" && path === "/api/upload-to-cloudinary") {
//       console.log("\n☁️ === CLOUDINARY UPLOAD REQUEST ===");

//       try {
//         const { images } = req.body;

//         if (!images || !Array.isArray(images)) {
//           return res.status(400).json({
//             success: false,
//             error: "Images array required",
//           });
//         }

//         console.log(`📤 Uploading ${images.length} images to Cloudinary...`);

//         const uploadPromises = images.map(async ({ outfitType, base64Image }) => {
//           try {
//             const base64Data = base64Image.replace(
//               /^data:image\/\w+;base64,/,
//               ""
//             );

//             const result = await cloudinary.v2.uploader.upload(
//               `data:image/png;base64,${base64Data}`,
//               {
//                 folder: "tryon-results",
//                 public_id: `${Date.now()}_${outfitType}`,
//                 resource_type: "image",
//               }
//             );

//             console.log(`✅ ${outfitType} uploaded`);

//             return {
//               outfitType,
//               url: result.secure_url,
//               success: true,
//             };
//           } catch (error) {
//             console.error(`❌ Upload failed for ${outfitType}`, error.message);
//             return {
//               outfitType,
//               success: false,
//               error: error.message,
//             };
//           }
//         });

//         const results = await Promise.all(uploadPromises);

//         return res.json({
//           success: true,
//           results: results.reduce((acc, r) => {
//             if (r.success) acc[r.outfitType] = r.url;
//             return acc;
//           }, {}),
//         });
//       } catch (err) {
//         console.error("❌ Cloudinary error:", err.message);
//         return res.status(500).json({
//           success: false,
//           error: "Cloudinary upload failed",
//         });
//       }
//     }



//     // ======== POST: /api/tryon-from-urls ========
//     if (req.method === "POST" && path === "/api/tryon-from-urls") {
//       console.log('\n🎯 === TRY-ON FROM URLs (MyProfile) ===');

//       const { modelUrl, garmentUrl, outfitType } = req.body;

//       console.log(`👗 Outfit type: ${outfitType}`);
//       console.log(`👤 Model URL: ${modelUrl?.substring(0, 60)}...`);
//       console.log(`🔗 Garment URL: ${garmentUrl?.substring(0, 60)}...`);

//       if (!modelUrl || !garmentUrl) {
//         console.log('❌ Missing URLs');
//         return res.status(400).json({
//           success: false,
//           error: "Both modelUrl and garmentUrl are required"
//         });
//       }

//       console.log(`📥 Downloading model image...`);
//       const modelBase64 = await downloadAsBase64(modelUrl);

//       console.log(`📥 Downloading garment image...`);
//       const garmentBase64 = await downloadAsBase64(garmentUrl);

//       console.log(`🚀 Starting try-on with retry logic...`);
//       const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

//       if (!output) {
//         throw new Error("No image generated from AI");
//       }

//       console.log(`✨ SUCCESS: Try-on generated for ${outfitType}`);

//       return res.json({
//         success: true,
//         result: `data:image/png;base64,${output}`,
//       });
//     }

//     // ======== POST: /api/single-tryon ========
//     if (req.method === "POST" && path === "/api/single-tryon") {
//       console.log('\n🎯 === SINGLE TRY-ON REQUEST ===');

//       await runMiddleware(req, res, upload.single('model'));

//       if (!req.file) {
//         console.log('❌ No model image uploaded');
//         return res.status(400).json({
//           success: false,
//           error: "No model image uploaded"
//         });
//       }

//       const { garmentUrl, outfitType } = req.body;
//       console.log(`👗 Outfit type: ${outfitType}`);
//       console.log(`🔗 Garment URL: ${garmentUrl}`);

//       if (!garmentUrl) {
//         console.log('❌ No garment URL provided');
//         return res.status(400).json({
//           success: false,
//           error: "No garment URL provided"
//         });
//       }

//       console.log(`📊 Model image size: ${req.file.size} bytes`);

//       const modelBase64 = req.file.buffer.toString("base64");
//       console.log(`✅ Model image converted to base64`);

//       let garmentBase64;
//       if (garmentUrl.startsWith("data:")) {
//         console.log('📊 Extracting base64 from data URL...');
//         garmentBase64 = garmentUrl.split(",")[1];
//       } else {
//         console.log('⬇️ Downloading garment from URL...');
//         garmentBase64 = await downloadAsBase64(garmentUrl);
//       }

//       console.log(`🚀 Starting try-on with retry logic...`);
//       const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

//       if (!output) {
//         throw new Error("No image generated from AI");
//       }

//       console.log(`✅ SUCCESS: Try-on generated for ${outfitType}`);

//       return res.json({
//         success: true,
//         result: `data:image/png;base64,${output}`,
//       });
//     }

//     // ======== POST: /api/multi-tryon ========
//     if (req.method === "POST" && path === "/api/multi-tryon") {
//       console.log('\n🎯 === MULTI TRY-ON REQUEST ===');

//       await runMiddleware(req, res, upload.single("model"));

//       if (!req.file) {
//         console.log('❌ No model image uploaded');
//         return res.status(400).json({
//           success: false,
//           error: "No model image uploaded"
//         });
//       }

//       console.log(`📊 Model image size: ${req.file.size} bytes`);

//       const modelBase64 = req.file.buffer.toString("base64");
//       console.log(`✅ Model image converted to base64`);

//       const garments = [
//         {
//           name: "saree",
//           url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764159002/saree2_lhrofy.jpg"
//         },
//         {
//           name: "kurti",
//           url: "https://res.cloudinary.com/doiezptnn/image/upload/v1764157933/8816O_1_1024x1024_wa4o3j.webp"
//         },
//         {
//           name: "lehenga",
//           url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763188140/ChatGPT_Image_Nov_15_2025_11_58_37_AM_cnzfyj.png"
//         },
//         {
//           name: "anarkali",
//           url: "https://res.cloudinary.com/doiezptnn/image/upload/v1763971671/Anarkali3_uqzket.png"
//         }
//       ];

//       console.log(`🚀 Generating try-ons for ${garments.length} garments...`);

//       const results = await generateMultipleTryOns(modelBase64, garments);

//       const successCount = Object.values(results).filter(r => r !== null).length;
//       console.log(`\n✨ Completed: ${successCount}/${garments.length} successful`);

//       return res.json({
//         success: true,
//         results: results
//       });
//     }

//     // ======== POST: /api/tryon ========
//     if (req.method === "POST" && path === "/api/tryon") {
//       console.log('\n🎯 === GENERAL TRYON REQUEST ===');

//       await runMiddleware(
//         req,
//         res,
//         upload.fields([
//           { name: 'model', maxCount: 1 },
//           { name: 'garment', maxCount: 1 }
//         ])
//       );

//       if (!req.files?.model) {
//         return res.status(400).json({
//           success: false,
//           error: "Model image required"
//         });
//       }

//       const modelBase64 = req.files.model[0].buffer.toString("base64");

//       let garmentBase64;
//       if (req.files?.garment) {
//         garmentBase64 = req.files.garment[0].buffer.toString("base64");
//       } else if (req.body.garmentUrl) {
//         garmentBase64 = await downloadAsBase64(req.body.garmentUrl);
//       } else {
//         return res.status(400).json({
//           success: false,
//           error: "Garment image or URL required"
//         });
//       }

//       const outfitType = req.body.outfitType || "saree";

//       console.log(`🚀 Generating try-on for ${outfitType}...`);
//       const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

//       if (!output) {
//         throw new Error("No image generated");
//       }

//       console.log(`✨ SUCCESS`);
//       return res.json({
//         success: true,
//         result: `data:image/png;base64,${output}`
//       });
//     }

//     // ======== POST: /api/test-tryon ========
//     if (req.method === "POST" && path === "/api/test-tryon") {
//       console.log('\n🎯 === TEST TRY-ON REQUEST ===');

//       await runMiddleware(
//         req,
//         res,
//         upload.fields([
//           { name: 'model', maxCount: 1 },
//           { name: 'garment', maxCount: 1 }
//         ])
//       );

//       if (!req.files?.model || !req.files?.garment) {
//         return res.status(400).json({
//           success: false,
//           error: "Both model and garment images required"
//         });
//       }

//       const modelBase64 = req.files.model[0].buffer.toString("base64");
//       const garmentBase64 = req.files.garment[0].buffer.toString("base64");

//       const outfitType = req.body.outfitType || "saree";

//       console.log(`🚀 Generating try-on for ${outfitType}...`);
//       const output = await generateTryOnWithRetry(modelBase64, garmentBase64, outfitType);

//       if (!output) {
//         throw new Error("No image generated");
//       }

//       console.log(`✨ SUCCESS`);
//       return res.json({
//         success: true,
//         result: `data:image/png;base64,${output}`
//       });
//     }

//     // ======== INVALID ROUTE ========
//     return res.status(404).json({ error: `Route not found: ${path}` });

//   } catch (err) {
//     console.error("❌ API Error:", err.message);
//     console.error("❌ Stack:", err.stack);
//     return res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// }










// ============================================================
// FILE: api/tryon.js (Vercel Serverless Function)
// Complete virtual try-on API with multiple modes
// ============================================================

import axios from "axios";
import multer from "multer";
import cloudinary from "cloudinary";
import { GoogleAuth } from "google-auth-library";


// ============ VERCEL CONFIG ============
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "20mb"
  },
  maxDuration: 300, // 5 minutes for complex operations
};

// CLAUDINARY CONFIGS

cloudinary.v2.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
});



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

// Vertex AI Virtual Try-On (no prompting)
const VERTEX_PROJECT_ID = process.env.GOOGLE_PROJECT_ID || "dvyb-8b572";
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
async function generateTryOn(modelBase64, garmentBase64, garmentName, outfitType) {
  console.log(`🎨 Generating AI try-on for: ${outfitType}`);

  // const lowerType = (outfitType || "").toLowerCase();
  // const isSaree = lowerType === "saree";
  // const isBackgroundSwap = lowerType === "background-swap";

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


async function generateBlouseChange(tryOnBase64, blouseType, mimeType = "image/jpeg") {
  const prompt = `
ROLE
You are a master Indian saree blouse photo retoucher. You ONLY edit sleeve regions — nothing else.

TASK
In the provided saree image, **surgically replace ONLY the existing sleeves** with **${blouseType} sleeves** (normalized to classic Indian saree style).  
Leave every other pixel in the image completely untouched.

ABSOLUTE PRESERVATION RULES
• 🔒 FACE / HEAD COMPLETELY FROZEN — treat the face, eyes, nose, mouth, jaw, ears, hairline, makeup, skin texture and tone of the face as a LOCKED LAYER that CANNOT be touched, moved, smoothed, regenerated or altered in ANY way — any face change = IMMEDIATE INTERNAL REJECT & REGENERATE
• 🔒 HAIR FROZEN — hair strands, volume, colour and style must be pixel-identical
• 🔒 JEWELLERY FROZEN — earrings, necklaces, bindis must remain exactly as in source
• Identical body & pose: shoulder slope, arm angle/position, bust/waist shape, hand placement, posture — zero anatomy shift
• Identical saree: drape folds, pleat crispness, pallu placement, border motifs, fabric sheen/weave/color gradient, pinning points
• Identical blouse except sleeves: fabric match (color, texture, subtle print continuity), exact blouse body length/waist fit, dart positions, side seams, underarm curve, back design (if visible)
• Identical scene: lighting direction/intensity, cast shadows, highlights on skin & fabric, background, depth-of-field, noise/grain

SLEEVE MODIFICATION – MATCH THIS STYLE PRECISELY
The requested sleeve type is: **${blouseType}**

${blouseType.toLowerCase().includes('sleeveless') || blouseType.toLowerCase().includes('no sleeve') ?
`SLEEVELESS
- ZERO fabric on arm — clean armhole edge only
- Smooth rounded armhole edge at shoulder
- Full bust/ribcage coverage MUST be kept — NEVER crop-top or bra-style
- If original is already sleeveless → output image UNCHANGED` :

blouseType.toLowerCase().includes('cap') ?
`CAP SLEEVES
- Ends 1–2 inches BELOW the shoulder seam
- Covers the shoulder cap ONLY — NO arm coverage below the deltoid
- Do NOT extend past the top of the upper arm` :

blouseType.toLowerCase().includes('full') || blouseType.toLowerCase().includes('long') ?
`⚠️ FULL / LONG SLEEVES — CRITICAL
- THE SLEEVE FABRIC MUST COVER THE ENTIRE FOREARM FROM ELBOW ALL THE WAY TO THE WRIST BONE
- Hem sits AT the wrist joint — the hands are visible BELOW the sleeve hem
- ZERO exposed forearm skin between the elbow and the wrist
- VISUAL TEST: Mentally trace a path from the elbow crease down to the wrist bump — every single centimetre of that path must be covered by sleeve fabric. If even 1 cm of forearm skin is exposed → WRONG → REGENERATE
- The sleeve must be long enough that you can see the sleeve cuff/hem right above where the hand begins
- Fitted or slightly loose with optional subtle cuff at wrist` :

blouseType.toLowerCase().includes('3/4') || blouseType.toLowerCase().includes('three quarter') || blouseType.toLowerCase().includes('3-4') || blouseType.toLowerCase().includes('three-quarter') ?
`THREE QUARTER / 3/4 SLEEVES
- Ends at EXACTLY the midpoint of the forearm
- Halfway between the elbow bend and the wrist bone
- NOT at the elbow — NOT at the wrist — strictly at the mid-forearm point
- Elegant, modest` :

blouseType.toLowerCase().includes('short') || blouseType.toLowerCase().includes('half') ?
`SHORT / HALF SLEEVES
- Ends EXACTLY AT THE ELBOW JOINT — the visible bend/crease of the elbow
- NOT above the elbow, NOT below the elbow
- Fitted or gently flared` :

blouseType.toLowerCase().includes('elbow') ?
`ELBOW SLEEVES
- Ends EXACTLY AT THE ELBOW JOINT
- The elbow bend point is the hem termination — no further` :

blouseType.toLowerCase().includes('puff') ?
`PUFF / PUFFED SLEEVES
- Volume and gathering concentrated at the shoulder cap
- Tapers down from the shoulder puff
- Length typically at or ABOVE the elbow
- Festive, classic South Indian saree blouse style` :

blouseType.toLowerCase().includes('bell') || blouseType.toLowerCase().includes('flared') ?
`BELL / FLARED SLEEVES
- Fitted at the upper arm from shoulder to elbow
- Dramatically flares/widens from elbow downward
- Hem reaches wrist level — flowy, dramatic silhouette` :

blouseType.toLowerCase().includes('flutter') || blouseType.toLowerCase().includes('ruffle') ?
`FLUTTER / RUFFLE SLEEVES
- Short wavy ruffle extending 2–4 inches from the shoulder seam
- Feminine, flowing — no full arm coverage` :

blouseType.toLowerCase().includes('bishop') || blouseType.toLowerCase().includes('balloon') ?
`BISHOP / BALLOON SLEEVES
- Voluminous throughout the entire arm length from shoulder to wrist
- Gathered tightly into a fitted cuff at the wrist
- Reaches the wrist` :

`${blouseType.toUpperCase()} SLEEVES
- Apply a clean, realistic, moderately fitted ${blouseType} sleeve
- Match traditional Indian saree blouse tailoring aesthetics`}

CRITICAL LENGTH RULE: The sleeve hem MUST end at EXACTLY the anatomical point defined above — do NOT shorten, do NOT approximate — if the length is wrong → INTERNALLY REJECT and REGENERATE before returning output.

EDITING CONSTRAINTS
• Regenerate ONLY sleeve fabric, seams & arm coverage area
• Perfect fabric physics: natural drape over shoulder/bicep, realistic stretch & fold shadows
• Believable tailoring: subtle stitching lines, no floating fabric, correct shoulder seam placement
• Seamless skin transition: natural armhole edge, shadow inside armhole if sleeveless
• No added lace, beads, embroidery, contrast piping, buttons unless standard/classic for that exact sleeve name
• No change to sleeve attachment point, armhole height, or overall blouse silhouette

STRICT FORBIDDEN CHANGES (IF ANY DETECTED → INTERNALLY REJECT & REGENERATE)
• ANY change to the face, eyes, expression, skin texture of the face — ZERO TOLERANCE
• Any neckline, back, length, fit, colour, texture, embellishment change
• Any hair, jewellery, pose, body reshaping
• Lighting/shadow inconsistency, smoothing artifacts, anatomy errors

OUTPUT
Return ONLY one single HIGH-QUALITY photorealistic edited image — maximum resolution, sharp details, no compression artifacts, no blur.
NO text whatsoever. NO explanations. NO markdown. NO extra images. NO UI elements.
`;

  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: mimeType,
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



//neck change function

async function generateNeckChange(tryOnBase64, neckType, mimeType = "image/jpeg") {
  // Normalize neck type input
  const normalizedType = neckType.toLowerCase().includes('neck')
    ? neckType.toLowerCase()
    : `${neckType.toLowerCase()} neck`;


  const prompt = `
ROLE
You are an expert Indian ethnic wear photo retoucher specializing in precise saree blouse neckline edits only.

TASK
Using the provided input image, surgically modify **ONLY the front neckline / décolletage area** of the blouse to a **${neckType} neck** style (normalized to: ${normalizedType.toUpperCase()}).
Do NOT touch or regenerate anything else in the entire image.

STRICT LOCKS – PRESERVE 100% UNCHANGED
• Exact same woman: face identity, expression, eyes, lips, makeup, hair style/volume, earrings, necklace, bindi, skin tone/texture/pores
• Exact same body: posture, shoulder angle, bust/waist/hip proportions, arm position, hand placement
• Exact same saree: drape, pleats, pallu folds & placement, fabric sheen/texture, color, border patterns, pinning
• Exact same blouse everywhere except neckline edge: fabric color & texture match, sleeve style/length/cuffs, blouse length at waist, darts, side seams, underarm fit, back (if visible)
• Exact same lighting, shadows, highlights, background, depth of field, grain/noise

NECKLINE SPECIFICATIONS – MATCH THIS EXACT STYLE
Use the most classic/traditional Indian saree blouse interpretation of the requested type:

${neckType.toLowerCase().includes('boat') ?
      `BOAT NECK (BATEAU)
- Wide, straight or softly curved horizontal neckline
- Sits high, close to / along the collarbone
- Exposes shoulders minimally to moderately
- No plunge, no curve downward in center
- Elegant, modest, timeless for silk/cotton sarees` :

      neckType.toLowerCase().includes('regular') || neckType.toLowerCase().includes('round') ?
        `ROUND / REGULAR NECK
- Classic circular/rounded neckline 
- Medium depth: 4 inches below collarbone center
- Balanced, comfortable coverage
- Most versatile traditional style
- Smooth curve, no sharp angles` :

        neckType.toLowerCase().includes('v') ?
          `V-NECK
- Clean V-shape pointing downward
- Moderate depth (not too deep/plunging)
- Flattering elongation of neck & torso
- Common elegant saree blouse style
- Sharp or softly pointed apex` :

          neckType.toLowerCase().includes('square') ?
            `SQUARE NECK
- Straight horizontal top line across collarbone
- Vertical straight sides forming ~90° corners
- Geometric, structured, modern-traditional look
- Clean edges, good collarbone emphasis` :

            neckType.toLowerCase().includes('sweetheart') ?
              `SWEETHEART NECK
- Curved top resembling upper half of a heart
- Two soft upward curves meeting at gentle central dip
- Romantic, feminine, flattering on bust
- Moderate depth, elegant drape` :

              neckType.toLowerCase().includes('collar') ?
                `COLLAR NECK / SHIRT COLLAR
- Structured stand-up or fold-over collar
- Shirt-style or mandarin-inspired
- Covers base of neck / collarbone area
- Crisp, formal-modern fusion look` :

                `Apply a clean, well-tailored ${neckType} neckline that fits traditional saree blouse aesthetics – moderate coverage, realistic tailoring`}

EDITING RULES
• Change ONLY the fabric edge/contour at the neck opening
• Re-draw the neckline fabric boundary precisely to new shape
• Maintain exact fabric texture, weave, sheen, color gradient, subtle print continuity
• Perfect stitching realism along new neck edge (subtle seam allowance if appropriate)
• Natural skin-to-fabric transition, realistic shadows inside neckline
• No added embellishments, piping, buttons, embroidery unless standard for this exact classic style
• No change to blouse overall shape, tightness, or dart placement
• No anatomy distortion, no extra skin exposure beyond the new neckline definition

FORBIDDEN (IF ANY OCCURS → INTERNALLY REJECT & REGENERATE)
• Sleeve, back, length, fit, color, texture change
• Jewelry, makeup, hair, pose shift
• Face or body reshaping
• Lighting inconsistency or over-smoothing

OUTPUT
Return ONLY one high-resolution photorealistic edited image.
NO text, NO captions, NO explanations, NO UI overlays, NO multiple variants.
`;

  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: mimeType,
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


// ============ ROUTE HANDLER ============
export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  console.log(`🎯 API called: ${req.method} ${path}`);

  try {

    if (req.method === "POST" && req.headers["content-type"]?.includes("application/json")) {
      let body = "";
      await new Promise((resolve) => {
        req.on("data", (chunk) => (body += chunk));
        req.on("end", resolve);
      });
      try {
        req.body = JSON.parse(body);
      } catch {
        req.body = {};
      }
    }


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
        prompt: 'A calm, graceful young woman stands centered facing camera in relaxed natural stance. She walks forward three small measured steps with smooth realistic gait and gentle arm swing. She performs one elegant slow full-body pirouette / 360 spin with poise, balanced posture, soft momentum, hair and fabric moving naturally. She then walks backward three precise steps, returning perfectly to starting location and exact original pose. Extremely natural human kinematics, coherent motion, no warping or sliding, photorealistic details, serene mood.',
        duration: 6,
        resolution: '768P',
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

      await runMiddleware(req, res, upload.fields([
        { name: 'tryOnImage',     maxCount: 1 },
        { name: 'backgroundImage', maxCount: 1 },
      ]));

      if (!req.files?.tryOnImage?.[0]) {
        console.log('❌ No try-on image uploaded');
        return res.status(400).json({
          success: false,
          error: "Try-on image is required"
        });
      }

      const tryOnFile = req.files.tryOnImage[0];

      if (tryOnFile.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          error: "Image too large. Please use an image smaller than 10MB"
        });
      }

      const tryOnBase64 = tryOnFile.buffer.toString("base64");
      console.log(`✅ Try-on image converted to base64`);

      let bgBase64;
      let bgName;

      // Custom background uploaded directly
      if (req.files?.backgroundImage?.[0]) {
        bgBase64 = req.files.backgroundImage[0].buffer.toString("base64");
        bgName = req.body.backgroundName || "Custom";
        console.log(`🖼️ Using uploaded custom background: ${bgName}`);
      } else {
        const background = req.body.background;
        if (!background || !backgrounds[background]) {
          console.log('❌ Invalid background selection');
          return res.status(400).json({
            error: "Valid background selection required",
            availableBackgrounds: Object.keys(backgrounds)
          });
        }
        bgName = backgrounds[background].name;
        console.log(`🌍 Selected background: ${bgName}`);
        bgBase64 = await downloadAsBase64(backgrounds[background].url);
      }

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
        background: bgName
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
      const imageMimeType = req.file.mimetype || "image/jpeg";

      console.log("🎨 Calling Gemini for blouse modification...");
      const result = await generateBlouseChange(tryOnBase64, blouseType, imageMimeType);

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



    // ======== POST: /api/change-neck ========
    if (req.method === "POST" && path === "/api/change-neck") {
      console.log('\n👗 === NECK CHANGE REQUEST ===');

      // Run multer in serverless
      await runMiddleware(req, res, upload.single('tryOnImage'));

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Try-on image is required"
        });
      }

      const { neckType } = req.body;

      if (!neckType) {
        return res.status(400).json({
          success: false,
          error: "neckType is required"
        });
      }

      console.log(`👗 Neck type: ${neckType}`);
      console.log(`📊 Image size: ${req.file.size} bytes`);

      // Convert image to base64
      const tryOnBase64 = req.file.buffer.toString("base64");
      const imageMimeType = req.file.mimetype || "image/jpeg";

      console.log("🎨 Calling Gemini for neckline modification...");
      const result = await generateNeckChange(tryOnBase64, neckType, imageMimeType);

      if (!result) {
        throw new Error("No image returned from AI");
      }

      console.log("✨ SUCCESS — Neckline Changed!");

      return res.json({
        success: true,
        neckType,
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




    // CLAUDINARY UPLOAD HANDLER

    // ======== POST: /api/upload-to-cloudinary ========
    if (req.method === "POST" && path === "/api/upload-to-cloudinary") {
      console.log("\n☁️ === CLOUDINARY UPLOAD REQUEST ===");

      try {
        const { images } = req.body;

        if (!images || !Array.isArray(images)) {
          return res.status(400).json({
            success: false,
            error: "Images array required",
          });
        }

        console.log(`📤 Uploading ${images.length} images to Cloudinary...`);

        const uploadPromises = images.map(async ({ outfitType, base64Image }) => {
          try {
            const base64Data = base64Image.replace(
              /^data:image\/\w+;base64,/,
              ""
            );

            const result = await cloudinary.v2.uploader.upload(
              `data:image/png;base64,${base64Data}`,
              {
                folder: "tryon-results",
                public_id: `${Date.now()}_${outfitType}`,
                resource_type: "image",
              }
            );

            console.log(`✅ ${outfitType} uploaded`);

            return {
              outfitType,
              url: result.secure_url,
              success: true,
            };
          } catch (error) {
            console.error(`❌ Upload failed for ${outfitType}`, error.message);
            return {
              outfitType,
              success: false,
              error: error.message,
            };
          }
        });

        const results = await Promise.all(uploadPromises);

        return res.json({
          success: true,
          results: results.reduce((acc, r) => {
            if (r.success) acc[r.outfitType] = r.url;
            return acc;
          }, {}),
        });
      } catch (err) {
        console.error("❌ Cloudinary error:", err.message);
        return res.status(500).json({
          success: false,
          error: "Cloudinary upload failed",
        });
      }
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
