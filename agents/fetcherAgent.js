const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");

const fetcher = new Agent({
  name: "Fetcher",
  role: "Data Fetcher",
  goal: "Retrieve fire/hotspot data from NASA",
  handler: async () => {
    const url = process.env.NASA_FIRMS_URL;
    try {
      const data = await apiClient.getUrl(url);
      return data;
    } catch (err) {
      console.error("Fetcher error:", err.response?.data || err.message || err);
      return "⚠️ Failed to fetch hotspot data.";
    }
  }
});

module.exports = fetcher;
