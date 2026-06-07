const config = require("./config");
const { createLogger } = require("./utils/logger");
const { runCrew } = require("./runCrew");

const logger = createLogger("cli");

async function main() {
  logger.info("Hotspot Agent Crew starting", { env: config.NODE_ENV });

  const result = await runCrew();

  console.log("\n--- Results ---");
  console.log("Cleaned CSV:\n", result.cleaned);
  console.log("\nAnalysis:\n", result.analysis);
  console.log("\nPublic Summary:\n", result.summary);
  console.log("\nExpert Insight:\n", result.insights);
  console.log("\nPattern Explanation:\n", result.patternExplanation);

  logger.info("All done");
}

if (require.main === module) {
  main().catch((err) => {
    const log = createLogger("cli");
    log.error("Fatal error", { error: err.message });
    process.exit(1);
  });
}
