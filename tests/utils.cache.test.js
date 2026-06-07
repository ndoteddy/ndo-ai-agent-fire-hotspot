jest.useFakeTimers();

const cache = require("../utils/cache");

afterEach(() => {
  cache.invalidate("k");
  cache.invalidate("other");
  jest.clearAllTimers();
});

describe("cache", () => {
  test("get returns null for unknown key", () => {
    expect(cache.get("k")).toBeNull();
  });

  test("set then get returns stored value", () => {
    cache.set("k", { x: 1 }, 60000);
    expect(cache.get("k")).toEqual({ x: 1 });
  });

  test("get returns null after TTL expires", () => {
    cache.set("k", "hello", 5000);
    jest.advanceTimersByTime(5001);
    expect(cache.get("k")).toBeNull();
  });

  test("get still returns value before TTL expires", () => {
    cache.set("k", "hello", 5000);
    jest.advanceTimersByTime(4999);
    expect(cache.get("k")).toBe("hello");
  });

  test("invalidate removes the entry immediately", () => {
    cache.set("k", "bye", 60000);
    cache.invalidate("k");
    expect(cache.get("k")).toBeNull();
  });

  test("purgeExpired removes all expired entries", () => {
    cache.set("k", "a", 1000);
    cache.set("other", "b", 60000);
    jest.advanceTimersByTime(1001);
    cache.purgeExpired();
    expect(cache.get("k")).toBeNull();
    expect(cache.get("other")).toBe("b");
  });

  test("overwriting a key resets its TTL", () => {
    cache.set("k", "first", 2000);
    jest.advanceTimersByTime(1500);
    cache.set("k", "second", 2000);
    jest.advanceTimersByTime(1500);
    expect(cache.get("k")).toBe("second");
  });
});
