// routes/diagnose.routes.js
const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { verifyToken } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");
const {
  submitDiagnosis,
  getHistory,
  getSingleDiagnosis,
  removeDiagnosis,
} = require("../controllers/diagnose.controller");

const router = Router();

// Rate limiting: 20 diagnosis submissions per 15 minutes per IP
const diagnosisRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests, please try again later." },
  },
});

// All diagnosis endpoints require a valid Firebase ID token
router.use(verifyToken);

/**
 * @route   POST /api/v1/diagnose
 * @desc    Submit leaf image for AI disease diagnosis
 * @access  Private (Bearer token)
 * @body    multipart/form-data: image (file), cropType (string)
 */
router.post("/", diagnosisRateLimiter, upload.single("image"), submitDiagnosis);

/**
 * @route   GET /api/v1/diagnose/history
 * @desc    Get the authenticated farmer's past diagnoses
 * @access  Private
 */
router.get("/history", getHistory);

/**
 * @route   GET /api/v1/diagnose/:id
 * @desc    Get a single diagnosis by ID
 * @access  Private
 */
router.get("/:id", getSingleDiagnosis);

/**
 * @route   DELETE /api/v1/diagnose/:id
 * @desc    Delete a diagnosis record
 * @access  Private
 */
router.delete("/:id", removeDiagnosis);

module.exports = router;
