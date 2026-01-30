/**
 * Jest Test Setup
 * 
 * Configuration that runs before each test file.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing-purposes';
process.env.JWT_EXPIRE = '1h';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
process.env.PORT = 5001;

// Mock console.log to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
