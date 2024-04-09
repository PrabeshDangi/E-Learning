const logger = require("../utils/Logger");
const ApiError = require("../utils/ApiError");

//Logging the API request
function requestLogger(req, res, next) {
  logger.info(`${req.method} ${req.url}`);
  next();
}

//For error logging
function errorHandler(err, req, res, next) {
  logger.error(err.stack);

  if (err instanceof ApiError) {
    res
      .status(err.statusCode)
      .json(new ApiError(err.statusCode, {}, { message: err.message }));
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { requestLogger, errorHandler };
