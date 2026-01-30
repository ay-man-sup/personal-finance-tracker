// Transaction context - CRUD operations and summary data for charts

import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const TransactionContext = createContext(null);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    expensesByCategory: [],
    trend: [],
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/transactions', { params });
      
      if (response.data.success) {
        setTransactions(response.data.data);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        });
      }
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch aggregated data for dashboard charts
  const fetchSummary = useCallback(async (period = 'month') => {
    try {
      const response = await api.get('/transactions/summary', {
        params: { period },
      });
      
      if (response.data.success) {
        const data = response.data.data;
        setSummary({
          balance: data.balance || 0,
          income: data.totalIncome || 0,
          expenses: data.totalExpense || 0,
          expensesByCategory: data.expensesByCategory || [],
          trend: data.monthlySummary || [],
        });
      }
    } catch (error) {
      toast.error('Failed to fetch summary');
    }
  }, []);

  const createTransaction = async (transactionData) => {
    try {
      const response = await api.post('/transactions', transactionData);
      
      if (response.data.success) {
        setTransactions((prev) => [response.data.data, ...prev]);
        
        // Budget alerts are returned from the API when spending approaches/exceeds limits
        if (response.data.budgetAlert) {
          const alert = response.data.budgetAlert;
          if (alert.type === 'exceeded') {
            toast.error(alert.message, { autoClose: 5000 });
          } else {
            toast.warning(alert.message, { autoClose: 5000 });
          }
        } else {
          toast.success('Transaction added successfully');
        }
        
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create transaction';
      toast.error(message);
      return null;
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await api.put(`/transactions/${id}`, transactionData);
      
      if (response.data.success) {
        setTransactions((prev) =>
          prev.map((t) => (t._id === id ? response.data.data : t))
        );
        toast.success('Transaction updated successfully');
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update transaction';
      toast.error(message);
      return null;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await api.delete(`/transactions/${id}`);
      
      if (response.data.success) {
        setTransactions((prev) => prev.filter((t) => t._id !== id));
        toast.success('Transaction deleted');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete transaction';
      toast.error(message);
      return false;
    }
  };

  const exportCSV = async (params = {}) => {
    try {
      const response = await api.get('/transactions/export/csv', {
        params,
        responseType: 'blob',
      });

      // Trigger browser download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Transactions exported successfully');
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  const value = {
    transactions,
    summary,
    loading,
    pagination,
    fetchTransactions,
    fetchSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    exportCSV,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;
