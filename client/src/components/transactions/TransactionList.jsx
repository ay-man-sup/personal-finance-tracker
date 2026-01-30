import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiChevronDown, FiChevronUp, FiDollarSign } from 'react-icons/fi';
import TransactionItem from './TransactionItem';
import Loader from '../common/Loader';

const TransactionList = ({
  transactions = [],
  loading = false,
  onEdit,
  onDelete,
}) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <FiChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <FiChevronDown className="w-4 h-4 ml-1" />
    );
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="lg" />
      </div>
    );
  }

  // Empty state
  if (!transactions.length) {
    return (
      <div className="text-center py-12 border border-dashed border-accent-500/20 rounded-xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-accent-500/10 border border-accent-500/30 rounded-full flex items-center justify-center">
          <FiDollarSign className="w-8 h-8 text-accent-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-1">
          No transactions yet
        </h3>
        <p className="text-gray-400">
          Start by adding your first income or expense.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-accent-500/20">
      <table className="table w-full">
        <thead>
          <tr>
            <th
              className="cursor-pointer hover:bg-accent-500/10 transition-colors"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center text-accent-300">
                Date
                <SortIcon field="date" />
              </div>
            </th>
            <th className="text-accent-300">Type</th>
            <th
              className="cursor-pointer hover:bg-accent-500/10 transition-colors"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center text-accent-300">
                Category
                <SortIcon field="category" />
              </div>
            </th>
            <th className="hidden sm:table-cell text-accent-300">Description</th>
            <th
              className="cursor-pointer hover:bg-accent-500/10 transition-colors text-right"
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center justify-end text-accent-300">
                Amount
                <SortIcon field="amount" />
              </div>
            </th>
            <th className="text-right text-accent-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((transaction) => (
            <TransactionItem
              key={transaction._id}
              transaction={transaction}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

TransactionList.propTypes = {
  transactions: PropTypes.array,
  loading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TransactionList;
