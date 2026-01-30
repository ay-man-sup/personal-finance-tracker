/**
 * BudgetList Component
 * 
 * Displays all budgets with progress bars and status.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FiEdit2, FiTrash2, FiAlertTriangle, FiPieChart } from 'react-icons/fi';
import { formatCurrency } from '../../utils/helpers';
import Loader from '../common/Loader';

/**
 * BudgetList Component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.budgets - List of budgets with spending data
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 */
const BudgetList = ({
  budgets = [],
  loading = false,
  onEdit,
  onDelete,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="lg" />
      </div>
    );
  }

  // Empty state
  if (!budgets.length) {
    return (
      <div className="text-center py-12 border border-dashed border-accent-500/20 rounded-xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-accent-500/10 border border-accent-500/30 rounded-full flex items-center justify-center">
          <FiPieChart className="w-8 h-8 text-accent-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-1">
          No budgets set
        </h3>
        <p className="text-gray-400">
          Create a budget to start tracking your spending.
        </p>
      </div>
    );
  }

  /**
   * Get progress bar color based on percentage
   */
  const getProgressColor = (percent, isExceeded) => {
    if (isExceeded) return 'bg-gradient-to-r from-danger-500 to-danger-400';
    if (percent >= 80) return 'bg-gradient-to-r from-warning-500 to-warning-400';
    return 'bg-gradient-to-r from-success-500 to-success-400';
  };

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const progressColor = getProgressColor(budget.percentUsed, budget.isExceeded);
        const progressWidth = Math.min(budget.percentUsed, 100);

        return (
          <div
            key={budget._id || budget.category}
            className="p-4 bg-gray-50 dark:bg-space-700/50 border border-gray-200 dark:border-accent-500/20 rounded-xl group hover:border-accent-500/40 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              {/* Category and Status */}
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{ backgroundColor: budget.color || '#06b6d4', boxShadow: `0 0 10px ${budget.color || '#06b6d4'}50` }}
                />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {budget.category}
                </h3>
                {budget.isExceeded && (
                  <span className="flex items-center text-xs text-danger-600 dark:text-danger-400 px-2 py-0.5 bg-danger-500/10 border border-danger-500/30 rounded-full">
                    <FiAlertTriangle className="w-3 h-3 mr-1" />
                    Exceeded
                  </span>
                )}
                {!budget.isExceeded && budget.isAlertTriggered && (
                  <span className="flex items-center text-xs text-warning-600 dark:text-warning-400 px-2 py-0.5 bg-warning-500/10 border border-warning-500/30 rounded-full">
                    <FiAlertTriangle className="w-3 h-3 mr-1" />
                    Near limit
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(budget)}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-500/10 border border-transparent hover:border-accent-500/30 transition-all duration-300"
                  aria-label="Edit budget"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(budget.category)}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-500/10 border border-transparent hover:border-danger-500/30 transition-all duration-300"
                  aria-label="Delete budget"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="h-3 bg-gray-200 dark:bg-space-600 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColor} transition-all duration-300 rounded-full`}
                  style={{ width: `${progressWidth}%`, boxShadow: '0 0 10px currentColor' }}
                />
              </div>
            </div>

            {/* Amount Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {formatCurrency(budget.spent)} spent
              </span>
              <span className="font-medium text-gray-900 dark:text-white font-display">
                {formatCurrency(budget.limit)} budget
              </span>
            </div>

            {/* Remaining */}
            <div className="mt-1 text-xs">
              {budget.isExceeded ? (
                <span className="text-danger-600 dark:text-danger-400">
                  Over by {formatCurrency(budget.spent - budget.limit)}
                </span>
              ) : (
                <span className="text-gray-500">
                  {formatCurrency(budget.remaining)} remaining ({100 - budget.percentUsed}%)
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

BudgetList.propTypes = {
  budgets: PropTypes.array,
  loading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default BudgetList;
