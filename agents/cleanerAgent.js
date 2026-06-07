const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");
const config = require("../config");

const cleaner = new Agent({
  name: "Cleaner",
  role: "Data Cleaner",
  goal: "Filter and format hotspot CSV for analysis",
  handler: async (csvText) => {
    if (!csvText || typeof csvText !== "string") throw new Error("Cleaner requires non-empty CSV text");
    if (!config.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const prompt = `Clean and format this fire/hotspot CSV. Keep only valid, high-confidence entries:\n${csvText}`;
    const res = await apiClient.postGemini(prompt, config.GEMINI_API_KEY);
    return res.candidates[0].content.parts[0].text;
  },
});

module.exports = cleaner;
