const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },

    limit: {
      type: Number,
      required: [true, 'Please provide a budget limit'],
      min: [0.01, 'Budget limit must be greater than 0'],
      max: [999999999.99, 'Budget limit exceeds maximum'],
    },

    period: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      default: 'monthly',
    },

    alertThreshold: {
      type: Number,
      default: 80,
      min: [0, 'Alert threshold must be at least 0'],
      max: [100, 'Alert threshold cannot exceed 100'],
    },

    alertsEnabled: {
      type: Boolean,
      default: true,
    },

    // Color for UI display (hex format)
    color: {
      type: String,
      default: '#3B82F6',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color'],
    },

    // Notes about the budget
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters'],
      default: '',
    },

    // Start date for this budget period
    startDate: {
      type: Date,
      default: function () {
        // Default to first day of current month
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
      },
    },

    // Whether budget is currently active
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Ensure unique budget per user per category
 * A user can only have one budget per category
 */
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

/**
 * Virtual property to calculate current spending
 * This would need to be populated with actual data from transactions
 */
budgetSchema.virtual('spent').get(function () {
  return this._spent || 0;
});

budgetSchema.virtual('spent').set(function (value) {
  this._spent = value;
});

/**
 * Virtual property to calculate remaining budget
 */
budgetSchema.virtual('remaining').get(function () {
  return Math.max(0, this.limit - (this._spent || 0));
});

/**
 * Virtual property to calculate percentage used
 */
budgetSchema.virtual('percentUsed').get(function () {
  if (this.limit === 0) return 0;
  return Math.round(((this._spent || 0) / this.limit) * 100);
});

/**
 * Virtual property to check if budget is exceeded
 */
budgetSchema.virtual('isExceeded').get(function () {
  return (this._spent || 0) > this.limit;
});

/**
 * Virtual property to check if alert threshold is reached
 */
budgetSchema.virtual('isAlertTriggered').get(function () {
  return this.alertsEnabled && this.percentUsed >= this.alertThreshold;
});

/**
 * Static method to get all budgets with spending data for a user
 * 
 * @param {ObjectId} userId - User's ID
 * @returns {Promise<Array>} - Array of budgets with spent amounts
 */
budgetSchema.statics.getBudgetsWithSpending = async function (userId) {
  const Transaction = mongoose.model('Transaction');
  
  // Get current period dates based on budget period
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Get all budgets for user
  const budgets = await this.find({ user: userId, isActive: true }).lean();

  // Get spending per category for current month
  const spending = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
  ]);

  // Create spending map for quick lookup
  const spendingMap = spending.reduce((acc, item) => {
    acc[item._id] = item.total;
    return acc;
  }, {});

  // Calculate total spending for "General" budget
  const totalSpending = spending.reduce((sum, item) => sum + item.total, 0);

  // Attach spending data to budgets
  return budgets.map((budget) => {
    // For "General" category, use total spending across all categories
    const spent = budget.category === 'General' 
      ? totalSpending 
      : (spendingMap[budget.category] || 0);
    const percentUsed = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
    
    return {
      ...budget,
      spent,
      remaining: Math.max(0, budget.limit - spent),
      percentUsed,
      isExceeded: spent > budget.limit,
      isAlertTriggered: budget.alertsEnabled && percentUsed >= budget.alertThreshold,
    };
  });
};

/**
 * Static method to check budget alerts for a specific transaction
 * 
 * @param {ObjectId} userId - User's ID
 * @param {string} category - Transaction category
 * @param {number} amount - Transaction amount
 * @returns {Promise<Object|null>} - Alert object if threshold reached
 */
budgetSchema.statics.checkBudgetAlert = async function (userId, category, amount) {
  const budget = await this.findOne({ 
    user: userId, 
    category, 
    isActive: true 
  });

  if (!budget || !budget.alertsEnabled) {
    return null;
  }

  const Transaction = mongoose.model('Transaction');
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get current spending for this category
  const spending = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        category: category,
        date: { $gte: startOfMonth },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const currentSpent = (spending[0]?.total || 0) + amount;
  const percentUsed = Math.round((currentSpent / budget.limit) * 100);

  if (percentUsed >= 100) {
    return {
      type: 'exceeded',
      category,
      limit: budget.limit,
      spent: currentSpent,
      percentUsed,
      message: `Budget exceeded! You've spent $${currentSpent.toFixed(2)} of your $${budget.limit.toFixed(2)} budget for ${category}.`,
    };
  } else if (percentUsed >= budget.alertThreshold) {
    return {
      type: 'warning',
      category,
      limit: budget.limit,
      spent: currentSpent,
      percentUsed,
      message: `Budget alert: You've used ${percentUsed}% of your ${category} budget ($${currentSpent.toFixed(2)} of $${budget.limit.toFixed(2)}).`,
    };
  }

  return null;
};

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
