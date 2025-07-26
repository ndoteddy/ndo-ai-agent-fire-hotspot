require("dotenv").config();
const fetcher = require("./agents/fetcherAgent");
const cleaner = require("./agents/cleanerAgent");
const analyzer = require("./agents/analyzerAgent");
const notifier = require("./agents/notifierAgent");
const insightAgent = require("./agents/insightAgent");
const patternExplainer = require("./agents/patternExplainerAgent");

async function runCrew() {
  const rawData = await fetcher.run();
  const sliced = rawData.split("\n").slice(0, 100).join("\n");
  const cleaned = await cleaner.run(sliced);
  const analysis = await analyzer.run(cleaned);
  const summary = await notifier.run(analysis);
  const insights = await insightAgent.run(analysis);
  const patternExplanation = await patternExplainer.run(analysis);


  return {
    cleaned,
    analysis,
    summary,
    insights,
    patternExplanation
  };
}

module.exports = { runCrew };
