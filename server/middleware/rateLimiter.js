/**
 * Rate Limiter Middleware
 * 
 * Prevents brute-force attacks by limiting request rates.
 * Different limits for different route types.
 */

const rateLimit = require('express-rate-limit');

// Skip rate limiting in test and development environments
const shouldSkipRateLimiting = () => 
  process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

/**
 * Standard API rate limiter
 * Applies to most API routes
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit headers
  // Skip rate limiting in test/development environment
  skip: shouldSkipRateLimiting,
});

/**
 * Strict rate limiter for auth routes
 * More restrictive to prevent brute-force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimiting,
});

/**
 * Very strict limiter for sensitive operations
 * Like password reset, account creation
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 attempts per hour
  message: {
    success: false,
    message: 'Too many attempts. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimiting,
});

/**
 * Custom rate limiter factory
 * Creates a rate limiter with custom settings
 * 
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.message - Error message
 * @returns {Function} Rate limiter middleware
 */
const createLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: shouldSkipRateLimiting,
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  strictLimiter,
  createLimiter,
};
