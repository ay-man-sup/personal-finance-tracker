import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useFunPopup } from '../context/FunPopupContext';
import Loader from '../components/common/Loader';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const { showPopup } = useFunPopup();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Where to redirect after successful login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const success = await login({
        email: formData.email,
        password: formData.password,
      });
      if (success) {
        showPopup('login');
        // Brief delay so popup is visible before navigation
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      }
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-space-900 dark:to-space-800">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <img 
            src="/images/JALIL-tech-logo.jpg" 
            alt="JALIL TECH" 
            className="w-20 h-20 mx-auto rounded-xl shadow-lg"
          />
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your money missed you. Let's see what's been happening!
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="p-4 rounded-lg bg-danger-500/10 border border-danger-500/30">
                <p className="text-sm text-danger-600 dark:text-danger-400">
                  {submitError}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-500">
                  <FiMail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-500">
                  <FiLock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center"
            >
              {loading ? (
                <Loader size="sm" />
              ) : (
                <>
                  <FiLogIn className="w-5 h-5 mr-2" />
                  leessssssgooooooooo
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              New here?{' '}
              <Link
                to="/register"
                className="font-medium text-accent-600 dark:text-accent-400 hover:text-accent-500 dark:hover:text-accent-300 transition-colors"
              >
                Create an account, it's free!
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-500">
          Your data is safe with us. We care about your privacy.
        </p>
      </div>
    </div>
  );
};

export default Login;
