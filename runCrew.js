const { createLogger } = require("./utils/logger");
const cache = require("./utils/cache");
const config = require("./config");
const fetcher = require("./agents/fetcherAgent");
const cleaner = require("./agents/cleanerAgent");
const analyzer = require("./agents/analyzerAgent");
const notifier = require("./agents/notifierAgent");
const insightAgent = require("./agents/insightAgent");
const patternExplainer = require("./agents/patternExplainerAgent");

const logger = createLogger("runCrew");

const CACHE_KEY = "crew_result";
const MAX_CSV_LINES = 100;

/**
 * Runs the full agent pipeline and returns the collated results.
 * Results are cached in memory for config.CACHE_TTL_MS milliseconds.
 * @param {{ forceRefresh?: boolean }} [opts]
 * @returns {Promise<{cleaned: string, analysis: string, summary: string, insights: string, patternExplanation: string}>}
 */
async function runCrew({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      logger.info("Returning cached crew result", { ttlMinutes: config.CACHE_TTL_MINUTES });
      return cached;
    }
  }

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

  const result = { cleaned, analysis, summary, insights, patternExplanation };
  cache.set(CACHE_KEY, result, config.CACHE_TTL_MS);
  logger.info("Crew pipeline complete - result cached", { ttlMinutes: config.CACHE_TTL_MINUTES });

  return result;
}

/**
 * Streams agent progress step by step, calling onProgress after each stage.
 * Does NOT use the cache (streaming is always a fresh run).
 * @param {(stage: string, data?: any) => void} onProgress
 * @returns {Promise<{cleaned: string, analysis: string, summary: string, insights: string, patternExplanation: string}>}
 */
async function runCrewStreaming(onProgress) {
  logger.info("Crew streaming pipeline starting");

  const emit = (stage, data) => { try { onProgress(stage, data); } catch (_) {} };

  emit("fetching");
  const rawData = await fetcher.run();
  if (rawData?.error) throw new Error(`Fetcher failed: ${rawData.message}`);
  emit("fetched");

  emit("cleaning");
  const sliced = String(rawData).split("\n").slice(0, MAX_CSV_LINES).join("\n");
  const cleaned = await cleaner.run(sliced);
  if (cleaned?.error) throw new Error(`Cleaner failed: ${cleaned.message}`);
  emit("cleaned");

  emit("analyzing");
  const analysis = await analyzer.run(cleaned);
  if (analysis?.error) throw new Error(`Analyzer failed: ${analysis.message}`);
  emit("analyzed");

  emit("parallel_start");
  const [summary, insights, patternExplanation] = await Promise.all([
    notifier.run(analysis).then((r) => { emit("summarized"); return r; }),
    insightAgent.run(analysis).then((r) => { emit("insights_done"); return r; }),
    patternExplainer.run(analysis).then((r) => { emit("patterns_done"); return r; }),
  ]);

  const result = { cleaned, analysis, summary, insights, patternExplanation };
  cache.set(CACHE_KEY, result, config.CACHE_TTL_MS);
  logger.info("Crew streaming pipeline complete - result cached");

  return result;
}

module.exports = { runCrew, runCrewStreaming };
