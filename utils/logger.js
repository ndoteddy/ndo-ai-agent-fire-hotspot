const config = require("../config");

const LEVELS = { trace: 10, debug: 20, info: 30, warn: 40, error: 50, silent: Infinity };

function createLogger(name) {
  const minLevel = LEVELS[config.LOG_LEVEL] ?? LEVELS.info;

  function emit(level, msg, extra) {
    if (LEVELS[level] < minLevel) return;
    const entry = {
      time: new Date().toISOString(),
      level,
      name,
      msg,
      ...(extra && typeof extra === "object" ? extra : extra !== undefined ? { detail: extra } : {}),
    };
    (level === "error" ? console.error : console.log)(JSON.stringify(entry));
  }

  return {
    trace: (msg, extra) => emit("trace", msg, extra),
    debug: (msg, extra) => emit("debug", msg, extra),
    info:  (msg, extra) => emit("info",  msg, extra),
    warn:  (msg, extra) => emit("warn",  msg, extra),
    error: (msg, extra) => emit("error", msg, extra),
    child: (childName) => createLogger(`${name}:${childName}`),
  };
}

module.exports = { createLogger };
