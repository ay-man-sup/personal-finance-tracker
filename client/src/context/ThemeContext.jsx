/**
 * Theme Context
 * 
 * Manages dark/light mode theme throughout the application.
 * Persists user preference in localStorage.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const ThemeContext = createContext(null);

/**
 * Custom hook to use theme context
 * @returns {Object} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme Provider Component
 * 
 * Manages theme state and provides toggle functionality.
 */
export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  /**
   * Apply theme class to document
   */
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Persist preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  /**
   * Toggle between dark and light mode
   */
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  /**
   * Set specific theme
   * @param {string} theme - 'dark' or 'light'
   */
  const setTheme = (theme) => {
    setIsDark(theme === 'dark');
  };

  // Context value
  const value = {
    isDark,
    toggleTheme,
    setTheme,
    theme: isDark ? 'dark' : 'light',
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
