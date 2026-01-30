const express = require('express');
const router = express.Router();

const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  exportCSV,
  getCategories,
  bulkDelete,
} = require('../controllers/transactionController');

const { protect, validate, validateQuery, validateParams } = require('../middleware');

const { 
  transactionSchema, 
  transactionUpdateSchema,
  transactionQuerySchema,
  objectIdSchema,
} = require('../validators/schemas');

router.use(protect);

// GET /api/transactions/summary
router.get('/summary', getSummary);

// GET /api/transactions/export/csv
router.get('/export/csv', exportCSV);

// GET /api/transactions/categories
router.get('/categories', getCategories);

// DELETE /api/transactions/bulk
router.delete('/bulk', bulkDelete);

// GET/POST /api/transactions
router
  .route('/')
  .get(validateQuery(transactionQuerySchema), getTransactions)
  .post(validate(transactionSchema), createTransaction);

// GET/PUT/DELETE /api/transactions/:id
router
  .route('/:id')
  .get(validateParams(objectIdSchema), getTransaction)
  .put(validateParams(objectIdSchema), validate(transactionUpdateSchema), updateTransaction)
  .delete(validateParams(objectIdSchema), deleteTransaction);

module.exports = router;
