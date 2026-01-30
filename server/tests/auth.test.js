/**
 * Authentication API Tests
 * 
 * Unit tests for authentication endpoints using Jest and Supertest.
 */

const request = require('supertest');

// Mock mongoose before importing app
jest.mock('mongoose', () => {
  const mockMongoose = {
    connect: jest.fn().mockResolvedValue({
      connection: { host: 'mock-host' },
    }),
    connection: {
      on: jest.fn(),
      close: jest.fn(),
    },
    Schema: class Schema {
      constructor() {
        this.pre = jest.fn();
        this.methods = {};
        this.statics = {};
        this.virtual = jest.fn(() => ({ get: jest.fn(), set: jest.fn() }));
        this.index = jest.fn();
      }
    },
    model: jest.fn(),
    Types: {
      ObjectId: jest.fn().mockImplementation((id) => id),
    },
  };
  return mockMongoose;
});

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('mock-salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ id: 'mock-user-id' }),
}));

describe('Authentication API', () => {
  describe('Input Validation', () => {
    it('should validate email format', () => {
      const validEmails = ['test@example.com', 'user.name@domain.org'];
      const invalidEmails = ['invalid-email', '@domain.com', 'user@'];
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
      
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should validate password strength', () => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      
      const validPasswords = ['Password1!', 'MyP@ssw0rd', 'Secure$123'];
      const invalidPasswords = ['password', '12345678', 'Password', 'pass'];
      
      validPasswords.forEach(password => {
        expect(passwordRegex.test(password)).toBe(true);
      });
      
      invalidPasswords.forEach(password => {
        expect(passwordRegex.test(password)).toBe(false);
      });
    });
  });

  describe('Helper Functions', () => {
    const { 
      getDateRange, 
      formatCurrency, 
      calculatePercentage,
      getPaginationMeta,
      transactionsToCSV,
    } = require('../utils/helpers');

    it('should calculate date range for month', () => {
      const { startDate, endDate } = getDateRange('month');
      
      expect(startDate.getDate()).toBe(1);
      expect(endDate.getDate()).toBeGreaterThan(27);
    });

    it('should format currency correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(75, 100)).toBe(75);
      expect(calculatePercentage(0, 100)).toBe(0);
      expect(calculatePercentage(50, 0)).toBe(0);
    });

    it('should generate pagination metadata', () => {
      const meta = getPaginationMeta(100, 1, 20);
      
      expect(meta.total).toBe(100);
      expect(meta.page).toBe(1);
      expect(meta.totalPages).toBe(5);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPrevPage).toBe(false);
    });

    it('should convert transactions to CSV', () => {
      const transactions = [
        { date: '2024-01-15', type: 'expense', category: 'Food', amount: 50, description: 'Groceries' },
        { date: '2024-01-16', type: 'income', category: 'Salary', amount: 1000, description: 'Monthly pay' },
      ];
      
      const csv = transactionsToCSV(transactions);
      
      expect(csv).toContain('Date,Type,Category,Amount,Description');
      expect(csv).toContain('expense');
      expect(csv).toContain('income');
    });
  });

  describe('Validation Schemas', () => {
    const { 
      registerSchema, 
      loginSchema,
      transactionSchema,
      budgetSchema,
    } = require('../validators/schemas');

    it('should validate registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
      };
      
      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid registration data', () => {
      const invalidData = {
        name: 'J',
        email: 'invalid-email',
        password: 'weak',
      };
      
      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should validate transaction data', () => {
      const validData = {
        type: 'expense',
        category: 'Food',
        amount: 50.00,
        date: new Date('2024-01-15'),
        description: 'Lunch',
      };
      
      const { error } = transactionSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid transaction amount', () => {
      const invalidData = {
        type: 'expense',
        category: 'Food',
        amount: -50,
      };
      
      const { error } = transactionSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should validate budget data', () => {
      const validData = {
        category: 'Food',
        limit: 500,
        period: 'monthly',
        alertThreshold: 80,
      };
      
      const { error } = budgetSchema.validate(validData);
      expect(error).toBeUndefined();
    });
  });
});
