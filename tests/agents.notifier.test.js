jest.mock("../utils/apiClient");
jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));

describe("notifierAgent", () => {
  test("notifier.run returns public summary", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.postGemini = jest.fn().mockResolvedValue({ candidates: [{ content: { parts: [{ text: "public-summary" }] } }] });
    const notifier = require("../agents/notifierAgent");
    const res = await notifier.run("analysis");
    expect(res).toBe("public-summary");
  });

  test("notifier.run returns error object on API failure", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.postGemini = jest.fn().mockRejectedValue(new Error("fail"));
    const notifier = require("../agents/notifierAgent");
    const res = await notifier.run("analysis");
    expect(res).toMatchObject({ error: true });
  });

  test("notifier.run returns error object when input is empty", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ GEMINI_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const notifier = require("../agents/notifierAgent");
    const res = await notifier.run("");
    expect(res).toMatchObject({ error: true });
  });
});
