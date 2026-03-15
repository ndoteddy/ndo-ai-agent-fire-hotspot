const axios = require("axios");

function buildHeaders(extra = {}) {
  return Object.assign({ "Content-Type": "application/json" }, extra);
}

async function postTogether(model, messages, apiKey) {
  const url = "https://api.together.xyz/v1/chat/completions";
  try {
    const res = await axios.post(
      url,
      { model, messages },
      { headers: buildHeaders({ Authorization: `Bearer ${apiKey}` }) }
    );
    return res.data;
  } catch (err) {
    err.isApiError = true;
    throw err;
  }
}

async function postGemini(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  try {
    const res = await axios.post(url, { contents: [{ role: "user", parts: [{ text: prompt }] }] });
    return res.data;
  } catch (err) {
    err.isApiError = true;
    throw err;
  }
}

async function getUrl(url, opts = {}) {
  try {
    const res = await axios.get(url, opts);
    return res.data;
  } catch (err) {
    err.isApiError = true;
    throw err;
  }
}

module.exports = {
  postTogether,
  postGemini,
  getUrl
};
