/**
 * Error Handling Middleware
 * Centralizes error handling for the Express application
 */

const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, {
    requestId: req.requestId,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Default error status and message
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  // Custom error handling based on error type
  if (err.name === 'SequelizeValidationError' || err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'A resource with that identifier already exists';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = err.message || 'Resource not found';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = err.message || 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = err.message || 'Forbidden';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    // Include error details in development mode
    ...(process.env.NODE_ENV === 'development' && {
      error: {
        name: err.name,
        stack: err.stack
      }
    })
  });
};

/**
 * Not Found middleware - handles 404 errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFound = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`, {
    requestId: req.requestId,
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`
  });
};

module.exports = {
  errorHandler,
  notFound
};
