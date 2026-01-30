/**
 * Transaction Routes
 * 
 * CRUD operations for financial transactions.
 * All routes require authentication.
 */

const express = require('express');
const router = express.Router();

// Controllers
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  exportCSV,
  getCategories,
  bulkDelete,
} = require('../controllers/transactionController');

// Middleware
const { protect, validate, validateQuery, validateParams } = require('../middleware');

// Validation schemas
const { 
  transactionSchema, 
  transactionUpdateSchema,
  transactionQuerySchema,
  objectIdSchema,
} = require('../validators/schemas');

// Apply authentication to all routes
router.use(protect);

/**
 * Aggregate routes (must come before /:id routes)
 */

// @route   GET /api/transactions/summary
// @desc    Get transaction summary (totals, by category)
// @access  Private
router.get('/summary', getSummary);

// @route   GET /api/transactions/export/csv
// @desc    Export transactions as CSV file
// @access  Private
router.get('/export/csv', exportCSV);

// @route   GET /api/transactions/categories
// @desc    Get category list with totals
// @access  Private
router.get('/categories', getCategories);

// @route   DELETE /api/transactions/bulk
// @desc    Delete multiple transactions
// @access  Private
router.delete('/bulk', bulkDelete);

/**
 * CRUD routes
 */

// @route   GET /api/transactions
// @desc    Get all transactions (with pagination/filters)
// @route   POST /api/transactions
// @desc    Create new transaction
router
  .route('/')
  .get(validateQuery(transactionQuerySchema), getTransactions)
  .post(validate(transactionSchema), createTransaction);

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
router
  .route('/:id')
  .get(validateParams(objectIdSchema), getTransaction)
  .put(validateParams(objectIdSchema), validate(transactionUpdateSchema), updateTransaction)
  .delete(validateParams(objectIdSchema), deleteTransaction);

module.exports = router;
