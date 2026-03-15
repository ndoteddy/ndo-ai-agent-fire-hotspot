const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");

const cleaner = new Agent({
  name: "Cleaner",
  role: "Data Cleaner",
  goal: "Filter and format hotspot CSV for analysis",
  handler: async (csvText) => {
    const prompt = `Clean and format this fire/hotspot CSV. Keep only valid, high-confidence entries:\n${csvText}`;
    try {
      const res = await apiClient.postGemini(prompt, process.env.GEMINI_API_KEY);
      return res.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error("Cleaner error:", err.response?.data || err.message || err);
      return "⚠️ Cleaner failed to sanitize CSV.";
    }
  }
});

module.exports = cleaner;
