jest.mock("../agents/fetcherAgent");
jest.mock("../agents/cleanerAgent");
jest.mock("../agents/analyzerAgent");
jest.mock("../agents/notifierAgent");
jest.mock("../agents/insightAgent");
jest.mock("../agents/patternExplainerAgent");
jest.mock("../utils/cache");
jest.mock("../config", () => ({
  LOG_LEVEL: "silent",
  NODE_ENV: "test",
  CACHE_TTL_MS: 1800000,
  CACHE_TTL_MINUTES: 30,
}));

describe("runCrew", () => {
  beforeEach(() => jest.resetModules());

  function setupHappyPath() {
    const fetcher = require("../agents/fetcherAgent");
    const cleaner = require("../agents/cleanerAgent");
    const analyzer = require("../agents/analyzerAgent");
    const notifier = require("../agents/notifierAgent");
    const insight = require("../agents/insightAgent");
    const pattern = require("../agents/patternExplainerAgent");
    const cache = require("../utils/cache");

    fetcher.run = jest.fn().mockResolvedValue("raw-csv");
    cleaner.run = jest.fn().mockResolvedValue("clean-csv");
    analyzer.run = jest.fn().mockResolvedValue("analysis");
    notifier.run = jest.fn().mockResolvedValue("summary");
    insight.run = jest.fn().mockResolvedValue("insights");
    pattern.run = jest.fn().mockResolvedValue("patterns");
    cache.get = jest.fn().mockReturnValue(null);
    cache.set = jest.fn();
  }

  test("returns all five result fields on success", async () => {
    setupHappyPath();
    const { runCrew } = require("../runCrew");
    const result = await runCrew({ forceRefresh: true });
    expect(result).toMatchObject({
      cleaned: "clean-csv",
      analysis: "analysis",
      summary: "summary",
      insights: "insights",
      patternExplanation: "patterns",
    });
  });

  test("returns cached result when cache is warm", async () => {
    setupHappyPath();
    const cache = require("../utils/cache");
    const cached = { cleaned: "c", analysis: "a", summary: "s", insights: "i", patternExplanation: "p" };
    cache.get = jest.fn().mockReturnValue(cached);

    const { runCrew } = require("../runCrew");
    const result = await runCrew();
    expect(result).toBe(cached);
    expect(require("../agents/fetcherAgent").run).not.toHaveBeenCalled();
  });

  test("throws when fetcher returns an error object", async () => {
    setupHappyPath();
    const fetcher = require("../agents/fetcherAgent");
    fetcher.run = jest.fn().mockResolvedValue({ error: true, message: "fetch-fail" });

    const { runCrew } = require("../runCrew");
    await expect(runCrew({ forceRefresh: true })).rejects.toThrow("fetch-fail");
  });

  test("throws when cleaner returns an error object", async () => {
    setupHappyPath();
    const cleaner = require("../agents/cleanerAgent");
    cleaner.run = jest.fn().mockResolvedValue({ error: true, message: "clean-fail" });

    const { runCrew } = require("../runCrew");
    await expect(runCrew({ forceRefresh: true })).rejects.toThrow("clean-fail");
  });
});
