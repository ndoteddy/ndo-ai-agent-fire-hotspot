const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { runCrew, runCrewStreaming } = require("./runCrew");
const { errorHandler } = require("./middleware/errorHandler");
const { escapeHtml } = require("./utils/sanitize");
const { createLogger } = require("./utils/logger");
const config = require("./config");

const logger = createLogger("server");
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests, please try again later.", status: 429 } },
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// JSON API — cache-aware, returns full result as JSON
// ---------------------------------------------------------------------------
app.get("/api/run", apiLimiter, async (req, res, next) => {
  try {
    const forceRefresh = req.query.refresh === "true";
    const result = await runCrew({ forceRefresh });
    res.json({ ok: true, cached: !forceRefresh, data: result });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Server-Sent Events stream — always fresh run, emits per-stage progress
// ---------------------------------------------------------------------------
app.get("/stream", apiLimiter, async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const result = await runCrewStreaming((stage) => {
      send("progress", { stage });
    });
    send("done", { ok: true, data: result });
  } catch (err) {
    send("error", { ok: false, message: err.message });
  } finally {
    res.end();
  }
});

// ---------------------------------------------------------------------------
// HTML shell — loads instantly, then connects to /stream for live results
// ---------------------------------------------------------------------------
app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fire Hotspot AI Agents</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
    <style>
      body { padding: 2rem; background: #f8f9fa; font-family: 'Segoe UI', sans-serif; }
      h1 { color: #d9534f; margin-bottom: 1.5rem; }
      pre { background: #fff; padding: 1rem; border: 1px solid #dee2e6; border-radius: 0.5rem; white-space: pre-wrap; word-break: break-word; min-height: 3rem; }
      .stage-badge { font-size: 0.75rem; }
      .section-wrap { opacity: 0.4; transition: opacity 0.4s; }
      .section-wrap.ready { opacity: 1; }
      #status-bar { font-size: 0.9rem; }
      .spinner-border { width: 1rem; height: 1rem; border-width: 0.15em; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Fire Hotspot Monitoring</h1>

      <div id="status-bar" class="alert alert-info d-flex align-items-center gap-2 mb-4">
        <div class="spinner-border text-primary" role="status"></div>
        <span id="status-text">Connecting to agent pipeline...</span>
        <button id="refresh-btn" class="btn btn-sm btn-outline-secondary ms-auto d-none" onclick="startStream(true)">Refresh</button>
      </div>

      <div class="progress mb-4" style="height: 8px;">
        <div id="progress-bar" class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: 0%"></div>
      </div>

      <div class="section-wrap mb-4" id="sec-cleaned">
        <h2 class="text-primary">Cleaned CSV <span class="badge bg-secondary stage-badge">Gemini</span></h2>
        <pre id="out-cleaned">Waiting for data...</pre>
      </div>

      <div class="section-wrap mb-4" id="sec-analysis">
        <h2 class="text-info">Analysis <span class="badge bg-secondary stage-badge">Gemini</span></h2>
        <pre id="out-analysis">Waiting for data...</pre>
      </div>

      <div class="section-wrap mb-4" id="sec-summary">
        <h2 class="text-success">Public Summary <span class="badge bg-secondary stage-badge">Gemini</span></h2>
        <pre id="out-summary">Waiting for data...</pre>
      </div>

      <div class="section-wrap mb-4" id="sec-insights">
        <h2 class="text-warning">Expert Insights <span class="badge bg-secondary stage-badge">LLaMA 4</span></h2>
        <pre id="out-insights">Waiting for data...</pre>
      </div>

      <div class="section-wrap mb-4" id="sec-patterns">
        <h2 class="text-danger">Pattern Explanation <span class="badge bg-secondary stage-badge">Qwen3</span></h2>
        <pre id="out-patterns">Waiting for data...</pre>
      </div>
    </div>

    <script>
      const STAGE_LABELS = {
        fetching:      { pct: 10, msg: "Fetching NASA FIRMS satellite data..." },
        fetched:       { pct: 20, msg: "Data fetched. Cleaning CSV with Gemini..." },
        cleaning:      { pct: 25, msg: "Cleaning CSV with Gemini..." },
        cleaned:       { pct: 40, msg: "Cleaned. Running fire risk analysis..." },
        analyzing:     { pct: 45, msg: "Analyzing fire risk patterns..." },
        analyzed:      { pct: 60, msg: "Analysis done. Running parallel agents..." },
        parallel_start:{ pct: 65, msg: "Generating summary, insights & patterns in parallel..." },
        summarized:    { pct: 75, msg: "Summary ready..." },
        insights_done: { pct: 85, msg: "Expert insights ready..." },
        patterns_done: { pct: 95, msg: "Pattern explanation ready..." },
      };

      function esc(s) {
        return String(s || "")
          .replace(/&/g, "&amp;").replace(/</g, "&lt;")
          .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
      }

      function setProgress(pct, msg) {
        document.getElementById("progress-bar").style.width = pct + "%";
        document.getElementById("status-text").textContent = msg;
      }

      function markReady(secId, preId, text) {
        document.getElementById(preId).textContent = text;
        document.getElementById(secId).classList.add("ready");
      }

      let es;
      function startStream(forceRefresh) {
        if (es) es.close();
        const url = forceRefresh ? "/stream?refresh=true" : "/stream";
        document.getElementById("refresh-btn").classList.add("d-none");
        document.getElementById("status-bar").className = "alert alert-info d-flex align-items-center gap-2 mb-4";
        document.getElementById("status-bar").querySelector(".spinner-border").style.display = "";
        setProgress(5, "Connecting to agent pipeline...");

        es = new EventSource(url);

        es.addEventListener("progress", (e) => {
          const { stage } = JSON.parse(e.data);
          const info = STAGE_LABELS[stage];
          if (info) setProgress(info.pct, info.msg);
        });

        es.addEventListener("done", (e) => {
          const { data } = JSON.parse(e.data);
          markReady("sec-cleaned",  "out-cleaned",  data.cleaned);
          markReady("sec-analysis", "out-analysis", data.analysis);
          markReady("sec-summary",  "out-summary",  data.summary);
          markReady("sec-insights", "out-insights", data.insights);
          markReady("sec-patterns", "out-patterns", data.patternExplanation);

          setProgress(100, "All agents complete.");
          document.getElementById("status-bar").className = "alert alert-success d-flex align-items-center gap-2 mb-4";
          document.getElementById("status-bar").querySelector(".spinner-border").style.display = "none";
          document.getElementById("refresh-btn").classList.remove("d-none");
          es.close();
        });

        es.addEventListener("error", (e) => {
          let msg = "Agent pipeline error.";
          try { msg = JSON.parse(e.data).message; } catch (_) {}
          setProgress(0, "Error: " + msg);
          document.getElementById("status-bar").className = "alert alert-danger d-flex align-items-center gap-2 mb-4";
          document.getElementById("status-bar").querySelector(".spinner-border").style.display = "none";
          document.getElementById("refresh-btn").classList.remove("d-none");
          es.close();
        });
      }

      startStream(false);
    </script>
  </body>
</html>`);
});

app.use(errorHandler);

const server = app.listen(config.PORT, () => {
  logger.info("Agent system running", { url: `http://localhost:${config.PORT}` });
});

function shutdown(signal) {
  logger.info(`${signal} received - shutting down gracefully`);
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

module.exports = { app, server };
