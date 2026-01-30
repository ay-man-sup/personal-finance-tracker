const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  deleteAccount,
} = require('../controllers/authController');

const { protect, validate, authLimiter, strictLimiter } = require('../middleware');

const { registerSchema, loginSchema } = require('../validators/schemas');

// POST /api/auth/register
router.post('/register', strictLimiter, validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), login);

// POST /api/auth/logout
router.post('/logout', protect, logout);

// GET /api/auth/me
router.get('/me', protect, getMe);

// PUT /api/auth/profile
router.put('/profile', protect, updateProfile);

// PUT /api/auth/password
router.put('/password', protect, authLimiter, updatePassword);

// DELETE /api/auth/account
router.delete('/account', protect, strictLimiter, deleteAccount);

module.exports = router;
