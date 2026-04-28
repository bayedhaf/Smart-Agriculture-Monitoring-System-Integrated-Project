// controllers/diagnose.controller.js
const {
  createDiagnosis,
  getDiagnosisHistory,
  getDiagnosisById,
  deleteDiagnosis,
} = require("../services/diagnose.service");

/**
 * POST /api/v1/diagnose
 * Submit a leaf image for AI disease diagnosis.
 */
async function submitDiagnosis(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: "NO_IMAGE", message: "An image file is required" },
      });
    }

    const cropType = req.body.cropType || "unknown";
    const userId = req.user.uid;

    const result = await createDiagnosis(
      userId,
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      cropType
    );

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error("[submitDiagnosis]", err);
    return res.status(500).json({
      success: false,
      error: { code: "DIAGNOSIS_FAILED", message: err.message || "Diagnosis failed" },
    });
  }
}

/**
 * GET /api/v1/diagnose/history
 * Get the authenticated farmer's diagnosis history.
 */
async function getHistory(req, res) {
  try {
    const userId = req.user.uid;
    const history = await getDiagnosisHistory(userId);
    return res.json({ success: true, data: history });
  } catch (err) {
    console.error("[getHistory]", err);
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_FAILED", message: "Failed to retrieve diagnosis history" },
    });
  }
}

/**
 * GET /api/v1/diagnose/:id
 * Get a single diagnosis result.
 */
async function getSingleDiagnosis(req, res) {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const diagnosis = await getDiagnosisById(userId, id);
    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Diagnosis not found" },
      });
    }

    return res.json({ success: true, data: diagnosis });
  } catch (err) {
    console.error("[getSingleDiagnosis]", err);
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_FAILED", message: "Failed to retrieve diagnosis" },
    });
  }
}

/**
 * DELETE /api/v1/diagnose/:id
 * Delete a diagnosis record.
 */
async function removeDiagnosis(req, res) {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const deleted = await deleteDiagnosis(userId, id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Diagnosis not found" },
      });
    }

    return res.json({ success: true, message: "Diagnosis deleted successfully" });
  } catch (err) {
    console.error("[removeDiagnosis]", err);
    return res.status(500).json({
      success: false,
      error: { code: "DELETE_FAILED", message: "Failed to delete diagnosis" },
    });
  }
}

module.exports = {
  submitDiagnosis,
  getHistory,
  getSingleDiagnosis,
  removeDiagnosis,
};
