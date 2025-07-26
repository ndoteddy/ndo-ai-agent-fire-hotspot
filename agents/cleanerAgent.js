const Agent = require("../core/agent");
const axios = require("axios");

const cleaner = new Agent({
  name: "Cleaner",
  role: "Data Cleaner",
  goal: "Filter and format hotspot CSV for analysis",
  handler: async (csvText) => {
    const prompt = `Clean and format this fire/hotspot CSV. Keep only valid, high-confidence entries:\n${csvText}`;
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }
    );
    return res.data.candidates[0].content.parts[0].text;
  }
});

module.exports = cleaner;
