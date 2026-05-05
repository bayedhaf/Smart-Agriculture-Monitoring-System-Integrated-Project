// src/services/aiService.js
// Gemini Vision API wrapper for crop disease diagnosis
"use strict";

const { GoogleGenAI } = require("@google/genai");

// Use Gemini's multimodal model which supports image + text inputs
const MODEL = "gemini-2.0-flash";

const DIAGNOSIS_SYSTEM_PROMPT = `You are an expert agricultural pathologist specializing in crop disease diagnosis.
Analyze the provided leaf image and return ONLY a valid JSON object — no markdown fences, no extra text.

The JSON must follow this exact schema:
{
  "isHealthy": boolean,
  "disease": string | null,
  "confidence": number (0.0–1.0),
  "severity": "none" | "low" | "medium" | "high",
  "remedy": string,
  "prevention": string,
  "description": string
}

Rules:
- "isHealthy" is true when no disease is detected.
- "disease" is null when the plant is healthy.
- "confidence" reflects how certain you are (0.0 = not at all, 1.0 = absolutely certain).
- "severity" is "none" for healthy plants.
- "remedy" describes treatment steps; use "No treatment needed." for healthy plants.
- "prevention" describes best practices to keep the crop healthy.
- "description" is a brief explanation of your findings.`;

/**
 * Build the Gemini multimodal content payload for a base64-encoded image.
 *
 * Gemini uses a `contents` array where each element has a `role` and `parts`.
 * Image data is passed via `inlineData` with the MIME type and base64 bytes.
 *
 * @param {string} base64Image  - Base64-encoded image data (without the data: prefix).
 * @param {string} mediaType    - MIME type, e.g. "image/jpeg" or "image/png".
 * @param {string} [cropType]   - Optional crop type hint, e.g. "maize".
 * @returns {Array} contents array for the Gemini API.
 */
function buildMessages(base64Image, mediaType, cropType) {
  const cropHint = cropType ? ` The crop type is: ${cropType}.` : "";
  return [
    {
      role: "user",
      parts: [
        // Inline image data — Gemini accepts base64-encoded bytes with a MIME type
        {
          inlineData: {
            mimeType: mediaType,
            data: base64Image,
          },
        },
        {
          text: `Analyze this leaf image for diseases and return a JSON diagnosis.${cropHint}`,
        },
      ],
    },
  ];
}

/**
 * Parse the raw text response from Gemini into a validated diagnosis object.
 *
 * @param {string} rawText - The text content from Gemini's response.
 * @returns {Object} Parsed and validated diagnosis object.
 * @throws {Error} If the response is not valid JSON or missing required fields.
 */
function parseResponse(rawText) {
  let parsed;
  try {
    // Gemini may occasionally wrap output in markdown code fences; strip them
    const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned non-JSON response: ${rawText.slice(0, 200)}`);
  }

  const requiredFields = [
    "isHealthy",
    "disease",
    "confidence",
    "severity",
    "remedy",
    "prevention",
    "description",
  ];
  const missing = requiredFields.filter((f) => !(f in parsed));
  if (missing.length > 0) {
    throw new Error(`Gemini response missing required fields: ${missing.join(", ")}`);
  }

  const validSeverities = ["none", "low", "medium", "high"];
  if (!validSeverities.includes(parsed.severity)) {
    throw new Error(`Invalid severity value: ${parsed.severity}`);
  }

  if (typeof parsed.confidence !== "number" || parsed.confidence < 0 || parsed.confidence > 1) {
    throw new Error(`Invalid confidence value: ${parsed.confidence}`);
  }

  return {
    isHealthy: Boolean(parsed.isHealthy),
    disease: parsed.disease ?? null,
    confidence: parsed.confidence,
    severity: parsed.severity,
    remedy: String(parsed.remedy),
    prevention: String(parsed.prevention),
    description: String(parsed.description),
  };
}

/**
 * Analyze a crop leaf image using the Gemini Vision API.
 *
 * @param {string} base64Image  - Base64-encoded image data (without the data: prefix).
 * @param {string} [mediaType]  - MIME type. Defaults to "image/jpeg".
 * @param {string} [cropType]   - Optional crop type hint, e.g. "maize".
 * @returns {Promise<Object>} Structured diagnosis JSON:
 *   {
 *     isHealthy: boolean,
 *     disease: string | null,
 *     confidence: number,
 *     severity: "none"|"low"|"medium"|"high",
 *     remedy: string,
 *     prevention: string,
 *     description: string
 *   }
 */
async function analyzeImage(base64Image, mediaType = "image/jpeg", cropType = null) {
  if (!base64Image) {
    throw new Error("base64Image is required");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  // Instantiate the Gemini client with the provided API key
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildMessages(base64Image, mediaType, cropType),
    config: {
      // Inject the agricultural expert persona as the system instruction
      systemInstruction: DIAGNOSIS_SYSTEM_PROMPT,
      maxOutputTokens: 1024,
    },
  });

  // `response.text` is the convenience accessor for the first text part
  const rawText = response.text;
  if (!rawText) {
    throw new Error("Empty response from Gemini API");
  }

  return parseResponse(rawText);
}

module.exports = { analyzeImage, parseResponse, buildMessages };
