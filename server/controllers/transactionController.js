const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { asyncHandler, ApiError } = require('../middleware');
const { 
  getPaginationMeta, 
  transactionsToCSV, 
  parseSort,
  getDateRange,
} = require('../utils/helpers');

// GET /api/transactions
// Supports: page, limit, type, category, startDate, endDate, sort, search
const getTransactions = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    type, 
    category, 
    startDate, 
    endDate, 
    sort = '-date',
    search,
  } = req.query;

  const query = { user: req.user.id };

  if (type) query.type = type;
  if (category) query.category = category;
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (search) {
    query.description = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort(parseSort(sort))
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Transaction.countDocuments(query),
  ]);

  const pagination = getPaginationMeta(total, parseInt(page), parseInt(limit));

  res.status(200).json({
    success: true,
    ...pagination,
    data: transactions,
  });
});

// GET /api/transactions/:id
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!transaction) {
    throw new ApiError('Transaction not found', 404);
  }

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

// POST /api/transactions
const createTransaction = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;

  const transaction = await Transaction.create(req.body);

  // Check if this expense triggers a budget warning
  let budgetAlert = null;
  if (transaction.type === 'expense') {
    budgetAlert = await Budget.checkBudgetAlert(
      req.user.id,
      transaction.category,
      transaction.amount
    );
  }

  res.status(201).json({
    success: true,
    data: transaction,
    budgetAlert,
  });
});

// PUT /api/transactions/:id
const updateTransaction = asyncHandler(async (req, res) => {
  let transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!transaction) {
    throw new ApiError('Transaction not found', 404);
  }

  transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  let budgetAlert = null;
  if (transaction.type === 'expense') {
    budgetAlert = await Budget.checkBudgetAlert(
      req.user.id,
      transaction.category,
      0 // Don't add to total, just check current status
    );
  }

  res.status(200).json({
    success: true,
    data: transaction,
    budgetAlert,
  });
});

// DELETE /api/transactions/:id
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!transaction) {
    throw new ApiError('Transaction not found', 404);
  }

  await transaction.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully',
  });
});

// GET /api/transactions/summary
const getSummary = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const { startDate, endDate } = getDateRange(period);

  const [totalIncome, totalExpense] = await Promise.all([
    Transaction.getTotal(userId, 'income', startDate, endDate),
    Transaction.getTotal(userId, 'expense', startDate, endDate),
  ]);

  const expensesByCategory = await Transaction.getExpensesByCategory(
    userId,
    startDate,
    endDate
  );

  const monthlySummary = await Transaction.getMonthlySummary(userId, 12);

  res.status(200).json({
    success: true,
    data: {
      period,
      startDate,
      endDate,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      expensesByCategory,
      monthlySummary,
    },
  });
});

// GET /api/transactions/export/csv
const exportCSV = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = { user: req.user.id };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(query)
    .sort({ date: -1 })
    .lean();

  const csv = transactionsToCSV(transactions);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');

  res.status(200).send(csv);
});

// GET /api/transactions/categories
const getCategories = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const categories = await Transaction.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
    { $sort: { type: 1, category: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// DELETE /api/transactions/bulk
const bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ApiError('Please provide an array of transaction IDs', 400);
  }

  const count = await Transaction.countDocuments({
    _id: { $in: ids },
    user: req.user.id,
  });

  if (count !== ids.length) {
    throw new ApiError('Some transactions not found or unauthorized', 400);
  }

  await Transaction.deleteMany({
    _id: { $in: ids },
    user: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: `${ids.length} transactions deleted successfully`,
  });
});

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  exportCSV,
  getCategories,
  bulkDelete,
};
