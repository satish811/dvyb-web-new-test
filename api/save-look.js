// ============================================================
// FILE: api/save-look.js (Vercel Serverless Function)
// Upload a try-on result image to Cloudinary and return the URL
// ============================================================

import cloudinary from "cloudinary";

// ============ VERCEL CONFIG ============
export const config = {
    api: {
        bodyParser: true,
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

// ============ HANDLER ============
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    try {
        const { image, productName } = req.body || {};

        if (!image) {
            return res.status(400).json({ success: false, error: "image is required" });
        }

        const uploadResult = await cloudinary.v2.uploader.upload(image, {
            folder: "tryon-results/saved-looks",
            public_id: `saved_${Date.now()}`,
            resource_type: "image",
            context: productName ? `product=${productName}` : undefined,
        });

        console.log(`✅ Look saved to Cloudinary: ${uploadResult.secure_url}`);
        return res.status(200).json({
            success: true,
            url: uploadResult.secure_url,
        });
    } catch (err) {
        console.error("❌ SAVE LOOK ERROR:", err.message);
        return res.status(500).json({
            success: false,
            error: "Failed to save look",
            details: err.message,
        });
    }
}
