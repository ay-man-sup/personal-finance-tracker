/**
 * Controllers Index
 * 
 * Exports all controllers for easy importing.
 */

const authController = require('./authController');
const transactionController = require('./transactionController');
const budgetController = require('./budgetController');

module.exports = {
  authController,
  transactionController,
  budgetController,
};
