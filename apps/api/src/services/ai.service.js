// services/ai.service.js
// Gemini Vision API wrapper for crop disease diagnosis
"use strict";

const { GoogleGenAI } = require("@google/genai");

const SUPPORTED_CROP_TYPES = ["maize", "tomato", "teff", "wheat", "sorghum", "barley", "other"];

// Use Gemini's multimodal model which supports image + text inputs
const MODEL = "gemini-2.0-flash";

/**
 * Diagnoses crop diseases from a leaf image using the Gemini Vision API.
 *
 * @param {Buffer} imageBuffer - Raw image data
 * @param {string} mimeType    - MIME type of the image (e.g. "image/jpeg")
 * @param {string} cropType    - Type of crop (e.g. "maize")
 * @returns {Promise<DiagnosisResult>}
 */
async function diagnoseCropDisease(imageBuffer, mimeType, cropType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // Instantiate the Gemini client with the provided API key
  const ai = new GoogleGenAI({ apiKey });

  const normalizedCrop = SUPPORTED_CROP_TYPES.includes(cropType?.toLowerCase())
    ? cropType.toLowerCase()
    : "unknown";

  const prompt = buildDiagnosisPrompt(normalizedCrop);

  // Gemini expects base64-encoded image data as a string
  const base64Image = imageBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        // Multimodal content: image bytes followed by the text instruction
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt },
        ],
      },
    ],
    config: {
      maxOutputTokens: 1024,
    },
  });

  // `response.text` is the convenience accessor for the first text part
  const rawText = response.text || "";
  return parseAIResponse(rawText, normalizedCrop);
}

/**
 * Builds the Gemini prompt for disease diagnosis.
 *
 * @param {string} cropType - Normalized crop type (e.g. "maize")
 * @returns {string}
 */
function buildDiagnosisPrompt(cropType) {
  return `You are an expert agricultural plant pathologist. Analyze this ${cropType !== "unknown" ? cropType : "crop"} leaf image and diagnose any diseases or health issues.

Respond ONLY in the following JSON format (no additional text):
{
  "isHealthy": boolean,
  "disease": "disease name or 'Healthy' if no disease",
  "confidence": number between 0.0 and 1.0,
  "severity": "none" | "low" | "medium" | "high",
  "symptoms": "brief description of observed symptoms",
  "remedy": "recommended treatment steps (empty string if healthy)",
  "prevention": "prevention measures for future crops"
}`;
}

/**
 * Parses the raw AI response text into a structured DiagnosisResult.
 * Falls back gracefully if JSON parsing fails.
 *
 * @param {string} rawText - Raw text from Gemini response
 * @param {string} cropType - Normalized crop type for the fallback object
 * @returns {DiagnosisResult}
 */
function parseAIResponse(rawText, cropType) {
  try {
    // Extract JSON block from response (model may include leading/trailing text)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in AI response");
    }
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      isHealthy: Boolean(parsed.isHealthy),
      disease: parsed.disease || "Unknown",
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
      severity: validateSeverity(parsed.severity),
      symptoms: String(parsed.symptoms || ""),
      remedy: String(parsed.remedy || ""),
      prevention: String(parsed.prevention || ""),
      cropType,
    };
  } catch (_err) {
    // Return a safe fallback if the model response can't be parsed
    return {
      isHealthy: false,
      disease: "Unable to determine",
      confidence: 0,
      severity: "none",
      symptoms: rawText.slice(0, 500),
      remedy: "Please consult a local agronomist.",
      prevention: "",
      cropType,
    };
  }
}

/**
 * Validates a severity string against the allowed set.
 * Returns "none" when the value is unrecognised.
 *
 * @param {string} value
 * @returns {"none"|"low"|"medium"|"high"}
 */
function validateSeverity(value) {
  const allowed = ["none", "low", "medium", "high"];
  return allowed.includes(value) ? value : "none";
}

module.exports = { diagnoseCropDisease };
