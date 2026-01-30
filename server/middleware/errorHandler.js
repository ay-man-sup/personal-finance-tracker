/**
 * Global Error Handler Middleware
 * 
 * Centralized error handling for consistent error responses.
 * Catches all errors and formats them appropriately.
 */

/**
 * Custom Error Class for API errors
 * 
 * Use this to throw errors with specific status codes
 * @example throw new ApiError('User not found', 404);
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error Handler Middleware
 * 
 * Catches and formats all errors passed to next(error)
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} _next - Express next function (unused but required)
 */
const errorHandler = (err, req, res, _next) => {
  // Default error values
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  };

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }

  // Mongoose bad ObjectId error
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    error.statusCode = 400;
    error.message = 'Invalid ID format';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    error.message = messages.join('. ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Token expired. Please log in again.';
  }

  // Joi validation error
  if (err.isJoi) {
    error.statusCode = 400;
    error.message = err.details.map((d) => d.message).join('. ');
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    // Include stack trace in development mode only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Async Handler Wrapper
 * 
 * Wraps async route handlers to catch errors automatically
 * Eliminates the need for try-catch blocks in every route
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not Found Handler
 * 
 * Handles requests to undefined routes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFound = (req, res, next) => {
  const error = new ApiError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler,
  notFound,
};
