import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiSave, FiX } from 'react-icons/fi';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, formatDateForInput } from '../../utils/helpers';

const initialFormState = {
  type: 'expense',
  category: '',
  amount: '',
  date: formatDateForInput(new Date()),
  description: '',
};

const TransactionForm = ({
  transaction = null,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount.toString(),
        date: formatDateForInput(transaction.date),
        description: transaction.description || '',
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [transaction]);

  const categories = formData.type === 'income' 
    ? INCOME_CATEGORIES 
    : EXPENSE_CATEGORIES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'type' && { category: '' }),
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      description: formData.description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Transaction Type</label>
        <div className="flex space-x-6">
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={handleChange}
              className="w-4 h-4 text-danger-500 focus:ring-danger-500 bg-white dark:bg-space-700 border-gray-300 dark:border-accent-500/30"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-danger-500 dark:group-hover:text-danger-400 transition-colors">
              Expense
            </span>
          </label>
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="type"
              value="income"
              checked={formData.type === 'income'}
              onChange={handleChange}
              className="w-4 h-4 text-success-500 focus:ring-success-500 bg-white dark:bg-space-700 border-gray-300 dark:border-accent-500/30"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-success-500 dark:group-hover:text-success-400 transition-colors">
              Income
            </span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="category" className="label">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`input ${errors.category ? 'input-error' : ''}`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.category}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="label">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-600 dark:text-accent-500 font-bold">
            $
          </span>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className={`input pl-7 ${errors.amount ? 'input-error' : ''}`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.amount}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="label">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          max={formatDateForInput(new Date())}
          className={`input ${errors.date ? 'input-error' : ''}`}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.date}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="label">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add notes about this transaction..."
          rows={3}
          maxLength={500}
          className="input resize-none"
        />
        <p className="mt-1 text-xs text-gray-500 text-right">
          {formData.description.length}/500
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-accent-500/20">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          <FiX className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          className={`btn ${
            formData.type === 'income' ? 'btn-success' : 'btn-primary'
          }`}
          disabled={loading}
        >
          <FiSave className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : transaction ? 'Update' : 'Add'} Transaction
        </button>
      </div>
    </form>
  );
};

TransactionForm.propTypes = {
  transaction: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default TransactionForm;
