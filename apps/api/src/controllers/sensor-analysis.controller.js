// src/controllers/sensor-analysis.controller.js
// Request handler for AI-powered sensor data analysis
"use strict";

const { analyzeSensorData } = require("../services/sensor-analysis.service");

/**
 * POST /api/v1/sensor-analysis
 *
 * Accepts a JSON body with IoT sensor readings:
 * {
 *   "temperature":  number   (required) — air temperature in °C
 *   "humidity":     number   (required) — relative humidity in %
 *   "soilMoisture": number   (required) — soil moisture in %
 *   "cropType":     string   (optional) — e.g. "maize", "tomato"
 * }
 *
 * Returns AI-powered farming recommendations:
 * {
 *   "success": true,
 *   "data": {
 *     "status":           "optimal" | "warning" | "critical",
 *     "summary":          string,
 *     "recommendations":  string[],
 *     "alerts":           [{ "type": string, "message": string, "severity": "low"|"medium"|"high" }],
 *     "irrigationAdvice": string,
 *     "fertilizerAdvice": string
 *   }
 * }
 */
async function analyzeSensors(req, res) {
  try {
    const { temperature, humidity, soilMoisture, cropType } = req.body;

    if (temperature == null || humidity == null || soilMoisture == null) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "temperature, humidity, and soilMoisture are required",
        },
      });
    }

    if (
      typeof temperature !== "number" ||
      typeof humidity !== "number" ||
      typeof soilMoisture !== "number"
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_FIELDS",
          message: "temperature, humidity, and soilMoisture must be numbers",
        },
      });
    }

    const result = await analyzeSensorData({ temperature, humidity, soilMoisture, cropType });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("[analyzeSensors]", err.message);
    return res.status(500).json({
      success: false,
      error: { code: "AI_SERVICE_ERROR", message: err.message },
    });
  }
}

module.exports = { analyzeSensors };
