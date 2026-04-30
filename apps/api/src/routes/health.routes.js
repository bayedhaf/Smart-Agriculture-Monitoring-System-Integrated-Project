// routes/health.routes.js
const { Router } = require("express");
const { db } = require("../../confi/firebase");

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    API liveness check
 * @access  Public
 */
router.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * @route   GET /api/v1/health/firebase
 * @desc    Firebase connectivity check
 * @access  Public
 */
router.get("/firebase", async (_req, res) => {
  try {
    await db.collection("_health").limit(1).get();
    res.json({ success: true, data: { status: "connected" } });
  } catch (err) {
    res.status(503).json({
      success: false,
      error: { code: "FIREBASE_ERROR", message: "Firebase connection failed" },
    });
  }
});

module.exports = router;
