// ============================================================
// FILE: api/upload.js (Vercel Serverless Function)
// Upload a single file to Cloudinary
// ============================================================

import multer from "multer";
import cloudinary from "cloudinary";

// ============ VERCEL CONFIG ============
export const config = {
    api: {
        bodyParser: false,
        sizeLimit: "20mb",
    },
    maxDuration: 60,
};

// ============ CLOUDINARY CONFIG ============
cloudinary.v2.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.VITE_CLOUDINARY_API_KEY,
    api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
});

// ============ MULTER SETUP ============
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
}

// ============ HANDLER ============
export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    try {
        // Parse the multipart form data
        await runMiddleware(req, res, upload.single("file"));

        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }

        const folder = req.body?.folder || "warehouse_uploads";
        console.log(`☁️ Uploading file: ${req.file.originalname} (${req.file.size} bytes) to folder: ${folder}`);

        // Convert buffer to base64 data URI
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        // Upload to Cloudinary
        const result = await cloudinary.v2.uploader.upload(base64Image, {
            folder: folder,
            resource_type: "auto",
        });

        console.log(`✅ Upload success: ${result.secure_url}`);

        return res.json({
            success: true,
            url: result.secure_url,
        });
    } catch (err) {
        console.error("❌ CLOUDINARY UPLOAD ERROR:", err.message);
        return res.status(500).json({
            success: false,
            error: "Failed to upload image",
            details: err.message,
        });
    }
}
