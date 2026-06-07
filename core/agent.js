const { createLogger } = require("../utils/logger");

/**
 * @typedef {Object} AgentOptions
 * @property {string} name
 * @property {string} [role]
 * @property {string} [goal]
 * @property {(input: any) => Promise<any>} handler
 */

class Agent {
  /** @param {AgentOptions} opts */
  constructor({ name, role, goal, handler }) {
    if (!name || typeof name !== "string") throw new Error("Agent requires a valid name");
    if (!handler || typeof handler !== "function") throw new Error("Agent requires a handler function");

    this.name = name;
    this.role = role || "agent";
    this.goal = goal || "";
    this.handler = handler;
    this.logger = createLogger(`agent:${name}`);
  }

  /**
   * Executes the agent handler with the given input.
   * @param {any} input
   * @returns {Promise<any>}
   */
  async run(input) {
    this.logger.info(`Starting: ${this.goal}`);
    try {
      const result = await this.handler(input);
      this.logger.info("Completed successfully");
      return result;
    } catch (err) {
      this.logger.error("Handler threw an unhandled error", { error: err.message });
      return { error: true, message: err.message || String(err) };
    }
  }
}

module.exports = Agent;
