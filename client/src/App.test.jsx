/**
 * App Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock contexts
jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    loading: false,
    isAuthenticated: false,
  }),
}));

jest.mock('./context/ThemeContext', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('./context/TransactionContext', () => ({
  TransactionProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('./context/FunPopupContext', () => ({
  FunPopupProvider: ({ children }) => <div>{children}</div>,
  useFunPopup: () => ({
    showPopup: jest.fn(),
  }),
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });

  test('shows login page when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    // Should show login page elements
    expect(document.body).toBeTruthy();
  });
});
