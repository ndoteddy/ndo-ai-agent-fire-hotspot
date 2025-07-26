const Agent = require("../core/agent");
const axios = require("axios");

const patternExplainer = new Agent({
  name: "PatternExplainer",
  role: "Technical Pattern Analyzer",
  goal: "Explain technical/geospatial fire patterns using Qwen3 model",
  handler: async (analysis) => {
    const prompt = `
You're a fire simulation expert. Based on the following hotspot analysis, explain:
- Any patterns in time/location
- Which environmental/geographic factors might influence these patterns
- If this could be modeled or predicted in code

Hotspot Analysis:
${analysis}
`;

    try {
      const response = await axios.post(
        "https://api.together.xyz/v1/chat/completions",
        {
          model: "Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (err) {
      console.error("❌ Qwen Agent Error:", err.response?.data || err.message);
      return "⚠️ Failed to generate pattern explanation from Qwen model.";
    }
  }
});

module.exports = patternExplainer;
