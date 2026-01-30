/**
 * Authentication Routes
 * 
 * Handles user registration, login, logout, and profile management.
 * Includes rate limiting on sensitive endpoints.
 */

const express = require('express');
const router = express.Router();

// Controllers
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  deleteAccount,
} = require('../controllers/authController');

// Middleware
const { protect, validate, authLimiter, strictLimiter } = require('../middleware');

// Validation schemas
const { registerSchema, loginSchema } = require('../validators/schemas');

/**
 * Public routes
 */

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', strictLimiter, validate(registerSchema), register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, validate(loginSchema), login);

/**
 * Protected routes (require authentication)
 */

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update profile (name, currency)
// @access  Private
router.put('/profile', protect, updateProfile);

// @route   PUT /api/auth/password
// @desc    Update password
// @access  Private
router.put('/password', protect, authLimiter, updatePassword);

// @route   DELETE /api/auth/account
// @desc    Delete account (requires password confirmation)
// @access  Private
router.delete('/account', protect, strictLimiter, deleteAccount);

module.exports = router;
