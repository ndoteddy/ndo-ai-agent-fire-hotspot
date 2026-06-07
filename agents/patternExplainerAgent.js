const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");
const config = require("../config");

const patternExplainer = new Agent({
  name: "PatternExplainer",
  role: "Technical Pattern Analyzer",
  goal: "Explain geospatial fire patterns using Qwen3 Coder via Together.ai",
  handler: async (analysis) => {
    if (!analysis || typeof analysis !== "string") throw new Error("PatternExplainer requires a non-empty analysis string");
    if (!config.TOGETHER_API_KEY) throw new Error("TOGETHER_API_KEY is not configured");

    const prompt = `You're a fire simulation expert. Based on the following hotspot analysis, explain:
- Any patterns in time/location
- Which environmental/geographic factors might influence these patterns
- If this could be modeled or predicted in code

Hotspot Analysis:
${analysis}`;

    const res = await apiClient.postTogether(
      "Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8",
      [{ role: "user", content: prompt }],
      config.TOGETHER_API_KEY
    );

    return res.choices[0].message.content;
  },
});

module.exports = patternExplainer;
