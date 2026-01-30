// Formatting and utility functions

export const formatCurrency = (amount, currency = 'USD') => {
  const safeAmount = (amount === null || amount === undefined || isNaN(amount)) ? 0 : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
};

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
};

// Returns YYYY-MM-DD for input fields
export const formatDateForInput = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Returns short format like "Mar 10"
export const formatDateShort = (date) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(d);
};

export const generateCSV = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return '';
  }

  const header = 'Date,Type,Category,Amount,Description';
  const rows = transactions.map(t => {
    const date = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
    return `${date},${t.type || ''},${t.category || ''},${t.amount || ''},${t.description || ''}`;
  });

  return [header, ...rows].join('\n');
};

// Returns "2 days ago", "just now", etc.
export const getRelativeTime = (date) => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
};

/**
 * Calculate percentage
 * 
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Truncate text with ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter of string
 * 
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Debounce function
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Generate color for category
 * 
 * @param {string} category - Category name
 * @returns {string} Color hex code
 */
export const getCategoryColor = (category) => {
  const colors = {
    // Income categories
    'Salary': '#10B981',
    'Freelance': '#34D399',
    'Investments': '#059669',
    'Business': '#047857',
    'Rental': '#065F46',
    'Gifts': '#6EE7B7',
    'Refunds': '#A7F3D0',
    'Other Income': '#D1FAE5',
    
    // Expense categories
    'Food & Dining': '#EF4444',
    'Transportation': '#F97316',
    'Housing': '#8B5CF6',
    'Utilities': '#6366F1',
    'Healthcare': '#EC4899',
    'Entertainment': '#F59E0B',
    'Shopping': '#3B82F6',
    'Education': '#14B8A6',
    'Travel': '#06B6D4',
    'Insurance': '#84CC16',
    'Debt Payments': '#DC2626',
    'Savings': '#22C55E',
    'Gifts & Donations': '#A855F7',
    'Personal Care': '#F472B6',
    'Other Expenses': '#9CA3AF',
  };
  
  return colors[category] || '#6B7280';
};

/**
 * Get month name from number
 * 
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
export const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month - 1] || '';
};

/**
 * Get short month name
 * 
 * @param {number} month - Month number (1-12)
 * @returns {string} Short month name
 */
export const getShortMonthName = (month) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return months[month - 1] || '';
};

/**
 * Validate email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with score and feedback
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: [],
  };

  if (password.length < 8) {
    result.feedback.push('Password must be at least 8 characters');
  } else {
    result.score++;
  }

  if (!/[a-z]/.test(password)) {
    result.feedback.push('Include at least one lowercase letter');
  } else {
    result.score++;
  }

  if (!/[A-Z]/.test(password)) {
    result.feedback.push('Include at least one uppercase letter');
  } else {
    result.score++;
  }

  if (!/\d/.test(password)) {
    result.feedback.push('Include at least one number');
  } else {
    result.score++;
  }

  if (!/[@$!%*?&]/.test(password)) {
    result.feedback.push('Include at least one special character (@$!%*?&)');
  } else {
    result.score++;
  }

  result.isValid = result.score === 5;
  return result;
};

/**
 * Transaction categories
 */
export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Business',
  'Rental',
  'Gifts',
  'Refunds',
  'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'General',
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
 * Currency options
 */
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];
