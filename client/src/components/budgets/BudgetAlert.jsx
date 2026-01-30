import React from 'react';
import PropTypes from 'prop-types';
import { FiAlertTriangle, FiAlertCircle, FiX } from 'react-icons/fi';
import { formatCurrency } from '../../utils/helpers';

const BudgetAlert = ({ alerts = [], onDismiss }) => {
  if (!alerts.length) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert, index) => {
        const isExceeded = alert.type === 'exceeded';
        
        return (
          <div
            key={`${alert.category}-${index}`}
            className={`flex items-start justify-between p-4 rounded-xl border animate-fade-in backdrop-blur ${
              isExceeded
                ? 'bg-danger-100 dark:bg-danger-500/10 border-danger-300 dark:border-danger-500/30'
                : 'bg-warning-100 dark:bg-warning-500/10 border-warning-300 dark:border-warning-500/30'
            }`}
          >
            <div className="flex items-start space-x-3">
              {isExceeded ? (
                <FiAlertCircle className="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
              ) : (
                <FiAlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
              )}
              
              <div>
                <p
                  className={`font-medium ${
                    isExceeded
                      ? 'text-danger-700 dark:text-danger-300'
                      : 'text-warning-700 dark:text-warning-300'
                  }`}
                >
                  {alert.category} Budget {isExceeded ? 'Exceeded!' : 'Alert'}
                </p>
                <p
                  className={`text-sm ${
                    isExceeded
                      ? 'text-danger-600 dark:text-danger-400'
                      : 'text-warning-600 dark:text-warning-400'
                  }`}
                >
                  {formatCurrency(alert.spent)} spent of {formatCurrency(alert.limit)} ({alert.percentUsed}%)
                </p>
              </div>
            </div>

            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.category)}
                className={`p-1.5 rounded-lg transition-all duration-300 border border-transparent ${
                  isExceeded
                    ? 'text-danger-600 dark:text-danger-400 hover:bg-danger-200 dark:hover:bg-danger-500/20 hover:border-danger-300 dark:hover:border-danger-500/30'
                    : 'text-warning-600 dark:text-warning-400 hover:bg-warning-200 dark:hover:bg-warning-500/20 hover:border-warning-300 dark:hover:border-warning-500/30'
                }`}
                aria-label="Dismiss alert"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

BudgetAlert.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['exceeded', 'warning']).isRequired,
      category: PropTypes.string.isRequired,
      limit: PropTypes.number.isRequired,
      spent: PropTypes.number.isRequired,
      percentUsed: PropTypes.number.isRequired,
    })
  ),
  onDismiss: PropTypes.func,
};

export default BudgetAlert;
