require("dotenv").config();
const { z } = require("zod");

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "silent"]).default("info"),
  GEMINI_API_KEY: z.string().optional(),
  TOGETHER_API_KEY: z.string().optional(),
  NASA_FIRMS_URL: z.string().url().optional(),
  API_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  API_MAX_RETRIES: z.coerce.number().int().nonnegative().default(2),
  CACHE_TTL_MINUTES: z.coerce.number().int().positive().default(30),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues
    .map((i) => `  [${i.path.join(".")}] ${i.message}`)
    .join("\n");
  console.error(`\n❌ Configuration error - check your .env file:\n${issues}\n`);
  if (process.env.NODE_ENV !== "test") process.exit(1);
}

const cfg = result.success ? result.data : {
  NODE_ENV: "test",
  PORT: 3000,
  LOG_LEVEL: "silent",
  API_TIMEOUT_MS: 30000,
  API_MAX_RETRIES: 2,
  CACHE_TTL_MINUTES: 30,
};

module.exports = { ...cfg, CACHE_TTL_MS: cfg.CACHE_TTL_MINUTES * 60 * 1000 };
