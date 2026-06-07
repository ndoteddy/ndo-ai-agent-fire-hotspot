jest.mock("../agents/fetcherAgent");
jest.mock("../agents/cleanerAgent");
jest.mock("../agents/analyzerAgent");
jest.mock("../agents/notifierAgent");
jest.mock("../agents/insightAgent");
jest.mock("../agents/patternExplainerAgent");
jest.mock("../config", () => ({ LOG_LEVEL: "silent", NODE_ENV: "test" }));

describe("runCrew", () => {
  beforeEach(() => jest.resetModules());

  test("returns all five result fields on success", async () => {
    const fetcher = require("../agents/fetcherAgent");
    const cleaner = require("../agents/cleanerAgent");
    const analyzer = require("../agents/analyzerAgent");
    const notifier = require("../agents/notifierAgent");
    const insight = require("../agents/insightAgent");
    const pattern = require("../agents/patternExplainerAgent");

    fetcher.run = jest.fn().mockResolvedValue("raw-csv");
    cleaner.run = jest.fn().mockResolvedValue("clean-csv");
    analyzer.run = jest.fn().mockResolvedValue("analysis");
    notifier.run = jest.fn().mockResolvedValue("summary");
    insight.run = jest.fn().mockResolvedValue("insights");
    pattern.run = jest.fn().mockResolvedValue("patterns");

    const { runCrew } = require("../runCrew");
    const result = await runCrew();

    expect(result).toMatchObject({
      cleaned: "clean-csv",
      analysis: "analysis",
      summary: "summary",
      insights: "insights",
      patternExplanation: "patterns",
    });
  });

  test("throws when fetcher returns an error object", async () => {
    const fetcher = require("../agents/fetcherAgent");
    fetcher.run = jest.fn().mockResolvedValue({ error: true, message: "fetch-fail" });

    const { runCrew } = require("../runCrew");
    await expect(runCrew()).rejects.toThrow("fetch-fail");
  });

  test("throws when cleaner returns an error object", async () => {
    const fetcher = require("../agents/fetcherAgent");
    const cleaner = require("../agents/cleanerAgent");

    fetcher.run = jest.fn().mockResolvedValue("raw");
    cleaner.run = jest.fn().mockResolvedValue({ error: true, message: "clean-fail" });

    const { runCrew } = require("../runCrew");
    await expect(runCrew()).rejects.toThrow("clean-fail");
  });
});
