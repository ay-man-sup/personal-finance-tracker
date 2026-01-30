/**
 * BalanceLineChart Component
 * 
 * Displays income, expenses, and balance over time.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { formatCurrency, getShortMonthName } from '../../utils/helpers';

/**
 * Custom tooltip
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-space-800/95 backdrop-blur-lg p-3 rounded-lg shadow-lg border border-gray-200 dark:border-accent-500/30">
        <p className="font-medium text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * BalanceLineChart Component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Monthly summary data
 */
const BalanceLineChart = ({ data = [] }) => {
  // Format data for chart
  const chartData = data.map((item) => ({
    name: `${getShortMonthName(item.month)} ${item.year}`,
    Income: item.income,
    Expenses: item.expense,
    Balance: item.balance,
  }));

  // No data message
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 dark:text-gray-400">
        No data available for the selected period
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#06b6d4" 
            opacity={0.1}
          />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            stroke="#06b6d4"
            strokeOpacity={0.3}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            stroke="#06b6d4"
            strokeOpacity={0.3}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="Balance"
            fill="#06b6d4"
            fillOpacity={0.1}
            stroke="#06b6d4"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="Income"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#22c55e', stroke: '#22c55e', strokeWidth: 2, filter: 'drop-shadow(0 0 4px #22c55e)' }}
          />
          <Line
            type="monotone"
            dataKey="Expenses"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#ef4444', stroke: '#ef4444', strokeWidth: 2, filter: 'drop-shadow(0 0 4px #ef4444)' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

BalanceLineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.number.isRequired,
      month: PropTypes.number.isRequired,
      income: PropTypes.number.isRequired,
      expense: PropTypes.number.isRequired,
      balance: PropTypes.number.isRequired,
    })
  ),
};

export default BalanceLineChart;
