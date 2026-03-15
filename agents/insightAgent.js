const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");

const insight = new Agent({
  name: "InsightAgent",
  role: "Disaster Advisor",
  goal: "Provide expert advice based on fire trend analysis using LLaMA-4 Maverick from Together.ai",
  handler: async (analysis) => {
    const prompt = `\nYou're an expert in fire risk assessment. Based on this fire analysis report, provide:\n1. What areas seem most at risk?\n2. What could be the causes of these patterns?\n3. Recommended actions for local authorities.\n\nFire Analysis Report:\n${analysis}\n`;

    try {
      const res = await apiClient.postTogether(
        "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        [{ role: "user", content: prompt }],
        process.env.TOGETHER_API_KEY
      );

      return res.choices[0].message.content;
    } catch (err) {
      console.error("Insight error:", err.response?.data || err.message || err);
      return "⚠️ Failed to get insight from LLaMA-4 model.";
    }
  }
});

module.exports = insight;
