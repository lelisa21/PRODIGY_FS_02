import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
  });

  // Development error response
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
  // Production error response
  else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    // Programming or unknown error: don't leak error details
    else {
      res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  }
};

export default errorHandler;
