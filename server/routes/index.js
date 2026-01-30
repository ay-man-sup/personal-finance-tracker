/**
 * Routes Index
 * 
 * Exports all routes for easy importing.
 */

const authRoutes = require('./auth');
const transactionRoutes = require('./transactions');
const budgetRoutes = require('./budgets');

module.exports = {
  authRoutes,
  transactionRoutes,
  budgetRoutes,
};
