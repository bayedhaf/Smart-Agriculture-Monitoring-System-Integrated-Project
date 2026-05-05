// __tests__/unit/services/sensorAnalysis.service.test.js
// Unit tests for the Gemini AI sensor-data analysis service
"use strict";

// ── Mock the Gemini SDK before requiring the service ─────────────────────────
const mockGenerate = jest.fn();
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerate },
  })),
}));

const {
  analyzeSensorData,
  parseSensorAnalysisResponse,
  buildSensorAnalysisPrompt,
} = require("../../../src/services/sensor-analysis.service");

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a minimal Gemini API response object wrapping `jsonText`.
 * Gemini surfaces the first text part via the `text` convenience property.
 */
function makeApiResponse(jsonText) {
  return { text: jsonText };
}

/** A valid "optimal" sensor analysis JSON string. */
const OPTIMAL_JSON = JSON.stringify({
  status: "optimal",
  summary: "Conditions are ideal for maize growth.",
  recommendations: [
    "Continue current irrigation schedule.",
    "Monitor for pests regularly.",
  ],
  alerts: [],
  irrigationAdvice: "Current soil moisture is adequate. No additional irrigation needed.",
  fertilizerAdvice: "Apply balanced NPK fertilizer in 2 weeks.",
});

/** A valid "warning" sensor analysis JSON string. */
const WARNING_JSON = JSON.stringify({
  status: "warning",
  summary: "High temperature detected. Immediate attention recommended.",
  recommendations: [
    "Increase irrigation frequency.",
    "Apply mulch to reduce soil temperature.",
    "Consider shade netting for young plants.",
  ],
  alerts: [
    {
      type: "high_temperature",
      message: "Temperature exceeds optimal range for maize.",
      severity: "medium",
    },
    {
      type: "low_humidity",
      message: "Humidity is below optimal levels.",
      severity: "low",
    },
  ],
  irrigationAdvice: "Increase irrigation to twice daily in the morning and evening.",
  fertilizerAdvice: "Hold off on fertilization until temperature normalizes.",
});

/** A valid "critical" sensor analysis JSON string. */
const CRITICAL_JSON = JSON.stringify({
  status: "critical",
  summary: "Severe soil moisture deficit detected. Crops at risk of wilting.",
  recommendations: [
    "Irrigate immediately.",
    "Check for blocked irrigation lines.",
    "Inspect crops for early wilting signs.",
  ],
  alerts: [
    {
      type: "critical_soil_moisture",
      message: "Soil moisture has dropped below the critical threshold.",
      severity: "high",
    },
  ],
  irrigationAdvice: "Emergency irrigation required. Apply 30–40 mm of water immediately.",
  fertilizerAdvice: "Do not fertilize until moisture levels are restored.",
});

// ── Test suite: analyzeSensorData ─────────────────────────────────────────────

