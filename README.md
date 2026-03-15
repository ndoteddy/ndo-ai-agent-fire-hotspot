
# 🔥 Fire Hotspot Monitoring AI Agent

A lightweight multi-agent AI application that monitors, analyzes, and explains fire hotspot data in Southeast Asia using real-time NASA FIRMS data. Built using Node.js and integrated with multiple open-source LLMs via Together.ai — including Gemini, LLaMA 4, and Qwen.

---

## 🚀 Features

- 🌐 Fetch real-time fire hotspot data from NASA FIRMS (MODIS 24hr CSV)
- 🤖 Multi-agent LLM system:
  - **Gemini**: Cleans CSV, provides summaries and analysis
  - **LLaMA 4 Maverick**: Gives expert insights
  - **Qwen 3 Coder**: Explains fire patterns
- 📊 Beautiful web interface with Bootstrap
- ⏱️ Auto-run agents periodically using `node-cron`
- 🧩 Modular Mini-ADK structure — easily extendable

---

## 🧱 Tech Stack

| Layer            | Tool / Model                                       | Purpose                                               |
|------------------|----------------------------------------------------|--------------------------------------------------------|
| **Backend**      | Node.js + Express                                  | REST API and logic orchestration                      |
| **UI**           | Bootstrap 5                                        | Clean and responsive interface                        |
| **Scheduling**   | node-cron                                          | Automate agent execution every 30 minutes             |
| **LLM Gateway**  | Together.ai API                                    | Unified access to multiple open-source models         |
| **Agent 1**      | **Gemini**                                         | Data cleaning, CSV parsing, fire summary              |
| **Agent 2**      | **LLaMA 4 Maverick 17B Instruct**                  | Expert-level fire risk insights                       |
| **Agent 3**      | **Qwen3-Coder 480B Instruct**                      | Pattern recognition and explanation                   |

---

## 🌍 Live Fire Data Source

The app uses NASA FIRMS' real-time fire detection data via WFS in CSV format:

```

[https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/SouthEast\_Asia/map\_key/?SERVICE=WFS\&REQUEST=GetFeature\&VERSION=2.0.0\&TYPENAME=ms\:fires\_modis\_24hrs\&STARTINDEX=0\&COUNT=1000\&SRSNAME=urn\:ogc\:def\:crs\:EPSG::4326\&BBOX=-90,-180,90,180,urn\:ogc\:def\:crs\:EPSG::4326\&outputformat=csv](https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/SouthEast_Asia/map_key/?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=ms:fires_modis_24hrs&STARTINDEX=0&COUNT=1000&SRSNAME=urn:ogc:def:crs:EPSG::4326&BBOX=-90,-180,90,180,urn:ogc:def:crs:EPSG::4326&outputformat=csv)

````

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/fire-hotspot-agents.git
cd fire-hotspot-agents
npm install
````

---

## 🔑 Setup

1. Create a `.env` file with the following:

   ```
   TOGETHER_API_KEY=your_together_api_key
   NASA_FIRMS_URL=https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/SouthEast_Asia/map_key/?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=ms:fires_modis_24hrs&STARTINDEX=0&COUNT=1000&SRSNAME=urn:ogc:def:crs:EPSG::4326&BBOX=-90,-180,90,180,urn:ogc:def:crs:EPSG::4326&outputformat=csv
   ```

2. Create a `.env` file (or copy `.env.example`) and fill keys, then start the app:

   ```bash
   cp .env.example .env
   npm install
   npm start
   ```

3. The repository includes only the backend agent runner by default — outputs are logged to the console.

---

## 🧠 Add Your Own Agents

The system supports easily adding more agents in `/agents/`. Each agent exports a function that gets passed the cleaned CSV data.

```js
module.exports = async function run(data) {
  // Process CSV data and return result
};
```

---

## 🧾 License

MIT — free to use and modify.

---

## 🙌 Credits

Built by Hernando Ivan Teddy using:

* NASA FIRMS
* Together.ai API
* Open-source LLMs: Gemini, LLaMA, Qwen




