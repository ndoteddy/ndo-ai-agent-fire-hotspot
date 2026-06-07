jest.mock("../utils/apiClient");
jest.mock("../config", () => ({ TOGETHER_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));

describe("patternExplainerAgent", () => {
  test("patternExplainer.run returns explanation", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ TOGETHER_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.postTogether = jest.fn().mockResolvedValue({ choices: [{ message: { content: "pattern-explain" } }] });
    const agent = require("../agents/patternExplainerAgent");
    const res = await agent.run("analysis");
    expect(res).toBe("pattern-explain");
  });

  test("patternExplainer.run returns error object on API failure", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ TOGETHER_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.postTogether = jest.fn().mockRejectedValue(new Error("fail"));
    const agent = require("../agents/patternExplainerAgent");
    const res = await agent.run("analysis");
    expect(res).toMatchObject({ error: true });
  });

  test("patternExplainer.run returns error object when input is empty", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ TOGETHER_API_KEY: "test-key", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const agent = require("../agents/patternExplainerAgent");
    const res = await agent.run("");
    expect(res).toMatchObject({ error: true });
  });
});
