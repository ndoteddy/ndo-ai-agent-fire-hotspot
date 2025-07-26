class Agent {
  constructor({ name, role, goal, handler }) {
    this.name = name;
    this.role = role;
    this.goal = goal;
    this.handler = handler;
  }

  async run(input) {
    console.log(`🧠 [${this.name}] Task: ${this.goal}`);
    return await this.handler(input);
  }
}

module.exports = Agent;
