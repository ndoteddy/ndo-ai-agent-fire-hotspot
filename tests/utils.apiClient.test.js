jest.mock("axios");
jest.mock("../config", () => ({
  LOG_LEVEL: "silent",
  API_TIMEOUT_MS: 5000,
  API_MAX_RETRIES: 0,
  NODE_ENV: "test",
}));

const axios = require("axios");
const apiClient = require("../utils/apiClient");

describe("apiClient", () => {
  afterEach(() => jest.resetAllMocks());

  describe("getUrl", () => {
    test("returns data on success", async () => {
      axios.get.mockResolvedValue({ data: "payload" });
      const res = await apiClient.getUrl("http://example.test");
      expect(res).toBe("payload");
    });

    test("marks error with isApiError and rethrows", async () => {
      const err = new Error("network");
      axios.get.mockRejectedValue(err);
      await expect(apiClient.getUrl("http://fail.test")).rejects.toMatchObject({
        message: "network",
        isApiError: true,
      });
    });
  });

  describe("postTogether", () => {
    test("returns response data on success", async () => {
      axios.post.mockResolvedValue({ data: { choices: [{ message: { content: "ok" } }] } });
      const res = await apiClient.postTogether("model", [{ role: "user", content: "hi" }], "key");
      expect(res.choices[0].message.content).toBe("ok");
    });

    test("marks error with isApiError and rethrows", async () => {
      const err = new Error("together-fail");
      axios.post.mockRejectedValue(err);
      await expect(apiClient.postTogether("model", [], "key")).rejects.toMatchObject({
        message: "together-fail",
        isApiError: true,
      });
    });
  });

  describe("postGemini", () => {
    test("returns response data on success", async () => {
      axios.post.mockResolvedValue({ data: { candidates: [{ content: { parts: [{ text: "out" }] } }] } });
      const res = await apiClient.postGemini("prompt", "key");
      expect(res.candidates[0].content.parts[0].text).toBe("out");
    });

    test("marks error with isApiError and rethrows", async () => {
      const err = new Error("gemini-fail");
      axios.post.mockRejectedValue(err);
      await expect(apiClient.postGemini("prompt", "key")).rejects.toMatchObject({
        message: "gemini-fail",
        isApiError: true,
      });
    });
  });
});
