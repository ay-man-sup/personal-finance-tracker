const { protect, optionalAuth } = require('./auth');
const { ApiError, errorHandler, asyncHandler, notFound } = require('./errorHandler');
const { apiLimiter, authLimiter, strictLimiter, createLimiter } = require('./rateLimiter');
const { validate, validateQuery, validateParams, sanitizeBody } = require('./validate');

module.exports = {
  // Authentication
  protect,
  optionalAuth,
  
  // Error handling
  ApiError,
  errorHandler,
  asyncHandler,
  notFound,
  
  // Rate limiting
  apiLimiter,
  authLimiter,
  strictLimiter,
  createLimiter,
  
  // Validation
  validate,
  validateQuery,
  validateParams,
  sanitizeBody,
};
