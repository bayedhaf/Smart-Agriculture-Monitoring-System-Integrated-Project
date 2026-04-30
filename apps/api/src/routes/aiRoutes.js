// src/routes/aiRoutes.js
// Route definitions for the AI diagnosis endpoints
"use strict";

const express = require("express");
const multer = require("multer");
const { diagnose } = require("../controllers/aiController");

const router = express.Router();

// Store uploaded files in memory (buffer) so the service can base64-encode them.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * POST /api/v1/diagnose
 * Submit a leaf image for AI-powered crop disease diagnosis.
 */
router.post("/", upload.single("image"), diagnose);

module.exports = router;
