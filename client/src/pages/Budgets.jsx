import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiPieChart } from 'react-icons/fi';
import { budgetAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import BudgetList from '../components/budgets/BudgetList';
import BudgetForm from '../components/budgets/BudgetForm';
import BudgetAlert from '../components/budgets/BudgetAlert';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await budgetAPI.getWithStatus();
      setBudgets(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleCreate = () => {
    setEditingBudget(null);
    setShowModal(true);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBudget(null);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingBudget) {
        await budgetAPI.update(editingBudget.category, data);
        toast.success('Budget updated successfully');
      } else {
        await budgetAPI.create(data);
        toast.success('Budget created successfully');
      }
      await fetchBudgets();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete the "${category}" budget?`)) {
      return;
    }

    try {
      await budgetAPI.delete(category);
      setBudgets((prev) => prev.filter((b) => b.category !== category));
      toast.success('Budget deleted successfully');
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  // Calculate summary
  const summary = budgets.reduce(
    (acc, budget) => ({
      totalLimit: acc.totalLimit + budget.limit,
      totalSpent: acc.totalSpent + (budget.spent || 0),
    }),
    { totalLimit: 0, totalSpent: 0 }
  );

  // Get budget alerts
  const alerts = budgets
    .filter((b) => b.alertsEnabled && (b.isExceeded || b.isAlertTriggered))
    .map((b) => ({
      type: b.isExceeded ? 'exceeded' : 'warning',
      category: b.category,
      limit: b.limit,
      spent: b.spent,
      percentUsed: b.percentUsed,
    }));

  // Chart data
  const chartData = budgets.map((b) => ({
    name: b.category,
    value: b.spent || 0,
  }));

  // Existing categories for form
  const existingCategories = budgets.map((b) => b.category);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
            <span className="text-accent-600 dark:text-accent-400">Budgets</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Set and track spending limits for each category. Your wallet will thank you!
          </p>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <FiPlus className="w-5 h-5 mr-2" />
          Add Budget
        </button>
      </div>

      <BudgetAlert alerts={alerts} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card p-5">
          <p className="text-sm text-accent-700 dark:text-accent-300 uppercase tracking-wider">Total Budget</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white font-display">
            {formatCurrency(summary.totalLimit)}
          </p>
        </div>
        <div className="stat-card p-5">
          <p className="text-sm text-accent-700 dark:text-accent-300 uppercase tracking-wider">Total Spent</p>
          <p className="text-2xl font-bold mt-2 text-danger-600 dark:text-danger-400 font-display">
            {formatCurrency(summary.totalSpent)}
          </p>
        </div>
        <div className="stat-card p-5">
          <p className="text-sm text-accent-700 dark:text-accent-300 uppercase tracking-wider">Remaining</p>
          <p className={`text-2xl font-bold mt-2 font-display ${
            summary.totalLimit - summary.totalSpent >= 0
              ? 'text-success-600 dark:text-success-400'
              : 'text-danger-600 dark:text-danger-400'
          }`}>
            {formatCurrency(summary.totalLimit - summary.totalSpent)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-accent-300 mb-4 uppercase tracking-wider">
            Your Budgets
          </h2>
          <BudgetList
            budgets={budgets}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-accent-300 mb-4 uppercase tracking-wider">
            Spending by Category
          </h2>
          {chartData.length > 0 && chartData.some(d => d.value > 0) ? (
            <ExpensePieChart data={chartData} height={350} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[350px] text-gray-500 dark:text-gray-400">
              <FiPieChart className="w-12 h-12 mb-3 text-accent-500/50" />
              <p className="font-medium">No spending data yet</p>
              <p className="text-sm mt-1 text-center px-4">
                {budgets.length === 0
                  ? 'Create a budget above to get started!'
                  : 'Start adding transactions to see your spending breakdown'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6 bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-500/10 dark:to-primary-500/10 border-accent-200 dark:border-accent-500/30">
        <h3 className="font-semibold text-accent-700 dark:text-accent-400 mb-3">
          Pro Tips from someone who's been there
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-accent-500">*</span>
            Set realistic limits based on your past spending patterns (be honest with yourself!)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-500">*</span>
            Use alerts to get notified before exceeding your budget
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-500">*</span>
            Review and adjust your budgets monthly
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-500">*</span>
            Track your spending regularly to stay on target
          </li>
        </ul>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingBudget ? 'Edit Budget' : 'Create Budget'}
      >
        <BudgetForm
          budget={editingBudget}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={submitting}
          existingCategories={existingCategories}
        />
      </Modal>
    </div>
  );
};

export default Budgets;
