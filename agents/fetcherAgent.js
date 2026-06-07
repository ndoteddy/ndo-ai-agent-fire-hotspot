const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");
const config = require("../config");

const fetcher = new Agent({
  name: "Fetcher",
  role: "Data Fetcher",
  goal: "Retrieve fire/hotspot data from NASA FIRMS",
  handler: async () => {
    const url = config.NASA_FIRMS_URL;
    if (!url) throw new Error("NASA_FIRMS_URL is not configured");
    return apiClient.getUrl(url);
  },
});

module.exports = fetcher;
