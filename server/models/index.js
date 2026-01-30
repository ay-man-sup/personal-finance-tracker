/**
 * Models Index
 * 
 * Exports all Mongoose models for easy importing.
 */

const User = require('./User');
const Transaction = require('./Transaction');
const Budget = require('./Budget');

module.exports = {
  User,
  Transaction,
  Budget,
};
