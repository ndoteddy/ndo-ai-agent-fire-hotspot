const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");

const patternExplainer = new Agent({
  name: "PatternExplainer",
  role: "Technical Pattern Analyzer",
  goal: "Explain technical/geospatial fire patterns using Qwen3 model",
  handler: async (analysis) => {
    const prompt = `\nYou're a fire simulation expert. Based on the following hotspot analysis, explain:\n- Any patterns in time/location\n- Which environmental/geographic factors might influence these patterns\n- If this could be modeled or predicted in code\n\nHotspot Analysis:\n${analysis}\n`;

    try {
      const res = await apiClient.postTogether(
        "Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8",
        [{ role: "user", content: prompt }],
        process.env.TOGETHER_API_KEY
      );

      return res.choices[0].message.content;
    } catch (err) {
      console.error("PatternExplainer error:", err.response?.data || err.message || err);
      return "⚠️ Failed to generate pattern explanation from Qwen model.";
    }
  }
});

module.exports = patternExplainer;
