const Budget = require('../models/Budget');
const { asyncHandler, ApiError } = require('../middleware');

// GET /api/budgets
const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ user: req.user.id, isActive: true })
    .sort({ category: 1 })
    .lean();

  res.status(200).json({
    success: true,
    count: budgets.length,
    data: budgets,
  });
});

// GET /api/budgets/status/all - includes spending data
const getBudgetsWithStatus = asyncHandler(async (req, res) => {
  const budgets = await Budget.getBudgetsWithSpending(req.user._id);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const alertsCount = budgets.filter(b => b.isAlertTriggered).length;
  const exceededCount = budgets.filter(b => b.isExceeded).length;

  res.status(200).json({
    success: true,
    summary: {
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      percentUsed: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
      alertsCount,
      exceededCount,
    },
    data: budgets,
  });
});

// GET /api/budgets/:category
const getBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    user: req.user.id,
    category: req.params.category,
  });

  if (!budget) {
    throw new ApiError(`No budget found for category: ${req.params.category}`, 404);
  }

  const budgetsWithSpending = await Budget.getBudgetsWithSpending(req.user._id);
  const budgetWithSpending = budgetsWithSpending.find(
    b => b.category === req.params.category
  );

  res.status(200).json({
    success: true,
    data: budgetWithSpending || budget,
  });
});

// POST /api/budgets - creates or updates (upsert)
const createOrUpdateBudget = asyncHandler(async (req, res) => {
  const { category, limit, period, alertThreshold, alertsEnabled, color, notes } = req.body;

  // Use findOneAndUpdate with upsert for create-or-update behavior
  const budget = await Budget.findOneAndUpdate(
    { 
      user: req.user.id, 
      category: category,
    },
    {
      user: req.user.id,
      category,
      limit,
      period: period || 'monthly',
      alertThreshold: alertThreshold ?? 80,
      alertsEnabled: alertsEnabled ?? true,
      color: color || '#3B82F6',
      notes: notes || '',
      isActive: true,
    },
    { 
      new: true, 
      upsert: true, 
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Budget saved successfully',
    data: budget,
  });
});

// PUT /api/budgets/:category
const updateBudget = asyncHandler(async (req, res) => {
  let budget = await Budget.findOne({
    user: req.user.id,
    category: req.params.category,
  });

  if (!budget) {
    throw new ApiError(`No budget found for category: ${req.params.category}`, 404);
  }

  budget = await Budget.findByIdAndUpdate(
    budget._id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: budget,
  });
});

// DELETE /api/budgets/:category
const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    user: req.user.id,
    category: req.params.category,
  });

  if (!budget) {
    throw new ApiError(`No budget found for category: ${req.params.category}`, 404);
  }

  await budget.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Budget deleted successfully',
  });
});

// GET /api/budgets/alerts
const getAlerts = asyncHandler(async (req, res) => {
  const budgets = await Budget.getBudgetsWithSpending(req.user._id);

  const alerts = budgets
    .filter(b => b.isAlertTriggered || b.isExceeded)
    .map(b => ({
      category: b.category,
      type: b.isExceeded ? 'exceeded' : 'warning',
      limit: b.limit,
      spent: b.spent,
      percentUsed: b.percentUsed,
      message: b.isExceeded
        ? `Budget exceeded! You've spent $${b.spent.toFixed(2)} of your $${b.limit.toFixed(2)} budget for ${b.category}.`
        : `Budget alert: You've used ${b.percentUsed}% of your ${b.category} budget.`,
    }));

  res.status(200).json({
    success: true,
    count: alerts.length,
    data: alerts,
  });
});

// PUT /api/budgets/:category/deactivate
const deactivateBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndUpdate(
    { user: req.user.id, category: req.params.category },
    { isActive: false },
    { new: true }
  );

  if (!budget) {
    throw new ApiError(`No budget found for category: ${req.params.category}`, 404);
  }

  res.status(200).json({
    success: true,
    message: 'Budget deactivated successfully',
    data: budget,
  });
});

module.exports = {
  getBudgets,
  getBudgetsWithStatus,
  getBudget,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
  getAlerts,
  deactivateBudget,
};
