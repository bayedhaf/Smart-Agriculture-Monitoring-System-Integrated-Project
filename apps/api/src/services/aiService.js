// src/services/aiService.js
// Claude Vision API wrapper for crop disease diagnosis
"use strict";

const Anthropic = require("@anthropic-ai/sdk");

const MODEL = "claude-opus-4-5";

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
 * Build the Claude messages payload for a base64-encoded image.
 *
 * @param {string} base64Image  - Base64-encoded image data (without the data: prefix).
 * @param {string} mediaType    - MIME type, e.g. "image/jpeg" or "image/png".
 * @param {string} [cropType]   - Optional crop type hint, e.g. "maize".
 * @returns {Array} messages array for the Anthropic API.
 */
function buildMessages(base64Image, mediaType, cropType) {
  const cropHint = cropType ? ` The crop type is: ${cropType}.` : "";
  return [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64Image,
          },
        },
        {
          type: "text",
          text: `Analyze this leaf image for diseases and return a JSON diagnosis.${cropHint}`,
        },
      ],
    },
  ];
}

/**
 * Parse the raw text response from Claude into a validated diagnosis object.
 *
 * @param {string} rawText - The text content from Claude's response.
 * @returns {Object} Parsed and validated diagnosis object.
 * @throws {Error} If the response is not valid JSON or missing required fields.
 */
function parseResponse(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText.trim());
  } catch {
    throw new Error(`Claude returned non-JSON response: ${rawText.slice(0, 200)}`);
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
    throw new Error(`Claude response missing required fields: ${missing.join(", ")}`);
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
 * Analyze a crop leaf image using the Claude Vision API.
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

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error("CLAUDE_API_KEY environment variable is not set");
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: DIAGNOSIS_SYSTEM_PROMPT,
    messages: buildMessages(base64Image, mediaType, cropType),
  });

  const rawText = response.content?.[0]?.text;
  if (!rawText) {
    throw new Error("Empty response from Claude API");
  }

  return parseResponse(rawText);
}

module.exports = { analyzeImage, parseResponse, buildMessages };
