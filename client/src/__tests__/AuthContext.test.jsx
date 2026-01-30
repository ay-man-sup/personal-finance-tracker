/**
 * AuthContext Tests
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock the default export (axios instance)
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
  authAPI: {
    getMe: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

// Import the mocked module
import api from '../services/api';

// Test component to access context
const TestComponent = () => {
  const { user, loading, isAuthenticated, login, logout, register } = useAuth();
  
  return (
    <div>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="authenticated">{isAuthenticated.toString()}</span>
      <span data-testid="user">{user ? user.name : 'null'}</span>
      <button onClick={() => login({ email: 'test@test.com', password: 'password123' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    api.get.mockResolvedValue({ data: { success: false } });
    api.post.mockResolvedValue({ data: { success: false } });
  });

  test('provides auth context to children', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('loading')).toBeTruthy();
    expect(screen.getByTestId('authenticated')).toBeTruthy();
  });

  test('initializes with loading state when token exists', () => {
    localStorage.setItem('token', 'mock-token');
    api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  test('sets user after successful auth check', async () => {
    localStorage.setItem('token', 'mock-token');
    const mockUser = { _id: '1', name: 'Test User', email: 'test@test.com' };
    api.get.mockResolvedValue({ data: { success: true, user: mockUser } });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user').textContent).toBe('Test User');
    });
  });

  test('handles auth check failure', async () => {
    localStorage.setItem('token', 'mock-token');
    api.get.mockRejectedValue(new Error('Unauthorized'));

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });
});
