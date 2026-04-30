// src/controllers/aiController.js
// Express controller for the POST /api/v1/diagnose endpoint
"use strict";

const { analyzeImage } = require("../services/aiService");

/**
 * POST /api/v1/diagnose
 *
 * Accepts a multipart/form-data upload with fields:
 *   - image   (required) – the leaf image file
 *   - cropType (optional) – e.g. "maize", "tomato"
 *
 * Returns a JSON diagnosis envelope:
 * {
 *   "success": true,
 *   "data": {
 *     "isHealthy": boolean,
 *     "disease": string | null,
 *     "confidence": number,
 *     "severity": "none"|"low"|"medium"|"high",
 *     "remedy": string,
 *     "prevention": string,
 *     "description": string
 *   }
 * }
 */
async function diagnose(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_IMAGE", message: "An image file is required." },
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_IMAGE_TYPE",
          message: `Unsupported image type: ${req.file.mimetype}. Allowed: ${allowedTypes.join(", ")}`,
        },
      });
    }

    const base64Image = req.file.buffer.toString("base64");
    const mediaType = req.file.mimetype;
    const cropType = req.body?.cropType || null;

    const diagnosis = await analyzeImage(base64Image, mediaType, cropType);

    return res.status(200).json({ success: true, data: diagnosis });
  } catch (err) {
    console.error("[aiController] diagnose error:", err.message);
    return res.status(500).json({
      success: false,
      error: { code: "AI_SERVICE_ERROR", message: err.message },
    });
  }
}

module.exports = { diagnose };
