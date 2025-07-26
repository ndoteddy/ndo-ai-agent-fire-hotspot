const Agent = require("../core/agent");
const axios = require("axios");

const analyzer = new Agent({
  name: "Analyzer",
  role: "Fire Analyst",
  goal: "Summarize potential risks from hotspot data",
  handler: async (cleanedCsv) => {
    const prompt = `Based on the cleaned hotspot data, analyze which regions are at highest risk and summarize patterns:\n\n${cleanedCsv}`;
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }
    );
    return res.data.candidates[0].content.parts[0].text;
  }
});

module.exports = analyzer;
