/**
 * TransactionContext Tests
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { TransactionProvider, useTransactions } from '../context/TransactionContext';

// Mock the default export (axios instance)
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  transactionAPI: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getSummary: jest.fn(),
  },
}));

// Import the mocked module
import api from '../services/api';

// Test component
const TestComponent = () => {
  const { transactions, summary, loading, fetchTransactions } = useTransactions();
  
  return (
    <div>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="count">{transactions.length}</span>
      <span data-testid="balance">{summary.balance}</span>
      <button onClick={fetchTransactions}>Fetch</button>
    </div>
  );
};

describe('TransactionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({
      data: { success: true, data: [], page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  });

  test('provides transaction context to children', async () => {
    await act(async () => {
      render(
        <TransactionProvider>
          <TestComponent />
        </TransactionProvider>
      );
    });

    expect(screen.getByTestId('count')).toBeTruthy();
    expect(screen.getByTestId('balance')).toBeTruthy();
  });

  test('initializes with empty transactions', async () => {
    await act(async () => {
      render(
        <TransactionProvider>
          <TestComponent />
        </TransactionProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('0');
      expect(screen.getByTestId('balance').textContent).toBe('0');
    });
  });

  test('fetches and displays transactions', async () => {
    const mockTransactions = [
      { _id: '1', type: 'income', amount: 1000, category: 'Salary', description: 'Paycheck' },
      { _id: '2', type: 'expense', amount: 200, category: 'Food', description: 'Groceries' },
    ];

    api.get.mockImplementation((url) => {
      if (url === '/transactions') {
        return Promise.resolve({
          data: { success: true, data: mockTransactions, page: 1, limit: 20, total: 2, totalPages: 1 },
        });
      }
      if (url === '/transactions/summary') {
        return Promise.resolve({
          data: { success: true, data: { balance: 800, totalIncome: 1000, totalExpense: 200 } },
        });
      }
      return Promise.resolve({ data: {} });
    });

    await act(async () => {
      render(
        <TransactionProvider>
          <TestComponent />
        </TransactionProvider>
      );
    });

    // Trigger fetch
    await act(async () => {
      screen.getByText('Fetch').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('2');
    });
  });
});
