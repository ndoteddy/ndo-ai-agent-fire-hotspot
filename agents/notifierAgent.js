const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");

const notifier = new Agent({
  name: "Notifier",
  role: "Summary Generator",
  goal: "Create a public alert summary",
  handler: async (analysis) => {
    const prompt = `Turn the following analysis into a short, public-friendly fire risk warning:\n\n${analysis}`;
    try {
      const res = await apiClient.postGemini(prompt, process.env.GEMINI_API_KEY);
      return res.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error("Notifier error:", err.response?.data || err.message || err);
      return "⚠️ Notifier failed to create public summary.";
    }
  }
});

module.exports = notifier;
