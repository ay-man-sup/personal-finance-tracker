/**
 * BudgetForm Component
 * 
 * Form for creating and editing budgets.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiSave, FiX } from 'react-icons/fi';
import { EXPENSE_CATEGORIES } from '../../utils/helpers';

/**
 * Initial form state
 */
const initialFormState = {
  category: '',
  limit: '',
  period: 'monthly',
  alertThreshold: 80,
  alertsEnabled: true,
  color: '#3B82F6',
  notes: '',
};

/**
 * Color options for budgets
 */
const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

/**
 * BudgetForm Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.budget - Budget to edit (null for new)
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.loading - Loading state
 * @param {Array} props.existingCategories - Categories that already have budgets
 */
const BudgetForm = ({
  budget = null,
  onSubmit,
  onCancel,
  loading = false,
  existingCategories = [],
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        limit: budget.limit.toString(),
        period: budget.period || 'monthly',
        alertThreshold: budget.alertThreshold ?? 80,
        alertsEnabled: budget.alertsEnabled ?? true,
        color: budget.color || '#3B82F6',
        notes: budget.notes || '',
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [budget]);

  /**
   * Get available categories (filter out existing ones when creating)
   */
  const availableCategories = budget
    ? EXPENSE_CATEGORIES
    : EXPENSE_CATEGORIES.filter((cat) => !existingCategories.includes(cat));

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate form
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      newErrors.limit = 'Please enter a valid budget limit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      category: formData.category,
      limit: parseFloat(formData.limit),
      period: formData.period,
      alertThreshold: parseInt(formData.alertThreshold),
      alertsEnabled: formData.alertsEnabled,
      color: formData.color,
      notes: formData.notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category */}
      <div>
        <label htmlFor="category" className="label">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={!!budget}
          className={`input ${errors.category ? 'input-error' : ''} ${
            budget ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <option value="">Select a category</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.category}</p>
        )}
        {!budget && availableCategories.length === 0 && (
          <p className="mt-1 text-sm text-warning-600 dark:text-warning-400">
            All categories already have budgets set.
          </p>
        )}
      </div>

      {/* Budget Limit */}
      <div>
        <label htmlFor="limit" className="label">
          Monthly Budget Limit
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-600 dark:text-accent-500 font-bold">
            $
          </span>
          <input
            type="number"
            id="limit"
            name="limit"
            value={formData.limit}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className={`input pl-7 ${errors.limit ? 'input-error' : ''}`}
          />
        </div>
        {errors.limit && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.limit}</p>
        )}
      </div>

      {/* Period */}
      <div>
        <label htmlFor="period" className="label">
          Budget Period
        </label>
        <select
          id="period"
          name="period"
          value={formData.period}
          onChange={handleChange}
          className="input"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Alert Threshold */}
      <div>
        <label htmlFor="alertThreshold" className="label">
          Alert Threshold: {formData.alertThreshold}%
        </label>
        <input
          type="range"
          id="alertThreshold"
          name="alertThreshold"
          value={formData.alertThreshold}
          onChange={handleChange}
          min="50"
          max="100"
          step="5"
          className="w-full h-2 bg-gray-200 dark:bg-space-600 rounded-lg appearance-none cursor-pointer accent-accent-500"
        />
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-500">
          Get warned when spending reaches this percentage of your budget.
        </p>
      </div>

      {/* Alerts Enabled */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="alertsEnabled"
          name="alertsEnabled"
          checked={formData.alertsEnabled}
          onChange={handleChange}
          className="w-4 h-4 text-accent-500 bg-white dark:bg-space-700 border-gray-300 dark:border-accent-500/30 rounded focus:ring-accent-500"
        />
        <label
          htmlFor="alertsEnabled"
          className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Enable budget alerts
        </label>
      </div>

      {/* Color Picker */}
      <div>
        <label className="label">Color</label>
        <div className="flex space-x-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, color }))}
              className={`w-8 h-8 rounded-full transition-all duration-300 ${
                formData.color === color
                  ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-space-800 ring-gray-900 dark:ring-white scale-110'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color, boxShadow: formData.color === color ? `0 0 12px ${color}` : 'none' }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="label">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add notes about this budget..."
          rows={2}
          maxLength={200}
          className="input resize-none"
        />
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
          className="btn-primary"
          disabled={loading || (!budget && availableCategories.length === 0)}
        >
          <FiSave className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : budget ? 'Update' : 'Create'} Budget
        </button>
      </div>
    </form>
  );
};

BudgetForm.propTypes = {
  budget: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  existingCategories: PropTypes.array,
};

export default BudgetForm;
