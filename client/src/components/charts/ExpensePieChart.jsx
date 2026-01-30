/**
 * ExpensePieChart Component
 * 
 * Displays expenses by category in a pie chart.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { formatCurrency, getCategoryColor } from '../../utils/helpers';

/**
 * Custom tooltip for pie chart
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-space-800/95 backdrop-blur-lg p-3 rounded-lg shadow-lg border border-gray-200 dark:border-accent-500/30">
        <p className="font-medium text-gray-900 dark:text-white">
          {data.category}
        </p>
        <p className="text-sm text-accent-600 dark:text-accent-400">
          {formatCurrency(data.total)}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {data.percentage}% of total
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Custom legend renderer
 */
const renderLegend = (props) => {
  const { payload } = props;
  
  return (
    <ul className="flex flex-wrap justify-center gap-2 mt-4">
      {payload.map((entry, index) => (
        <li
          key={`legend-${index}`}
          className="flex items-center text-xs text-gray-700 dark:text-gray-300"
        >
          <span
            className="w-3 h-3 rounded-full mr-1"
            style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}` }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
};

/**
 * ExpensePieChart Component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Expense data by category
 */
const ExpensePieChart = ({ data = [] }) => {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.total, 0);

  // Add percentage and color to each item
  const chartData = data.map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.total / total) * 100) : 0,
    color: getCategoryColor(item.category),
  }));

  // No data message
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 dark:text-gray-400">
        No expense data available
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="total"
            nameKey="category"
            label={({ percentage }) => percentage > 5 ? `${percentage}%` : ''}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

ExpensePieChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
    })
  ),
};

export default ExpensePieChart;
