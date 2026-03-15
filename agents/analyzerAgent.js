const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");

const analyzer = new Agent({
  name: "Analyzer",
  role: "Fire Analyst",
  goal: "Summarize potential risks from hotspot data",
  handler: async (cleanedCsv) => {
    const prompt = `Based on the cleaned hotspot data, analyze which regions are at highest risk and summarize patterns:\n\n${cleanedCsv}`;
    try {
      const res = await apiClient.postGemini(prompt, process.env.GEMINI_API_KEY);
      return res.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error("Analyzer error:", err.response?.data || err.message || err);
      return "⚠️ Analyzer failed to generate summary.";
    }
  }
});

module.exports = analyzer;
