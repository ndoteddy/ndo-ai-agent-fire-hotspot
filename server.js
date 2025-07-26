const express = require("express");
const { runCrew } = require("./runCrew");
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  const result = await runCrew();
  res.send(`
<!DOCTYPE html>
<html>
  <head>
    <title>Fire Hotspot AI Agents</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
      body { padding: 2rem; background: #f8f9fa; font-family: 'Segoe UI', sans-serif; }
      h1 { color: #d9534f; margin-bottom: 2rem; }
      pre { background: #fff; padding: 1rem; border: 1px solid #ccc; border-radius: 0.5rem; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🔥 Fire Hotspot Monitoring (Mini-ADK)</h1>

      <div class="mb-4">
        <h2 class="text-primary">🧹 Cleaned CSV (Gemini)</h2>
        <pre>${result.cleaned}</pre>
      </div>

      <div class="mb-4">
        <h2 class="text-info">📈 Analysis (Gemini)</h2>
        <pre>${result.analysis}</pre>
      </div>

      <div class="mb-4">
        <h2 class="text-success">📝 Summary (Gemini)</h2>
        <pre>${result.summary}</pre>
      </div>

      <div class="mb-4">
        <h2 class="text-warning">🧠 Insights (LLaMA 4)</h2>
        <pre>${result.insights}</pre>
      </div>

      <div class="mb-4">
        <h2 class="text-danger">📊 Pattern Explanation (Qwen)</h2>
        <pre>${result.patternExplanation}</pre>
      </div>
    </div>
  </body>
</html>
`);

});

app.listen(port, () => {
  console.log(`✅ Agent system running: http://localhost:${port}`);
});
