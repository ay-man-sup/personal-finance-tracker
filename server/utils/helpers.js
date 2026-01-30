// Utility functions for dates, formatting, and pagination

const getDateRange = (period = 'month') => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
  case 'week':
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay());
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    break;

  case 'year':
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    break;

  case 'month':
  default:
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    break;
  }

  return { startDate, endDate };
};

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const transactionsToCSV = (transactions) => {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
  
  const rows = transactions.map((t) => [
    new Date(t.date).toISOString().split('T')[0],
    t.type,
    t.category,
    t.amount.toFixed(2),
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  return [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');
};

/**
 * Parse sort string into MongoDB sort object
 * 
 * @param {string} sortStr - Sort string (e.g., '-date', 'amount')
 * @returns {Object} MongoDB sort object
 */
const parseSort = (sortStr) => {
  if (!sortStr) return { date: -1 }; // Default: newest first

  const direction = sortStr.startsWith('-') ? -1 : 1;
  const field = sortStr.replace(/^-/, '');
  
  return { [field]: direction };
};

/**
 * Get month name from month number
 * 
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month - 1] || '';
};

/**
 * Delay execution (useful for rate limiting in tests)
 * 
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate random color for charts
 * 
 * @returns {string} Random hex color
 */
const generateRandomColor = () => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

module.exports = {
  getDateRange,
  formatCurrency,
  calculatePercentage,
  getPaginationMeta,
  transactionsToCSV,
  parseSort,
  getMonthName,
  delay,
  generateRandomColor,
};
