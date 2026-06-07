const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");
const config = require("../config");

const analyzer = new Agent({
  name: "Analyzer",
  role: "Fire Analyst",
  goal: "Summarize potential risks from hotspot data",
  handler: async (cleanedCsv) => {
    if (!cleanedCsv || typeof cleanedCsv !== "string") throw new Error("Analyzer requires non-empty cleaned CSV");
    if (!config.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const prompt = `Based on the cleaned hotspot data, analyze which regions are at highest risk and summarize patterns:\n\n${cleanedCsv}`;
    const res = await apiClient.postGemini(prompt, config.GEMINI_API_KEY);
    return res.candidates[0].content.parts[0].text;
  },
});

module.exports = analyzer;
