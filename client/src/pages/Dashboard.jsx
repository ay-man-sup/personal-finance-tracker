import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign, 
  FiPieChart,
  FiPlus,
  FiArrowRight 
} from 'react-icons/fi';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { budgetAPI } from '../services/api';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import BalanceLineChart from '../components/charts/BalanceLineChart';
import BudgetAlert from '../components/budgets/BudgetAlert';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions, summary, loading: transLoading, fetchTransactions, fetchSummary } = useTransactions();
  
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchTransactions(),
          fetchSummary('month')
        ]);
        
        // Fetch budget status for alerts
        const response = await budgetAPI.getWithStatus();
        const budgets = response.data.data || [];
        const alerts = budgets
          .filter(b => b.alertsEnabled && (b.isExceeded || b.isAlertTriggered))
          .map(b => ({
            type: b.isExceeded ? 'exceeded' : 'warning',
            category: b.category,
            limit: b.limit,
            spent: b.spent,
            percentUsed: b.percentUsed,
          }));
        setBudgetAlerts(alerts);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchTransactions, fetchSummary]);

  const handleDismissAlert = (category) => {
    setDismissedAlerts((prev) => [...prev, category]);
  };

  const activeAlerts = budgetAlerts.filter(
    (a) => !dismissedAlerts.includes(a.category)
  );

  const recentTransactions = transactions.slice(0, 5);

  const safeSummary = summary || { balance: 0, income: 0, expenses: 0, expensesByCategory: [], trend: [] };

  if (loading || transLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
            Welcome back, <span className="text-accent-600 dark:text-accent-400">{user?.name?.split(' ')[0]}</span>! 
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's your financial overview for this month.
          </p>
        </div>
        <Link
          to="/transactions"
          className="btn-primary mt-4 sm:mt-0"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Add Transaction
        </Link>
      </div>

      <BudgetAlert alerts={activeAlerts} onDismiss={handleDismissAlert} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card p-5 hover:animate-pulse-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                Current Balance
              </p>
              <p className={`text-2xl font-bold mt-2 font-display ${
                safeSummary.balance >= 0
                  ? 'text-gray-900 dark:text-white'
                  : 'text-danger-400'
              }`}>
                {formatCurrency(safeSummary.balance)}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-500/20 to-primary-500/20 border border-accent-500/30 flex items-center justify-center">
              <FiDollarSign className="w-7 h-7 text-accent-600 dark:text-accent-400" />
            </div>
          </div>
        </div>

        <div className="stat-card p-5 hover:animate-pulse-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                Total Income
              </p>
              <p className="text-2xl font-bold mt-2 text-success-600 dark:text-success-400 font-display">
                {formatCurrency(safeSummary.income)}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-success-500/20 border border-success-500/30 flex items-center justify-center">
              <FiTrendingUp className="w-7 h-7 text-success-600 dark:text-success-400" />
            </div>
          </div>
        </div>

        <div className="stat-card p-5 hover:animate-pulse-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                Total Expenses
              </p>
              <p className="text-2xl font-bold mt-2 text-danger-600 dark:text-danger-400 font-display">
                {formatCurrency(safeSummary.expenses)}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-danger-500/20 border border-danger-500/30 flex items-center justify-center">
              <FiTrendingDown className="w-7 h-7 text-danger-600 dark:text-danger-400" />
            </div>
          </div>
        </div>

        <div className="stat-card p-5 hover:animate-pulse-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                Transactions
              </p>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white font-display">
                {transactions.length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
              <FiPieChart className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-accent-300 mb-4 uppercase tracking-wider">
            Expense Breakdown
          </h2>
          <ExpensePieChart 
            data={safeSummary.expensesByCategory || []} 
            height={280}
          />
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-accent-300 mb-4 uppercase tracking-wider">
            Balance Trend
          </h2>
          <BalanceLineChart 
            transactions={transactions} 
            height={280}
          />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-accent-300 uppercase tracking-wider">
            Recent Transactions
          </h2>
          <Link
            to="/transactions"
            className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-500 dark:hover:text-accent-300 flex items-center transition-colors"
          >
            View All
            <FiArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-space-700/50 border border-gray-200 dark:border-accent-500/10 hover:border-accent-500/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-success-500/20 border border-success-500/30'
                        : 'bg-danger-500/20 border border-danger-500/30'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <FiTrendingUp className="w-5 h-5 text-success-600 dark:text-success-400" />
                    ) : (
                      <FiTrendingDown className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.category} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold font-display ${
                    transaction.type === 'income'
                      ? 'text-success-600 dark:text-success-400'
                      : 'text-danger-600 dark:text-danger-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-accent-500/20 rounded-xl">
            <FiDollarSign className="w-12 h-12 mx-auto text-gray-400 dark:text-accent-500/50 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No transactions yet. Start by adding your first transaction!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
