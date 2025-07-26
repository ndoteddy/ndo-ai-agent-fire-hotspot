const Agent = require("../core/agent");
const axios = require("axios");

const notifier = new Agent({
  name: "Notifier",
  role: "Summary Generator",
  goal: "Create a public alert summary",
  handler: async (analysis) => {
    const prompt = `Turn the following analysis into a short, public-friendly fire risk warning:\n\n${analysis}`;
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }
    );
    return res.data.candidates[0].content.parts[0].text;
  }
});

module.exports = notifier;
