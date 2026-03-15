require('dotenv').config();
const fetcher = require('./agents/fetcherAgent');
const cleaner = require('./agents/cleanerAgent');
const analyzer = require('./agents/analyzerAgent');
const patternExplainer = require('./agents/patternExplainerAgent');
const insight = require('./agents/insightAgent');
const notifier = require('./agents/notifierAgent');

async function main() {
  console.log('🔎 Hotspot Agent Crew starting...');

  const fetched = await fetcher.run();
  if (fetched && fetched.error) return console.error('Fetch failed', fetched);

  const cleaned = await cleaner.run(fetched);
  if (cleaned && cleaned.error) return console.error('Clean failed', cleaned);

  const analysis = await analyzer.run(cleaned);
  if (analysis && analysis.error) return console.error('Analyze failed', analysis);

  const pattern = await patternExplainer.run(analysis);
  const expert = await insight.run(analysis);
  const publicSummary = await notifier.run(analysis);

  console.log('\n--- Results ---');
  console.log('Analysis:', analysis);
  console.log('Pattern explanation:', pattern);
  console.log('Expert insight:', expert);
  console.log('Public summary:', publicSummary);

  console.log('✅ All done.');
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
