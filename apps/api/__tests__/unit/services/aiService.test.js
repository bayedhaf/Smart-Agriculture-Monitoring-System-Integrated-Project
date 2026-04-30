// __tests__/unit/services/aiService.test.js
// Unit tests for the Claude Vision AI service (image → JSON output)
"use strict";

// ── Mock the Anthropic SDK before requiring the service ──────────────────────
const mockCreate = jest.fn();
jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  }));
});

const { analyzeImage, parseResponse, buildMessages } = require("../../../src/services/aiService");

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal Anthropic API response wrapping `jsonText`. */
function makeApiResponse(jsonText) {
  return { content: [{ type: "text", text: jsonText }] };
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
  const FAKE_API_KEY = "sk-ant-test-key";

  beforeEach(() => {
    process.env.CLAUDE_API_KEY = FAKE_API_KEY;
    mockCreate.mockReset();
  });

  afterEach(() => {
    delete process.env.CLAUDE_API_KEY;
  });

  test("returns structured JSON for a healthy leaf", async () => {
    mockCreate.mockResolvedValueOnce(makeApiResponse(HEALTHY_JSON));

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
    mockCreate.mockResolvedValueOnce(makeApiResponse(DISEASED_JSON));

    const result = await analyzeImage("base64encodeddata==", "image/png");

    expect(result.isHealthy).toBe(false);
    expect(result.disease).toBe("Maize Grey Leaf Spot");
    expect(result.confidence).toBeCloseTo(0.92);
    expect(result.severity).toBe("medium");
    expect(typeof result.remedy).toBe("string");
    expect(typeof result.prevention).toBe("string");
    expect(typeof result.description).toBe("string");
  });

  test("passes the correct model and messages to the Anthropic SDK", async () => {
    mockCreate.mockResolvedValueOnce(makeApiResponse(HEALTHY_JSON));

    await analyzeImage("abc123==", "image/jpeg", "tomato");

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe("claude-opus-4-5");
    expect(callArgs.max_tokens).toBe(1024);
    expect(callArgs.system).toContain("agricultural pathologist");
    // The user message should contain both an image and a text block
    const userContent = callArgs.messages[0].content;
    expect(userContent[0].type).toBe("image");
    expect(userContent[0].source.data).toBe("abc123==");
    expect(userContent[1].type).toBe("text");
    expect(userContent[1].text).toContain("tomato");
  });

  test("throws when CLAUDE_API_KEY is not set", async () => {
    delete process.env.CLAUDE_API_KEY;
    await expect(analyzeImage("abc123==")).rejects.toThrow("CLAUDE_API_KEY");
  });

  test("throws when no image is provided", async () => {
    await expect(analyzeImage("")).rejects.toThrow("base64Image is required");
    await expect(analyzeImage(null)).rejects.toThrow("base64Image is required");
  });

  test("throws when the API returns an empty response", async () => {
    mockCreate.mockResolvedValueOnce({ content: [] });
    await expect(analyzeImage("abc123==")).rejects.toThrow("Empty response from Claude API");
  });

  test("throws when Claude returns non-JSON text", async () => {
    mockCreate.mockResolvedValueOnce(makeApiResponse("Sorry, I cannot analyze this image."));
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
  test("builds the correct messages array without cropType", () => {
    const msgs = buildMessages("imgdata==", "image/jpeg");
    expect(msgs).toHaveLength(1);
    expect(msgs[0].role).toBe("user");
    expect(msgs[0].content[0].type).toBe("image");
    expect(msgs[0].content[0].source.data).toBe("imgdata==");
    expect(msgs[0].content[0].source.media_type).toBe("image/jpeg");
    expect(msgs[0].content[1].type).toBe("text");
  });

  test("includes the crop type hint in the text message", () => {
    const msgs = buildMessages("imgdata==", "image/png", "teff");
    expect(msgs[0].content[1].text).toContain("teff");
  });
});
