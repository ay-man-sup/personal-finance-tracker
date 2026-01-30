/**
 * Joi Validation Schemas
 * 
 * Defines validation schemas for all API endpoints.
 * Uses Joi for robust input validation and sanitization.
 */

const Joi = require('joi');

/**
 * Password validation requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * User Registration Schema
 */
const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required',
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
      'any.required': 'Password is required',
    }),

  currency: Joi.string()
    .valid('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY')
    .default('USD'),
});

/**
 * User Login Schema
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

/**
 * Transaction Schema
 */
const transactionSchema = Joi.object({
  type: Joi.string()
    .valid('income', 'expense')
    .required()
    .messages({
      'any.only': 'Type must be either income or expense',
      'any.required': 'Transaction type is required',
    }),

  category: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Category is required',
      'string.max': 'Category cannot exceed 50 characters',
      'any.required': 'Category is required',
    }),

  amount: Joi.number()
    .positive()
    .precision(2)
    .max(999999999.99)
    .required()
    .messages({
      'number.positive': 'Amount must be a positive number',
      'number.max': 'Amount exceeds maximum limit',
      'any.required': 'Amount is required',
    }),

  date: Joi.date()
    .max('now')
    .default(Date.now)
    .messages({
      'date.max': 'Date cannot be in the future',
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .default('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),

  tags: Joi.array()
    .items(Joi.string().trim().lowercase().max(30))
    .max(10)
    .default([]),

  isRecurring: Joi.boolean()
    .default(false),

  recurringFrequency: Joi.when('isRecurring', {
    is: true,
    then: Joi.string()
      .valid('daily', 'weekly', 'monthly', 'yearly')
      .required(),
    otherwise: Joi.valid(null).default(null),
  }),
});

/**
 * Transaction Update Schema (allows partial updates)
 */
const transactionUpdateSchema = Joi.object({
  type: Joi.string()
    .valid('income', 'expense'),

  category: Joi.string()
    .trim()
    .min(1)
    .max(50),

  amount: Joi.number()
    .positive()
    .precision(2)
    .max(999999999.99),

  date: Joi.date()
    .max('now'),

  description: Joi.string()
    .trim()
    .max(500)
    .allow(''),

  tags: Joi.array()
    .items(Joi.string().trim().lowercase().max(30))
    .max(10),

  isRecurring: Joi.boolean(),

  recurringFrequency: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'yearly', null),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Budget Schema
 */
const budgetSchema = Joi.object({
  category: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Category is required',
      'string.max': 'Category cannot exceed 50 characters',
      'any.required': 'Category is required',
    }),

  limit: Joi.number()
    .positive()
    .precision(2)
    .max(999999999.99)
    .required()
    .messages({
      'number.positive': 'Budget limit must be a positive number',
      'number.max': 'Budget limit exceeds maximum',
      'any.required': 'Budget limit is required',
    }),

  period: Joi.string()
    .valid('weekly', 'monthly', 'yearly')
    .default('monthly'),

  alertThreshold: Joi.number()
    .min(0)
    .max(100)
    .default(80)
    .messages({
      'number.min': 'Alert threshold must be at least 0',
      'number.max': 'Alert threshold cannot exceed 100',
    }),

  alertsEnabled: Joi.boolean()
    .default(true),

  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .default('#3B82F6')
    .messages({
      'string.pattern.base': 'Please provide a valid hex color (e.g., #3B82F6)',
    }),

  notes: Joi.string()
    .trim()
    .max(200)
    .allow('')
    .default(''),
});

/**
 * Budget Update Schema
 */
const budgetUpdateSchema = Joi.object({
  limit: Joi.number()
    .positive()
    .precision(2)
    .max(999999999.99),

  period: Joi.string()
    .valid('weekly', 'monthly', 'yearly'),

  alertThreshold: Joi.number()
    .min(0)
    .max(100),

  alertsEnabled: Joi.boolean(),

  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/),

  notes: Joi.string()
    .trim()
    .max(200)
    .allow(''),

  isActive: Joi.boolean(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Query Parameters Schema for Transactions
 */
const transactionQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),

  type: Joi.string()
    .valid('income', 'expense'),

  category: Joi.string()
    .trim(),

  startDate: Joi.date(),

  endDate: Joi.date()
    .when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')),
    }),

  sort: Joi.string()
    .valid('date', '-date', 'amount', '-amount', 'category', '-category')
    .default('-date'),

  search: Joi.string()
    .trim()
    .max(100),
});

/**
 * MongoDB ObjectId Schema
 */
const objectIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format',
      'any.required': 'ID is required',
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  transactionSchema,
  transactionUpdateSchema,
  budgetSchema,
  budgetUpdateSchema,
  transactionQuerySchema,
  objectIdSchema,
};
