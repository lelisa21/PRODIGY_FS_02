// src/middlewares/requestLogger.js
import logger from '../utils/logger.js';

/**
 * Log all HTTP requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?._id
    });
  });

  next();
};

export default requestLogger;
