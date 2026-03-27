import AppError from '../utils/appError.js';

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
};
