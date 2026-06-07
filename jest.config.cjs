module.exports = {
  testEnvironment: "node",
  verbose: true,
  roots: ["<rootDir>/tests"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "agents/**/*.js",
    "core/**/*.js",
    "utils/**/*.js",
    "middleware/**/*.js",
    "config/**/*.js",
    "runCrew.js",
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
      branches: 60,
      statements: 70,
    },
  },
};
