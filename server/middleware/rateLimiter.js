const rateLimit = require('express-rate-limit');

const shouldSkipRateLimiting = () => 
  process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimiting,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimiting,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many attempts. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimiting,
});

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
