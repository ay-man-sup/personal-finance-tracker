/**
 * Transaction Model
 * 
 * Defines the schema for financial transactions (income/expense).
 * Supports categorization, descriptions, and date tracking.
 */

const mongoose = require('mongoose');

/**
 * Predefined categories for transactions
 * Separate lists for income and expense types
 */
const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Business',
  'Rental',
  'Gifts',
  'Refunds',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Travel',
  'Insurance',
  'Debt Payments',
  'Savings',
  'Gifts & Donations',
  'Personal Care',
  'Other Expenses',
];

/**
 * Transaction Schema Definition
 */
const transactionSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this transaction
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Transaction type: income or expense
    type: {
      type: String,
      required: [true, 'Please specify transaction type'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense',
      },
    },

    // Category of the transaction
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },

    // Transaction amount (always positive, type determines direction)
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than 0'],
      max: [999999999.99, 'Amount exceeds maximum limit'],
    },

    // Transaction date
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },

    // Optional description/notes
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    // Optional tags for filtering
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],

    // Whether this is a recurring transaction
    isRecurring: {
      type: Boolean,
      default: false,
    },

    // Recurring frequency if applicable
    recurringFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', null],
      default: null,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Pre-save validation to ensure category matches transaction type
 */
transactionSchema.pre('save', function (next) {
  const validCategories = this.type === 'income' 
    ? INCOME_CATEGORIES 
    : EXPENSE_CATEGORIES;
  
  // Allow custom categories but log warning for non-standard ones
  if (!validCategories.includes(this.category)) {
    console.log(`Custom category used: ${this.category}`);
  }
  
  next();
});

/**
 * Static method to get total income/expense for a user
 * 
 * @param {ObjectId} userId - User's ID
 * @param {string} type - 'income' or 'expense'
 * @param {Date} startDate - Start of date range (optional)
 * @param {Date} endDate - End of date range (optional)
 * @returns {Promise<number>} - Total amount
 */
transactionSchema.statics.getTotal = async function (userId, type, startDate, endDate) {
  const matchStage = {
    user: userId,
    type: type,
  };

  // Add date range filter if provided
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = startDate;
    if (endDate) matchStage.date.$lte = endDate;
  }

  const result = await this.aggregate([
    { $match: matchStage },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return result.length > 0 ? result[0].total : 0;
};

/**
 * Static method to get expenses grouped by category
 * 
 * @param {ObjectId} userId - User's ID
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Promise<Array>} - Array of { category, total } objects
 */
transactionSchema.statics.getExpensesByCategory = async function (userId, startDate, endDate) {
  const matchStage = {
    user: userId,
    type: 'expense',
  };

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = startDate;
    if (endDate) matchStage.date.$lte = endDate;
  }

  return await this.aggregate([
    { $match: matchStage },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $project: { category: '$_id', total: 1, _id: 0 } },
    { $sort: { total: -1 } },
  ]);
};

/**
 * Static method to get monthly summary (for charts)
 * 
 * @param {ObjectId} userId - User's ID
 * @param {number} months - Number of months to retrieve (default: 12)
 * @returns {Promise<Array>} - Monthly income/expense data
 */
transactionSchema.statics.getMonthlySummary = async function (userId, months = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  return await this.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $group: {
        _id: { year: '$_id.year', month: '$_id.month' },
        income: {
          $sum: { $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        income: 1,
        expense: 1,
        balance: { $subtract: ['$income', '$expense'] },
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);
};

// Create compound indexes for common queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, date: -1, type: 1 });

// Export model and category constants
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
module.exports.INCOME_CATEGORIES = INCOME_CATEGORIES;
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
