const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { runCrew } = require("./runCrew");
const { errorHandler } = require("./middleware/errorHandler");
const { escapeHtml } = require("./utils/sanitize");
const { createLogger } = require("./utils/logger");
const config = require("./config");

const logger = createLogger("server");
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests, please try again later.", status: 429 } },
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get("/", limiter, async (req, res, next) => {
  try {
    const result = await runCrew();
    res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fire Hotspot AI Agents</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
    <style>
      body { padding: 2rem; background: #f8f9fa; font-family: 'Segoe UI', sans-serif; }
      h1 { color: #d9534f; margin-bottom: 2rem; }
      pre { background: #fff; padding: 1rem; border: 1px solid #ccc; border-radius: 0.5rem; white-space: pre-wrap; word-break: break-word; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🔥 Fire Hotspot Monitoring</h1>

      <div class="mb-4">
        <h2 class="text-primary">🧹 Cleaned CSV (Gemini)</h2>
        <pre>${escapeHtml(result.cleaned)}</pre>
      </div>

      <div class="mb-4">
        <h2 class="text-info">📈 Analysis (Gemini)</h2>
        <pre>${escapeHtml(result.analysis)}</pre>
      </div>

      <div class="mb-4">
        <h2 class="text-success">📝 Summary (Gemini)</h2>
        <pre>${escapeHtml(result.summary)}</pre>
      </div>

      <div class="mb-4">
        <h2 class="text-warning">🧠 Insights (LLaMA 4)</h2>
        <pre>${escapeHtml(result.insights)}</pre>
      </div>

      <div class="mb-4">
        <h2 class="text-danger">📊 Pattern Explanation (Qwen)</h2>
        <pre>${escapeHtml(result.patternExplanation)}</pre>
      </div>
    </div>
  </body>
</html>`);
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

const server = app.listen(config.PORT, () => {
  logger.info(`Agent system running`, { url: `http://localhost:${config.PORT}` });
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
