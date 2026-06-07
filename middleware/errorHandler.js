const { createLogger } = require("../utils/logger");

const logger = createLogger("errorHandler");

/**
 * Express 5-compatible error-handling middleware.
 * @param {Error} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  logger.error("Unhandled request error", {
    method: req.method,
    path: req.path,
    status,
    error: err.message,
  });

  res.status(status).json({
    error: {
      message: status < 500 ? err.message : "Internal server error",
      status,
    },
  });
}

module.exports = { errorHandler };
