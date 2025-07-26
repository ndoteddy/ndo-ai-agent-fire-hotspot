const Agent = require("../core/agent");
const axios = require("axios");

const insight = new Agent({
  name: "InsightAgent",
  role: "Disaster Advisor",
  goal: "Provide expert advice based on fire trend analysis using LLaMA-4 Maverick from Together.ai",
  handler: async (analysis) => {
    const prompt = `
You're an expert in fire risk assessment. Based on this fire analysis report, provide:
1. What areas seem most at risk?
2. What could be the causes of these patterns?
3. Recommended actions for local authorities.

Fire Analysis Report:
${analysis}
`;

    try {
      const response = await axios.post(
        "https://api.together.xyz/v1/chat/completions",
        {
          model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
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
      console.error("Error from Together API:", err.response?.data || err.message);
      return "⚠️ Failed to get insight from LLaMA-4 model.";
    }
  }
});

module.exports = insight;
