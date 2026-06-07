# Fire Hotspot Monitoring AI Agent

A production-ready multi-agent AI system that monitors, analyzes, and explains real-time fire hotspot data from NASA FIRMS. Built with Node.js and powered by Gemini, LLaMA 4, and Qwen3 via Together.ai.

---

## Features

- Real-time fire detection data from NASA FIRMS (MODIS 24hr satellite CSV)
- Multi-agent LLM pipeline with three specialized models:
  - **Gemini 2.0 Flash** - data cleaning, risk analysis, public summaries
  - **LLaMA 4 Maverick 17B** - expert fire risk assessment and authority recommendations
  - **Qwen3 Coder 480B** - geospatial pattern recognition and modeling suggestions
- Parallel agent execution (insight, summary, and pattern agents run concurrently)
- Web interface with Bootstrap 5 and a `/health` endpoint
- CLI mode for terminal output
- Structured JSON logging with configurable log levels
- Retry logic with exponential backoff on all API calls
- Security hardened: `helmet` headers, rate limiting (10 req/min), HTML output escaping

---

## Architecture

```
index.js / server.js
       │
   runCrew.js              ← orchestrates the pipeline
       │
  ┌────▼────┐
  │ Fetcher │  ← NASA FIRMS CSV
  └────┬────┘
  ┌────▼────┐
  │ Cleaner │  ← Gemini
  └────┬────┘
  ┌────▼─────┐
  │ Analyzer │  ← Gemini
  └────┬─────┘
       │
  ┌────┴──────────────────┐
  │           │            │
Notifier  InsightAgent  PatternExplainer
(Gemini)  (LLaMA 4)     (Qwen3)
```

The first three stages run sequentially (each depends on the previous output). The final three run in parallel via `Promise.all`.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 18+ | Server and CLI |
| Web Framework | Express 5 | HTTP server |
| Validation | Zod | Environment config validation |
| Security | Helmet + express-rate-limit | HTTP hardening |
| LLM Gateway | Together.ai | LLaMA 4 and Qwen3 access |
| LLM (Cloud) | Gemini 2.0 Flash | Cleaning, analysis, summaries |
| HTTP Client | Axios | API requests with timeout + retry |
| Testing | Jest + Supertest | Unit tests with coverage thresholds |
| CI/CD | GitHub Actions | Node 18 & 20 matrix, audit, coverage |

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourusername/ndo-ai-agent-fire-hotspot.git
cd ndo-ai-agent-fire-hotspot
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then edit `.env` with your keys:

```env
GEMINI_API_KEY=your_gemini_api_key
TOGETHER_API_KEY=your_together_api_key
NASA_FIRMS_URL=https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/SouthEast_Asia/<your_map_key>/...
```

> Get a free NASA FIRMS map key at [firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov/api/area/)

### 3. Run

**CLI mode** - prints all agent output to console:
```bash
npm start
```

**Web server** - serves results at `http://localhost:3000`:
```bash
npm run server
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key |
| `TOGETHER_API_KEY` | Yes | - | Together.ai API key |
| `NASA_FIRMS_URL` | Yes | - | Full NASA FIRMS WFS CSV URL |
| `PORT` | No | `3000` | Web server port |
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `LOG_LEVEL` | No | `info` | `trace`, `debug`, `info`, `warn`, `error`, `silent` |
| `API_TIMEOUT_MS` | No | `30000` | Per-request timeout in milliseconds |
| `API_MAX_RETRIES` | No | `2` | Max retries on 5xx / 429 errors |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Run the full agent pipeline and return the HTML report |
| `GET` | `/health` | Health check - returns uptime and timestamp |

**Health check response:**
```json
{
  "status": "ok",
  "uptime": 42.3,
  "timestamp": "2026-06-07T12:00:00.000Z"
}
```

---

## Adding a Custom Agent

Create a file in `agents/` that follows the same pattern:

```js
const Agent = require("../core/agent");
const apiClient = require("../utils/apiClient");
const config = require("../config");

const myAgent = new Agent({
  name: "MyAgent",
  role: "My Role",
  goal: "Describe what this agent does",
  handler: async (input) => {
    if (!input) throw new Error("MyAgent requires input");
    const res = await apiClient.postGemini(`Your prompt:\n${input}`, config.GEMINI_API_KEY);
    return res.candidates[0].content.parts[0].text;
  },
});

module.exports = myAgent;
```

Then add it to the pipeline in `runCrew.js`.

---

## Testing

```bash
npm test                  # run tests with coverage
```

Coverage thresholds (enforced in CI):

| Metric | Threshold |
|---|---|
| Lines | 70% |
| Functions | 70% |
| Branches | 60% |
| Statements | 70% |

Current coverage: **~90% statements, ~82% functions, ~71% branches**.

---

## Project Structure

```
├── agents/                  # One file per LLM agent
│   ├── fetcherAgent.js
│   ├── cleanerAgent.js
│   ├── analyzerAgent.js
│   ├── insightAgent.js
│   ├── notifierAgent.js
│   └── patternExplainerAgent.js
├── config/
│   └── index.js             # Zod-validated environment config
├── core/
│   └── agent.js             # Base Agent class
├── middleware/
│   └── errorHandler.js      # Central Express error handler
├── utils/
│   ├── apiClient.js         # Axios wrapper with retry + timeout
│   ├── logger.js            # Structured JSON logger
│   └── sanitize.js          # HTML escaping utility
├── tests/                   # Jest test suite (10 suites, 37 tests)
├── .github/workflows/ci.yml # CI: Node 18 & 20, audit, coverage
├── index.js                 # CLI entry point
├── runCrew.js               # Agent pipeline orchestrator
└── server.js                # Express web server
```

---

## License

MIT - free to use and modify.

---

## Credits

Built by Hernando Ivan Teddy using NASA FIRMS, Together.ai, Gemini, LLaMA, and Qwen.
