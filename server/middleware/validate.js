/**
 * Validation Middleware
 * 
 * Uses Joi schemas to validate request data.
 * Provides clean error messages for invalid input.
 */

const { ApiError } = require('./errorHandler');

/**
 * Validate request body against a Joi schema
 * 
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.post('/users', validate(userSchema), createUser);
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return next(new ApiError(messages.join('. '), 400));
    }

    // Replace body with validated/sanitized data
    req.body = value;
    next();
  };
};

/**
 * Validate request query parameters against a Joi schema
 * 
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return next(new ApiError(messages.join('. '), 400));
    }

    req.query = value;
    next();
  };
};

/**
 * Validate request URL parameters against a Joi schema
 * 
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return next(new ApiError(messages.join('. '), 400));
    }

    req.params = value;
    next();
  };
};

/**
 * Sanitize user input to prevent XSS attacks
 * 
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Middleware to sanitize all string fields in request body
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  sanitizeInput,
  sanitizeBody,
};
