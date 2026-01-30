import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiDollarSign, 
  FiPieChart, 
  FiLogOut, 
  FiSun, 
  FiMoon,
  FiMenu,
  FiX,
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/transactions', label: 'Transactions', icon: FiDollarSign },
  { to: '/budgets', label: 'Budgets', icon: FiPieChart },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActiveLink = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-space-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-accent-500/20 shadow-lg shadow-gray-200/50 dark:shadow-accent-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <img 
                src="/images/JALIL-tech-logo.jpg" 
                alt="JALIL TECH" 
                className="w-10 h-10 rounded-lg shadow-glow group-hover:shadow-glow-lg transition-all duration-300 object-cover"
              />
              <span className="text-lg font-bold hidden sm:block font-display text-accent-600 dark:text-accent-400">
                JALIL TECH
              </span>
            </Link>

            <div className="hidden md:flex ml-10 space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.to);
                
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-accent-500/20 text-accent-600 dark:text-accent-400 border border-accent-500/30 shadow-glow'
                        : 'text-gray-600 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-500/10 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-500/10 border border-transparent hover:border-accent-500/30 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <FiSun className="w-5 h-5" />
              ) : (
                <FiMoon className="w-5 h-5" />
              )}
            </button>

            <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-accent-500/20">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-500/20 to-primary-500/20 border border-accent-500/30 rounded-full flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-danger-400 hover:bg-danger-500/10 border border-transparent hover:border-danger-500/30 transition-all duration-300"
                aria-label="Logout"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-accent-400 hover:bg-accent-500/10 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 dark:border-accent-500/20 animate-fade-in bg-gray-50 dark:bg-space-800/50 backdrop-blur-lg rounded-b-xl">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-500/20 to-primary-500/20 border border-accent-500/30 rounded-full flex items-center justify-center">
                <FiUser className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.to);
                
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-accent-500/20 text-accent-600 dark:text-accent-400 border border-accent-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-500/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 mt-2 rounded-lg text-sm font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-500/10 border border-transparent hover:border-danger-500/30 transition-all duration-300"
            >
              <FiLogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
