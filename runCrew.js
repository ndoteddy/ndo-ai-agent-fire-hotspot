const { createLogger } = require("./utils/logger");
const fetcher = require("./agents/fetcherAgent");
const cleaner = require("./agents/cleanerAgent");
const analyzer = require("./agents/analyzerAgent");
const notifier = require("./agents/notifierAgent");
const insightAgent = require("./agents/insightAgent");
const patternExplainer = require("./agents/patternExplainerAgent");

const logger = createLogger("runCrew");

const MAX_CSV_LINES = 100;

/**
 * Runs the full agent pipeline and returns the collated results.
 * The insight, summary, and pattern agents run in parallel after analysis.
 * @returns {Promise<{cleaned: string, analysis: string, summary: string, insights: string, patternExplanation: string}>}
 */
async function runCrew() {
  logger.info("Crew pipeline starting");

  const rawData = await fetcher.run();
  if (rawData?.error) throw new Error(`Fetcher failed: ${rawData.message}`);

  const sliced = String(rawData).split("\n").slice(0, MAX_CSV_LINES).join("\n");

  const cleaned = await cleaner.run(sliced);
  if (cleaned?.error) throw new Error(`Cleaner failed: ${cleaned.message}`);

  const analysis = await analyzer.run(cleaned);
  if (analysis?.error) throw new Error(`Analyzer failed: ${analysis.message}`);

  const [summary, insights, patternExplanation] = await Promise.all([
    notifier.run(analysis),
    insightAgent.run(analysis),
    patternExplainer.run(analysis),
  ]);

  logger.info("Crew pipeline complete");
  return { cleaned, analysis, summary, insights, patternExplanation };
}

module.exports = { runCrew };
