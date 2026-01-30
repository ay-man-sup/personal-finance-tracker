/**
 * Helper Functions Tests
 */

import {
  formatCurrency,
  formatDate,
  formatDateShort,
  getCategoryColor,
  generateCSV,
  debounce,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '../utils/helpers';

describe('formatCurrency', () => {
  test('formats positive numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0.99)).toBe('$0.99');
  });

  test('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('formats negative numbers correctly', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });

  test('handles string input', () => {
    expect(formatCurrency('1000')).toBe('$1,000.00');
  });

  test('handles null/undefined', () => {
    expect(formatCurrency(null)).toBe('$0.00');
    expect(formatCurrency(undefined)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  test('formats date correctly', () => {
    const date = new Date('2024-01-15');
    const formatted = formatDate(date);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  test('handles string date', () => {
    const formatted = formatDate('2024-06-20');
    expect(formatted).toContain('Jun');
    expect(formatted).toContain('20');
  });
});

describe('formatDateShort', () => {
  test('formats date in short format', () => {
    const date = new Date('2024-03-10');
    const formatted = formatDateShort(date);
    expect(formatted).toContain('Mar');
    expect(formatted).toContain('10');
  });
});

describe('getCategoryColor', () => {
  test('returns color for known categories', () => {
    expect(getCategoryColor('Food')).toBeTruthy();
    expect(getCategoryColor('Salary')).toBeTruthy();
    expect(getCategoryColor('Transportation')).toBeTruthy();
  });

  test('returns default color for unknown categories', () => {
    const color = getCategoryColor('Unknown Category');
    expect(color).toBeTruthy();
    expect(typeof color).toBe('string');
    expect(color.startsWith('#')).toBe(true);
  });
});

describe('generateCSV', () => {
  test('generates CSV from transactions', () => {
    const transactions = [
      {
        date: '2024-01-15',
        type: 'income',
        category: 'Salary',
        amount: 5000,
        description: 'Monthly salary',
      },
      {
        date: '2024-01-16',
        type: 'expense',
        category: 'Food',
        amount: 50,
        description: 'Groceries',
      },
    ];

    const csv = generateCSV(transactions);
    
    expect(csv).toContain('Date,Type,Category,Amount,Description');
    expect(csv).toContain('income,Salary,5000,Monthly salary');
    expect(csv).toContain('expense,Food,50,Groceries');
  });

  test('returns empty string for empty array', () => {
    expect(generateCSV([])).toBe('');
  });

  test('handles null input', () => {
    expect(generateCSV(null)).toBe('');
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  test('debounces function calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('passes arguments correctly', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('arg1', 'arg2');
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('Categories', () => {
  test('INCOME_CATEGORIES is an array of strings', () => {
    expect(Array.isArray(INCOME_CATEGORIES)).toBe(true);
    expect(INCOME_CATEGORIES.length).toBeGreaterThan(0);
    INCOME_CATEGORIES.forEach((cat) => {
      expect(typeof cat).toBe('string');
    });
  });

  test('EXPENSE_CATEGORIES is an array of strings', () => {
    expect(Array.isArray(EXPENSE_CATEGORIES)).toBe(true);
    expect(EXPENSE_CATEGORIES.length).toBeGreaterThan(0);
    EXPENSE_CATEGORIES.forEach((cat) => {
      expect(typeof cat).toBe('string');
    });
  });

  test('categories are unique', () => {
    const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
    const uniqueCategories = new Set(allCategories);
    expect(uniqueCategories.size).toBe(allCategories.length);
  });
});
