jest.mock("../utils/apiClient");
jest.mock("../config", () => ({
  NASA_FIRMS_URL: "https://example.com/firms",
  LOG_LEVEL: "silent",
  NODE_ENV: "test",
}));

describe("fetcherAgent", () => {
  test("fetcher.run returns fetched data", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ NASA_FIRMS_URL: "https://example.com/firms", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.getUrl = jest.fn().mockResolvedValue("csv-data");
    const fetcher = require("../agents/fetcherAgent");
    const res = await fetcher.run();
    expect(res).toBe("csv-data");
    expect(apiClient.getUrl).toHaveBeenCalledWith("https://example.com/firms");
  });

  test("fetcher.run returns error object when fetch fails", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ NASA_FIRMS_URL: "https://example.com/firms", LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const apiClient = require("../utils/apiClient");
    apiClient.getUrl = jest.fn().mockRejectedValue(new Error("nope"));
    const fetcher = require("../agents/fetcherAgent");
    const res = await fetcher.run();
    expect(res).toMatchObject({ error: true });
  });

  test("fetcher.run returns error object when URL is not configured", async () => {
    jest.resetModules();
    jest.mock("../config", () => ({ NASA_FIRMS_URL: undefined, LOG_LEVEL: "silent", NODE_ENV: "test" }));
    const fetcher = require("../agents/fetcherAgent");
    const res = await fetcher.run();
    expect(res).toMatchObject({ error: true });
  });
});
