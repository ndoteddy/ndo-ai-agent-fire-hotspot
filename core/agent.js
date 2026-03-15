class Agent {
  constructor({ name, role, goal, handler }) {
    if (!name || typeof name !== "string") throw new Error("Agent requires a valid name");
    if (!handler || typeof handler !== "function") throw new Error("Agent requires a handler function");

    this.name = name;
    this.role = role || "agent";
    this.goal = goal || "";
    this.handler = handler;
  }

  async run(input) {
    console.info(`🧠 [${this.name}] Starting — ${this.goal}`);
    try {
      const result = await this.handler(input);
      console.info(`✅ [${this.name}] Completed`);
      return result;
    } catch (err) {
      console.error(`❌ [${this.name}] Error:`, err.message || err);
      return { error: true, message: err.message || String(err) };
    }
  }
}

module.exports = Agent;
