const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");
const config = require("../config");

const notifier = new Agent({
  name: "Notifier",
  role: "Summary Generator",
  goal: "Create a public-friendly fire risk alert summary",
  handler: async (analysis) => {
    if (!analysis || typeof analysis !== "string") throw new Error("Notifier requires a non-empty analysis string");
    if (!config.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const prompt = `Turn the following analysis into a short, public-friendly fire risk warning:\n\n${analysis}`;
    const res = await apiClient.postGemini(prompt, config.GEMINI_API_KEY);
    return res.candidates[0].content.parts[0].text;
  },
});

module.exports = notifier;
