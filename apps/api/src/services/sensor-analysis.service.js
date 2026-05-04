// src/services/sensor-analysis.service.js
// Claude AI-powered analysis of IoT sensor readings for farming recommendations
"use strict";

const Anthropic = require("@anthropic-ai/sdk");

const MODEL = "claude-opus-4-5";

const SENSOR_ANALYSIS_SYSTEM_PROMPT = `You are an expert agricultural advisor specializing in precision farming and IoT sensor data interpretation.
Analyze the provided sensor readings from a farm and return ONLY a valid JSON object — no markdown fences, no extra text.

The JSON must follow this exact schema:
{
  "status": "optimal" | "warning" | "critical",
  "summary": string,
  "recommendations": string[],
  "alerts": [{ "type": string, "message": string, "severity": "low" | "medium" | "high" }],
  "irrigationAdvice": string,
  "fertilizerAdvice": string
}

Rules:
- "status" is "optimal" when all parameters are within acceptable ranges for the crop.
- "status" is "warning" when one or more parameters are slightly outside ideal ranges.
- "status" is "critical" when conditions require immediate farmer attention.
- "summary" is a concise overview (1–2 sentences) of the current field conditions.
- "recommendations" is a list of 2–5 actionable steps the farmer should take now.
- "alerts" is a list of specific concerns; use an empty array when status is "optimal".
- Each alert's "type" is a short identifier (e.g. "high_temperature", "low_soil_moisture").
- "irrigationAdvice" provides specific irrigation guidance based on the current readings.
- "fertilizerAdvice" provides fertilization recommendations based on current conditions.`;

/**
 * Typical ideal ranges per supported crop type.
 * Values are used to provide context to the model prompt.
 */
const CROP_RANGES = {
  maize:   { tempMin: 18, tempMax: 32, humidityMin: 50, humidityMax: 80, soilMoistureMin: 40, soilMoistureMax: 70 },
  tomato:  { tempMin: 18, tempMax: 29, humidityMin: 60, humidityMax: 80, soilMoistureMin: 50, soilMoistureMax: 75 },
  teff:    { tempMin: 10, tempMax: 27, humidityMin: 40, humidityMax: 70, soilMoistureMin: 30, soilMoistureMax: 60 },
  wheat:   { tempMin: 12, tempMax: 25, humidityMin: 40, humidityMax: 70, soilMoistureMin: 40, soilMoistureMax: 65 },
  sorghum: { tempMin: 20, tempMax: 35, humidityMin: 40, humidityMax: 75, soilMoistureMin: 30, soilMoistureMax: 65 },
  barley:  { tempMin: 10, tempMax: 25, humidityMin: 45, humidityMax: 70, soilMoistureMin: 35, soilMoistureMax: 60 },
};

/**
 * Build the Claude prompt for sensor data analysis.
 *
 * @param {object} reading
 * @param {number} reading.temperature  - Air temperature in °C
 * @param {number} reading.humidity     - Relative humidity in %
 * @param {number} reading.soilMoisture - Soil moisture in %
 * @param {string} [reading.cropType]   - Crop type hint (e.g. "maize")
 * @returns {string}
 */
function buildSensorAnalysisPrompt({ temperature, humidity, soilMoisture, cropType }) {
  const crop = cropType?.toLowerCase();
  const ranges = CROP_RANGES[crop] || null;

  const rangeInfo = ranges
    ? `\nIdeal ranges for ${cropType}: temperature ${ranges.tempMin}–${ranges.tempMax}°C, ` +
      `humidity ${ranges.humidityMin}–${ranges.humidityMax}%, ` +
      `soil moisture ${ranges.soilMoistureMin}–${ranges.soilMoistureMax}%.`
    : "";

  return (
    `Analyze the following farm sensor readings and provide agricultural recommendations.\n\n` +
    `Sensor Readings:\n` +
    `- Temperature: ${temperature}°C\n` +
    `- Humidity: ${humidity}%\n` +
    `- Soil Moisture: ${soilMoisture}%\n` +
    `- Crop Type: ${cropType || "unknown"}` +
    rangeInfo +
    `\n\nReturn a JSON response with your analysis and recommendations.`
  );
}

/**
 * Parse and validate the raw Claude text response into a SensorAnalysisResult.
 *
 * @param {string} rawText
 * @returns {SensorAnalysisResult}
 * @throws {Error} If the response is not valid JSON or violates the schema.
 */
function parseSensorAnalysisResponse(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText.trim());
  } catch {
    throw new Error(`Claude returned non-JSON response: ${rawText.slice(0, 200)}`);
  }

  const requiredFields = [
    "status",
    "summary",
    "recommendations",
    "alerts",
    "irrigationAdvice",
    "fertilizerAdvice",
  ];
  const missing = requiredFields.filter((f) => !(f in parsed));
  if (missing.length > 0) {
    throw new Error(`Claude response missing required fields: ${missing.join(", ")}`);
  }

  const validStatuses = ["optimal", "warning", "critical"];
  if (!validStatuses.includes(parsed.status)) {
    throw new Error(`Invalid status value: ${parsed.status}`);
  }

  if (!Array.isArray(parsed.recommendations)) {
    throw new Error("recommendations must be an array");
  }

  if (!Array.isArray(parsed.alerts)) {
    throw new Error("alerts must be an array");
  }

  const validSeverities = ["low", "medium", "high"];

  return {
    status: parsed.status,
    summary: String(parsed.summary),
    recommendations: parsed.recommendations.map(String),
    alerts: parsed.alerts.map((a) => ({
      type: String(a.type || ""),
      message: String(a.message || ""),
      severity: validSeverities.includes(a.severity) ? a.severity : "low",
    })),
    irrigationAdvice: String(parsed.irrigationAdvice),
    fertilizerAdvice: String(parsed.fertilizerAdvice),
  };
}

/**
 * Analyze farm sensor readings using Claude AI and return structured recommendations.
 *
 * @param {object} reading
 * @param {number} reading.temperature  - Air temperature in °C
 * @param {number} reading.humidity     - Relative humidity in %
 * @param {number} reading.soilMoisture - Soil moisture in %
 * @param {string} [reading.cropType]   - Optional crop type hint (e.g. "maize")
 * @returns {Promise<SensorAnalysisResult>} Structured analysis:
 *   {
 *     status: "optimal"|"warning"|"critical",
 *     summary: string,
 *     recommendations: string[],
 *     alerts: [{ type, message, severity }],
 *     irrigationAdvice: string,
 *     fertilizerAdvice: string
 *   }
 */
async function analyzeSensorData(reading) {
  if (!reading || typeof reading !== "object") {
    throw new Error("reading is required");
  }

  const { temperature, humidity, soilMoisture } = reading;

  if (temperature == null || humidity == null || soilMoisture == null) {
    throw new Error("temperature, humidity, and soilMoisture are required");
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error("CLAUDE_API_KEY environment variable is not set");
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SENSOR_ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildSensorAnalysisPrompt(reading),
      },
    ],
  });

  const rawText = response.content?.[0]?.text;
  if (!rawText) {
    throw new Error("Empty response from Claude API");
  }

  return parseSensorAnalysisResponse(rawText);
}

module.exports = { analyzeSensorData, buildSensorAnalysisPrompt, parseSensorAnalysisResponse };
