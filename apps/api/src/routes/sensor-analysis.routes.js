// src/routes/sensor-analysis.routes.js
// Routes for AI-powered sensor data analysis
"use strict";

const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { verifyToken } = require("../middleware/auth.middleware");
const { analyzeSensors } = require("../controllers/sensor-analysis.controller");

const router = Router();

// Rate limiting: 30 analysis requests per 15 minutes per IP
const sensorAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests, please try again later." },
  },
});

router.use(sensorAnalysisLimiter);
router.use(verifyToken);

/**
 * @route   POST /api/v1/sensor-analysis
 * @desc    Analyze IoT sensor readings with Gemini AI and get farming recommendations
 * @access  Private (Bearer token)
 * @body    JSON: { temperature, humidity, soilMoisture, cropType? }
 */
router.post("/", analyzeSensors);

module.exports = router;
