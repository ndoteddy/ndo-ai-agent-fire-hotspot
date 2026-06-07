jest.mock("../utils/apiClient");
jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));

describe("cleanerAgent", () => {
  test("cleaner.run returns cleaned text", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.postGemini = jest.fn().mockResolvedValue({ candidates: [{ content: { parts: [{ text: "cleaned-csv" }] } }] });
    const cleaner = require("../agents/cleanerAgent");
    const res = await cleaner.run("raw-csv");
    expect(res).toBe("cleaned-csv");
  });

  test("cleaner.run returns error object on API failure", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.postGemini = jest.fn().mockRejectedValue(new Error("fail"));
    const cleaner = require("../agents/cleanerAgent");
    const res = await cleaner.run("raw-csv");
    expect(res).toMatchObject({ error: true });
  });

  test("cleaner.run returns error object when input is empty", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const cleaner = require("../agents/cleanerAgent");
    const res = await cleaner.run("");
    expect(res).toMatchObject({ error: true });
  });
});
