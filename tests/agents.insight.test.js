jest.mock("../utils/apiClient");
jest.mock("../config", () => ({ TOGETHER_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));

describe("insightAgent", () => {
  test("insight.run returns expert insight", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ TOGETHER_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.postTogether = jest.fn().mockResolvedValue({ choices: [{ message: { content: "expert-insight" } }] });
    const insight = require("../agents/insightAgent");
    const res = await insight.run("analysis-report");
    expect(res).toBe("expert-insight");
  });

  test("insight.run returns error object on API failure", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ TOGETHER_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.postTogether = jest.fn().mockRejectedValue(new Error("fail"));
    const insight = require("../agents/insightAgent");
    const res = await insight.run("analysis-report");
    expect(res).toMatchObject({ error: true });
  });

  test("insight.run returns error object when input is empty", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ TOGETHER_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const insight = require("../agents/insightAgent");
    const res = await insight.run("");
    expect(res).toMatchObject({ error: true });
  });
});
