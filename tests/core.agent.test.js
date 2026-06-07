jest.mock("../config", () => ({ LOG_LEVEL: "silent", NODE_ENV: "test" }));

const Agent = require("../core/agent");

describe("Agent core", () => {
  test("constructor throws without a name", () => {
    expect(() => new Agent({ handler: async () => {} })).toThrow("valid name");
  });

  test("constructor throws without a handler", () => {
    expect(() => new Agent({ name: "x" })).toThrow("handler function");
  });

  test("run returns handler result on success", async () => {
    const a = new Agent({ name: "a", handler: async () => "ok" });
    expect(await a.run()).toBe("ok");
  });

  test("run returns error object when handler throws", async () => {
    const a = new Agent({ name: "b", handler: async () => { throw new Error("boom"); } });
    const res = await a.run();
    expect(res).toMatchObject({ error: true, message: "boom" });
  });

  test("role and goal default correctly", () => {
    const a = new Agent({ name: "c", handler: async () => {} });
    expect(a.role).toBe("agent");
    expect(a.goal).toBe("");
  });
});
