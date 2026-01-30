const express = require('express');
const router = express.Router();

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

const { protect, validate } = require('../middleware');

const { budgetSchema, budgetUpdateSchema } = require('../validators/schemas');

router.use(protect);

// GET /api/budgets/status/all
router.get('/status/all', getBudgetsWithStatus);

// GET /api/budgets/alerts
router.get('/alerts', getAlerts);

// GET/POST /api/budgets
router
  .route('/')
  .get(getBudgets)
  .post(validate(budgetSchema), createOrUpdateBudget);

// GET/PUT/DELETE /api/budgets/:category
router
  .route('/:category')
  .get(getBudget)
  .put(validate(budgetUpdateSchema), updateBudget)
  .delete(deleteBudget);

// PUT /api/budgets/:category/deactivate
router.put('/:category/deactivate', deactivateBudget);

module.exports = router;
