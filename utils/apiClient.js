const axios = require("axios");
const config = require("../config");
const { createLogger } = require("./logger");

const logger = createLogger("apiClient");

function buildHeaders(extra = {}) {
  return Object.assign({ "Content-Type": "application/json" }, extra);
}

/**
 * Retry with exponential backoff. Skips retry on 4xx (except 429).
 * @param {() => Promise<any>} fn
 * @param {number} maxRetries
 * @returns {Promise<any>}
 */
async function withRetry(fn, maxRetries = config.API_MAX_RETRIES) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err.response?.status;
      if (status && status < 500 && status !== 429) break;
      if (attempt < maxRetries) {
        const delay = Math.min(500 * 2 ** attempt, 8000);
        logger.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms`, { status });
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

async function postTogether(model, messages, apiKey) {
  const url = "https://api.together.xyz/v1/chat/completions";
  return withRetry(async () => {
    try {
      const res = await axios.post(
        url,
        { model, messages },
        {
          headers: buildHeaders({ Authorization: `Bearer ${apiKey}` }),
          timeout: config.API_TIMEOUT_MS,
        }
      );
      return res.data;
    } catch (err) {
      err.isApiError = true;
      logger.error("Together API error", { status: err.response?.status, message: err.message });
      throw err;
    }
  });
}

async function postGemini(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  return withRetry(async () => {
    try {
      const res = await axios.post(
        url,
        { contents: [{ role: "user", parts: [{ text: prompt }] }] },
        { timeout: config.API_TIMEOUT_MS }
      );
      return res.data;
    } catch (err) {
      err.isApiError = true;
      logger.error("Gemini API error", { status: err.response?.status, message: err.message });
      throw err;
    }
  });
}

async function getUrl(url, opts = {}) {
  return withRetry(async () => {
    try {
      const res = await axios.get(url, { timeout: config.API_TIMEOUT_MS, ...opts });
      return res.data;
    } catch (err) {
      err.isApiError = true;
      logger.error("GET request error", { url, message: err.message });
      throw err;
    }
  });
}

module.exports = { postTogether, postGemini, getUrl };
