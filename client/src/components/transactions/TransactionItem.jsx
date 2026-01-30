/**
 * TransactionItem Component
 * 
 * Single transaction row in the transaction list.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { formatCurrency, formatDate, truncateText } from '../../utils/helpers';

/**
 * TransactionItem Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.transaction - Transaction data
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 */
const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const { _id, type, category, amount, date, description } = transaction;

  const isIncome = type === 'income';

  return (
    <tr className="group hover:bg-accent-500/5 transition-colors">
      {/* Date */}
      <td className="text-sm text-gray-600 dark:text-gray-400">
        {formatDate(date)}
      </td>

      {/* Type Badge */}
      <td>
        <span className={isIncome ? 'badge-income' : 'badge-expense'}>
          {isIncome ? 'Income' : 'Expense'}
        </span>
      </td>

      {/* Category */}
      <td className="text-sm font-medium text-gray-900 dark:text-white">
        {category}
      </td>

      {/* Description (hidden on mobile) */}
      <td className="hidden sm:table-cell text-sm text-gray-600 dark:text-gray-400">
        {truncateText(description, 40) || '-'}
      </td>

      {/* Amount */}
      <td
        className={`text-right text-sm font-semibold font-display ${
          isIncome
            ? 'text-success-600 dark:text-success-400'
            : 'text-danger-600 dark:text-danger-400'
        }`}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(amount)}
      </td>

      {/* Actions */}
      <td className="text-right">
        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-500/10 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            aria-label="Edit transaction"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(_id)}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-500/10 border border-transparent hover:border-danger-500/30 transition-all duration-300"
            aria-label="Delete transaction"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

TransactionItem.propTypes = {
  transaction: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['income', 'expense']).isRequired,
    category: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TransactionItem;