describe("analyzeSensorData", () => {
  const FAKE_API_KEY = "AIza-test-gemini-key";

  beforeEach(() => {
    process.env.GEMINI_API_KEY = FAKE_API_KEY;
    mockGenerate.mockReset();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  test("returns optimal analysis for healthy sensor readings", async () => {
    mockGenerate.mockResolvedValueOnce(makeApiResponse(OPTIMAL_JSON));

    const result = await analyzeSensorData({
      temperature: 24,
      humidity: 65,
      soilMoisture: 55,
      cropType: "maize",
    });

    expect(result.status).toBe("optimal");
    expect(result.summary).toBe("Conditions are ideal for maize growth.");
    expect(result.recommendations).toHaveLength(2);
    expect(result.alerts).toEqual([]);
    expect(typeof result.irrigationAdvice).toBe("string");
    expect(typeof result.fertilizerAdvice).toBe("string");
  });

  test("returns warning analysis when readings are outside ideal range", async () => {
    mockGenerate.mockResolvedValueOnce(makeApiResponse(WARNING_JSON));

    const result = await analyzeSensorData({
      temperature: 37,
      humidity: 35,
      soilMoisture: 45,
      cropType: "maize",
    });

    expect(result.status).toBe("warning");
    expect(result.alerts).toHaveLength(2);
    expect(result.alerts[0].type).toBe("high_temperature");
    expect(result.alerts[0].severity).toBe("medium");
  });

  test("returns critical analysis for dangerous conditions", async () => {
    mockGenerate.mockResolvedValueOnce(makeApiResponse(CRITICAL_JSON));

    const result = await analyzeSensorData({
      temperature: 30,
      humidity: 40,
      soilMoisture: 10,
      cropType: "tomato",
    });

    expect(result.status).toBe("critical");
    expect(result.alerts[0].severity).toBe("high");
  });

  test("works without a cropType", async () => {
    mockGenerate.mockResolvedValueOnce(makeApiResponse(OPTIMAL_JSON));

    const result = await analyzeSensorData({ temperature: 22, humidity: 60, soilMoisture: 50 });

    expect(result.status).toBe("optimal");
  });

  test("passes the correct model, system prompt, and message to the Gemini SDK", async () => {
    mockGenerate.mockResolvedValueOnce(makeApiResponse(OPTIMAL_JSON));

    await analyzeSensorData({ temperature: 24, humidity: 65, soilMoisture: 55, cropType: "teff" });

    const callArgs = mockGenerate.mock.calls[0][0];
    expect(callArgs.model).toBe("gemini-2.0-flash");
    expect(callArgs.config.maxOutputTokens).toBe(1024);
    expect(callArgs.config.systemInstruction).toContain("agricultural advisor");
    expect(callArgs.contents[0].role).toBe("user");
    // Sensor data is sent as a text part
    const textPart = callArgs.contents[0].parts[0].text;
    expect(textPart).toContain("teff");
    expect(textPart).toContain("24");
  });

  test("throws when GEMINI_API_KEY is not set", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(
      analyzeSensorData({ temperature: 24, humidity: 65, soilMoisture: 55 })
    ).rejects.toThrow("GEMINI_API_KEY");
  });

  test("throws when reading is null or missing", async () => {
    await expect(analyzeSensorData(null)).rejects.toThrow("reading is required");
    await expect(analyzeSensorData(undefined)).rejects.toThrow("reading is required");
  });

  test("throws when required sensor fields are missing", async () => {
    await expect(
      analyzeSensorData({ temperature: 24, humidity: 65 })
    ).rejects.toThrow("temperature, humidity, and soilMoisture are required");
  });

  test("throws when the API returns an empty response", async () => {
    mockGenerate.mockResolvedValueOnce({ text: null });
    await expect(
      analyzeSensorData({ temperature: 24, humidity: 65, soilMoisture: 55 })
    ).rejects.toThrow("Empty response from Gemini API");
  });

  test("throws when Gemini returns non-JSON text", async () => {
    mockGenerate.mockResolvedValueOnce(makeApiResponse("I cannot analyze that."));
    await expect(
      analyzeSensorData({ temperature: 24, humidity: 65, soilMoisture: 55 })
    ).rejects.toThrow("non-JSON response");
  });
});

// ── Test suite: parseSensorAnalysisResponse ───────────────────────────────────

describe("parseSensorAnalysisResponse", () => {
  test("parses a valid optimal response", () => {
    const result = parseSensorAnalysisResponse(OPTIMAL_JSON);
    expect(result.status).toBe("optimal");
    expect(result.alerts).toEqual([]);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  test("parses a valid warning response with alerts", () => {
    const result = parseSensorAnalysisResponse(WARNING_JSON);
    expect(result.status).toBe("warning");
    expect(result.alerts).toHaveLength(2);
    expect(result.alerts[0]).toHaveProperty("type");
    expect(result.alerts[0]).toHaveProperty("message");
    expect(result.alerts[0]).toHaveProperty("severity");
  });

  test("strips markdown code fences before parsing", () => {
    const wrapped = "```json\n" + OPTIMAL_JSON + "\n```";
    const result = parseSensorAnalysisResponse(wrapped);
    expect(result.status).toBe("optimal");
  });

  test("throws for invalid JSON", () => {
    expect(() => parseSensorAnalysisResponse("not json")).toThrow("non-JSON response");
  });

  test("throws when required fields are missing", () => {
    const incomplete = JSON.stringify({ status: "optimal", summary: "ok" });
    expect(() => parseSensorAnalysisResponse(incomplete)).toThrow("missing required fields");
  });

  test("throws for an invalid status value", () => {
    const bad = JSON.stringify({
      status: "unknown",
      summary: "x",
      recommendations: [],
      alerts: [],
      irrigationAdvice: "x",
      fertilizerAdvice: "x",
    });
    expect(() => parseSensorAnalysisResponse(bad)).toThrow("Invalid status value");
  });

  test("throws when recommendations is not an array", () => {
    const bad = JSON.stringify({
      status: "optimal",
      summary: "x",
      recommendations: "irrigate daily",
      alerts: [],
      irrigationAdvice: "x",
      fertilizerAdvice: "x",
    });
    expect(() => parseSensorAnalysisResponse(bad)).toThrow("recommendations must be an array");
  });

  test("throws when alerts is not an array", () => {
    const bad = JSON.stringify({
      status: "warning",
      summary: "x",
      recommendations: [],
      alerts: "high temperature",
      irrigationAdvice: "x",
      fertilizerAdvice: "x",
    });
    expect(() => parseSensorAnalysisResponse(bad)).toThrow("alerts must be an array");
  });

  test("defaults alert severity to 'low' when invalid value provided", () => {
    const withBadSeverity = JSON.stringify({
      status: "warning",
      summary: "x",
      recommendations: [],
      alerts: [{ type: "heat", message: "too hot", severity: "extreme" }],
      irrigationAdvice: "x",
      fertilizerAdvice: "x",
    });
    const result = parseSensorAnalysisResponse(withBadSeverity);
    expect(result.alerts[0].severity).toBe("low");
  });
});

// ── Test suite: buildSensorAnalysisPrompt ─────────────────────────────────────

describe("buildSensorAnalysisPrompt", () => {
  test("includes all sensor reading values in the prompt", () => {
    const prompt = buildSensorAnalysisPrompt({
      temperature: 28,
      humidity: 70,
      soilMoisture: 55,
      cropType: "maize",
    });
    expect(prompt).toContain("28");
    expect(prompt).toContain("70");
    expect(prompt).toContain("55");
    expect(prompt).toContain("maize");
  });

  test("includes ideal range hint when crop type is recognized", () => {
    const prompt = buildSensorAnalysisPrompt({
      temperature: 24,
      humidity: 65,
      soilMoisture: 55,
      cropType: "tomato",
    });
    expect(prompt).toContain("Ideal ranges for tomato");
  });

  test("does not include range hint for unknown crop type", () => {
    const prompt = buildSensorAnalysisPrompt({
      temperature: 24,
      humidity: 65,
      soilMoisture: 55,
      cropType: "mango",
    });
    expect(prompt).not.toContain("Ideal ranges");
  });

  test("handles missing cropType gracefully", () => {
    const prompt = buildSensorAnalysisPrompt({ temperature: 24, humidity: 65, soilMoisture: 55 });
    expect(prompt).toContain("unknown");
    expect(prompt).not.toContain("Ideal ranges");
  });
});
