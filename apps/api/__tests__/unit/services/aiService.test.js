// __tests__/unit/services/aiService.test.js
// Unit tests for the Gemini Vision AI service (image → JSON output)
"use strict";

// ── Mock the Gemini SDK before requiring the service ─────────────────────────
const mockGenerate = jest.fn();
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerate },
  })),
}));

const { analyzeImage, parseResponse, buildMessages } = require("../../../src/services/aiService");

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a minimal Gemini API response object wrapping `jsonText`.
 * Gemini surfaces the first text part via the `text` convenience property.
 */
function makeApiResponse(jsonText) {
  return { text: jsonText };
}

/** A valid healthy-plant diagnosis JSON string. */
const HEALTHY_JSON = JSON.stringify({
  isHealthy: true,
  disease: null,
  confidence: 0.97,
  severity: "none",
  remedy: "No treatment needed.",
  prevention: "Ensure adequate watering and sunlight.",
  description: "The leaf appears healthy with no visible signs of disease.",
});

/** A valid diseased-plant diagnosis JSON string. */
const DISEASED_JSON = JSON.stringify({
  isHealthy: false,
  disease: "Maize Grey Leaf Spot",
  confidence: 0.92,
  severity: "medium",
  remedy: "Apply fungicide (e.g. Mancozeb) weekly for 3 weeks. Remove heavily infected leaves.",
  prevention: "Use resistant varieties, ensure proper plant spacing, and avoid overhead irrigation.",
  description:
    "Grey-brown lesions with yellow halos observed on the lower leaves, consistent with Grey Leaf Spot caused by Cercospora zeae-maydis.",
});

// ── Test suite: analyzeImage ──────────────────────────────────────────────────

describe("analyzeImage", () => {
  const FAKE_API_KEY = "AIza-test-gemini-key";

  beforeEach(() => {
    process.env.GEMINI_API_KEY = FAKE_API_KEY;
    mockGenerate.mockReset();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  test("returns structured JSON for a healthy leaf", async () => {
    mockGenerate.mockResolvedValueOnce(makeApiResponse(HEALTHY_JSON));

    const result = await analyzeImage("base64encodeddata==", "image/jpeg", "maize");

    expect(result).toEqual({
      isHealthy: true,
      disease: null,
      confidence: 0.97,
      severity: "none",
      remedy: "No treatment needed.",
      prevention: "Ensure adequate watering and sunlight.",
      description: "The leaf appears healthy with no visible signs of disease.",
    });
  });

  test("returns structured JSON for a diseased leaf", async () => {
    mockGenerate.mockResolvedValueOnce(makeApiResponse(DISEASED_JSON));

    const result = await analyzeImage("base64encodeddata==", "image/png");

    expect(result.isHealthy).toBe(false);
    expect(result.disease).toBe("Maize Grey Leaf Spot");
    expect(result.confidence).toBeCloseTo(0.92);
    expect(result.severity).toBe("medium");
    expect(typeof result.remedy).toBe("string");
    expect(typeof result.prevention).toBe("string");
    expect(typeof result.description).toBe("string");
  });

  test("passes the correct model and contents to the Gemini SDK", async () => {
    mockGenerate.mockResolvedValueOnce(makeApiResponse(HEALTHY_JSON));

    await analyzeImage("abc123==", "image/jpeg", "tomato");

    const callArgs = mockGenerate.mock.calls[0][0];
    expect(callArgs.model).toBe("gemini-2.0-flash");
    expect(callArgs.config.maxOutputTokens).toBe(1024);
    expect(callArgs.config.systemInstruction).toContain("agricultural pathologist");
    // The user message should have image data and a text block in `parts`
    const parts = callArgs.contents[0].parts;
    expect(parts[0].inlineData.data).toBe("abc123==");
    expect(parts[1].text).toContain("tomato");
  });

  test("throws when GEMINI_API_KEY is not set", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(analyzeImage("abc123==")).rejects.toThrow("GEMINI_API_KEY");
  });

  test("throws when no image is provided", async () => {
    await expect(analyzeImage("")).rejects.toThrow("base64Image is required");
    await expect(analyzeImage(null)).rejects.toThrow("base64Image is required");
  });

  test("throws when the API returns an empty response", async () => {
    mockGenerate.mockResolvedValueOnce({ text: null });
    await expect(analyzeImage("abc123==")).rejects.toThrow("Empty response from Gemini API");
  });

  test("throws when Gemini returns non-JSON text", async () => {
    mockGenerate.mockResolvedValueOnce(makeApiResponse("Sorry, I cannot analyze this image."));
    await expect(analyzeImage("abc123==")).rejects.toThrow("non-JSON response");
  });
});

// ── Test suite: parseResponse ─────────────────────────────────────────────────

describe("parseResponse", () => {
  test("parses a valid healthy-plant JSON string", () => {
    const result = parseResponse(HEALTHY_JSON);
    expect(result.isHealthy).toBe(true);
    expect(result.disease).toBeNull();
    expect(result.severity).toBe("none");
  });

  test("parses a valid diseased-plant JSON string", () => {
    const result = parseResponse(DISEASED_JSON);
    expect(result.isHealthy).toBe(false);
    expect(result.disease).toBe("Maize Grey Leaf Spot");
    expect(result.severity).toBe("medium");
  });

  test("strips markdown code fences before parsing", () => {
    const wrapped = "```json\n" + HEALTHY_JSON + "\n```";
    const result = parseResponse(wrapped);
    expect(result.isHealthy).toBe(true);
  });

  test("throws for invalid JSON", () => {
    expect(() => parseResponse("not json")).toThrow("non-JSON response");
  });

  test("throws when required fields are missing", () => {
    const incomplete = JSON.stringify({ isHealthy: true, confidence: 0.9 });
    expect(() => parseResponse(incomplete)).toThrow("missing required fields");
  });

  test("throws for an invalid severity value", () => {
    const bad = JSON.stringify({
      isHealthy: false,
      disease: "Rust",
      confidence: 0.8,
      severity: "extreme",
      remedy: "...",
      prevention: "...",
      description: "...",
    });
    expect(() => parseResponse(bad)).toThrow("Invalid severity value");
  });

  test("throws for an out-of-range confidence value", () => {
    const bad = JSON.stringify({
      isHealthy: false,
      disease: "Rust",
      confidence: 1.5,
      severity: "high",
      remedy: "...",
      prevention: "...",
      description: "...",
    });
    expect(() => parseResponse(bad)).toThrow("Invalid confidence value");
  });
});

// ── Test suite: buildMessages ─────────────────────────────────────────────────

describe("buildMessages", () => {
  test("builds the correct Gemini contents array without cropType", () => {
    const msgs = buildMessages("imgdata==", "image/jpeg");
    expect(msgs).toHaveLength(1);
    expect(msgs[0].role).toBe("user");
    // Gemini uses `parts` (with inlineData/text) instead of content blocks
    expect(msgs[0].parts[0].inlineData.data).toBe("imgdata==");
    expect(msgs[0].parts[0].inlineData.mimeType).toBe("image/jpeg");
    expect(typeof msgs[0].parts[1].text).toBe("string");
  });

  test("includes the crop type hint in the text part", () => {
    const msgs = buildMessages("imgdata==", "image/png", "teff");
    expect(msgs[0].parts[1].text).toContain("teff");
  });
});
