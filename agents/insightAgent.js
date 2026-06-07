const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");
const config = require("../config");

const insight = new Agent({
  name: "InsightAgent",
  role: "Disaster Advisor",
  goal: "Provide expert fire risk advice using LLaMA-4 Maverick via Together.ai",
  handler: async (analysis) => {
    if (!analysis || typeof analysis !== "string") throw new Error("InsightAgent requires a non-empty analysis string");
    if (!config.TOGETHER_API_KEY) throw new Error("TOGETHER_API_KEY is not configured");

    const prompt = `You're an expert in fire risk assessment. Based on this fire analysis report, provide:
1. What areas seem most at risk?
2. What could be the causes of these patterns?
3. Recommended actions for local authorities.

Fire Analysis Report:
${analysis}`;

    const res = await apiClient.postTogether(
      "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
      [{ role: "user", content: prompt }],
      config.TOGETHER_API_KEY
    );

    return res.choices[0].message.content;
  },
});

module.exports = insight;
