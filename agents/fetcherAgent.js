const Agent = require("../core/agent");
const axios = require("axios");

const fetcher = new Agent({
  name: "Fetcher",
  role: "Data Fetcher",
  goal: "Retrieve fire/hotspot data from NASA",
  handler: async () => {
    const url = process.env.NASA_FIRMS_URL;
    const response = await axios.get(url);
    return response.data;
  }
});

module.exports = fetcher;
