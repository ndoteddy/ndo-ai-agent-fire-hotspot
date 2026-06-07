jest.mock("../utils/apiClient");
jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));

describe("analyzerAgent", () => {
  test("analyzer.run returns analysis text", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.postGemini = jest.fn().mockResolvedValue({ candidates: [{ content: { parts: [{ text: "analysis-text" }] } }] });
    const analyzer = require("../agents/analyzerAgent");
    const res = await analyzer.run("cleaned-csv");
    expect(res).toBe("analysis-text");
  });

  test("analyzer.run returns error object on API failure", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.postGemini = jest.fn().mockRejectedValue(new Error("fail"));
    const analyzer = require("../agents/analyzerAgent");
    const res = await analyzer.run("cleaned-csv");
    expect(res).toMatchObject({ error: true });
  });

  test("analyzer.run returns error object when input is empty", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const analyzer = require("../agents/analyzerAgent");
    const res = await analyzer.run("");
    expect(res).toMatchObject({ error: true });
  });
});
