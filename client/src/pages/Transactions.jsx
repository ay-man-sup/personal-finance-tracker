import React, { useState, useEffect } from 'react';
import { FiPlus, FiDownload, FiFilter, FiSearch } from 'react-icons/fi';
import { useTransactions } from '../context/TransactionContext';
import { useFunPopup } from '../context/FunPopupContext';
import TransactionList from '../components/transactions/TransactionList';
import TransactionForm from '../components/transactions/TransactionForm';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { formatCurrency, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/helpers';
import { toast } from 'react-toastify';

const Transactions = () => {
  const {
    transactions,
    summary,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
    fetchSummary,
    exportCSV,
  } = useTransactions();
  
  const { showPopup } = useFunPopup();

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
  });

  const safeSummary = summary || { balance: 0, income: 0, expenses: 0 };

  useEffect(() => {
    const loadData = async () => {
      await fetchTransactions();
      await fetchSummary('month');
    };
    loadData();
  }, [fetchTransactions, fetchSummary]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !t.description.toLowerCase().includes(searchLower) &&
        !t.category.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    
    if (filters.type && t.type !== filters.type) {
      return false;
    }
    
    if (filters.category && t.category !== filters.category) {
      return false;
    }
    
    return true;
  });

  const getCategories = () => {
    if (filters.type === 'income') return INCOME_CATEGORIES;
    if (filters.type === 'expense') return EXPENSE_CATEGORIES;
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, data);
      } else {
        const result = await createTransaction(data);
        if (result) {
          if (data.type === 'income') {
            showPopup('income');
          } else {
            showPopup('expense');
          }
        }
      }
      // Refresh summary to update budget spending
      await fetchSummary('month');
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await deleteTransaction(id);
      await fetchSummary('month');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleExport = async () => {
    try {
      await exportCSV();
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  const clearFilters = () => {
    setFilters({ search: '', type: '', category: '' });
  };

  const hasActiveFilters = filters.search || filters.type || filters.category;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
            <span className="text-accent-600 dark:text-accent-400">Transactions</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Every penny has a story, here's where we keep track of yours
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="btn-secondary"
            disabled={!transactions.length}
          >
            <FiDownload className="w-5 h-5 mr-2" />
            Export CSV
          </button>
          <button onClick={handleCreate} className="btn-primary">
            <FiPlus className="w-5 h-5 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card p-5">
          <p className="text-sm text-accent-700 dark:text-accent-300 uppercase tracking-wider">Balance</p>
          <p className={`text-2xl font-bold mt-2 font-display ${
            safeSummary.balance >= 0 
              ? 'text-gray-900 dark:text-white' 
              : 'text-danger-600 dark:text-danger-400'
          }`}>
            {formatCurrency(safeSummary.balance)}
          </p>
        </div>
        <div className="stat-card p-5">
          <p className="text-sm text-accent-700 dark:text-accent-300 uppercase tracking-wider">Income</p>
          <p className="text-2xl font-bold mt-2 text-success-600 dark:text-success-400 font-display">
            +{formatCurrency(safeSummary.income)}
          </p>
        </div>
        <div className="stat-card p-5">
          <p className="text-sm text-accent-700 dark:text-accent-300 uppercase tracking-wider">Expenses</p>
          <p className="text-2xl font-bold mt-2 text-danger-600 dark:text-danger-400 font-display">
            -{formatCurrency(safeSummary.expenses)}
          </p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-500 w-5 h-5" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search transactions..."
              className="input pl-10"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${hasActiveFilters ? 'ring-2 ring-accent-500' : ''}`}
          >
            <FiFilter className="w-5 h-5 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-accent-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="label">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Categories</option>
                {getCategories().map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn-secondary w-full sm:w-auto"
                disabled={!hasActiveFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          {hasActiveFilters && (
            <p className="text-sm text-gray-400">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          )}
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
            )}

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={submitting}
        />
      </Modal>
    </div>
  );
};

export default Transactions;
