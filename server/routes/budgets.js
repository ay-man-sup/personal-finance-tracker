/**
 * Budget Routes
 * 
 * CRUD operations for category budgets.
 * All routes require authentication.
 */

const express = require('express');
const router = express.Router();

// Controllers
const {
  getBudgets,
  getBudgetsWithStatus,
  getBudget,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
  getAlerts,
  deactivateBudget,
} = require('../controllers/budgetController');

// Middleware
const { protect, validate } = require('../middleware');

// Validation schemas
const { budgetSchema, budgetUpdateSchema } = require('../validators/schemas');

// Apply authentication to all routes
router.use(protect);

/**
 * Aggregate routes (must come before /:category routes)
 */

// @route   GET /api/budgets/status/all
// @desc    Get all budgets with current spending status
// @access  Private
router.get('/status/all', getBudgetsWithStatus);

// @route   GET /api/budgets/alerts
// @desc    Get budget alerts (near or over limit)
// @access  Private
router.get('/alerts', getAlerts);

/**
 * CRUD routes
 */

// @route   GET /api/budgets
// @desc    Get all budgets
// @route   POST /api/budgets
// @desc    Create or update budget
router
  .route('/')
  .get(getBudgets)
  .post(validate(budgetSchema), createOrUpdateBudget);

// @route   GET /api/budgets/:category
// @desc    Get budget by category
// @route   PUT /api/budgets/:category
// @desc    Update budget
// @route   DELETE /api/budgets/:category
// @desc    Delete budget
router
  .route('/:category')
  .get(getBudget)
  .put(validate(budgetUpdateSchema), updateBudget)
  .delete(deleteBudget);

// @route   PUT /api/budgets/:category/deactivate
// @desc    Deactivate budget (soft delete)
// @access  Private
router.put('/:category/deactivate', deactivateBudget);

module.exports = router;
