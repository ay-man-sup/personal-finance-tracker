// Auth controller - registration, login, logout, and profile management

const User = require('../models/User');
const { asyncHandler, ApiError } = require('../middleware');

// Cookie config: httpOnly prevents XSS, sameSite prevents CSRF
const getCookieOptions = () => ({
  expires: new Date(
    Date.now() + (parseInt(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();

  res
    .status(statusCode)
    .cookie('token', token, getCookieOptions())
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt,
      },
    });
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, currency } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  
  if (existingUser) {
    throw new ApiError('An account with this email already exists', 400);
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    currency: currency || 'USD',
  });

  sendTokenResponse(user, 201, res);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Include password field (excluded by default in schema)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new ApiError('Invalid email or password', 401);
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new ApiError('Invalid email or password', 401);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  // Expire the cookie immediately
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
});

// PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, currency } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (currency) fieldsToUpdate.currency = currency;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
    },
  });
});

// PUT /api/auth/password
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);
  
  if (!isMatch) {
    throw new ApiError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// DELETE /api/auth/account
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  const isMatch = await user.matchPassword(password);
  
  if (!isMatch) {
    throw new ApiError('Password is incorrect', 401);
  }

  // Clean up user's data before deleting account
  const Transaction = require('../models/Transaction');
  const Budget = require('../models/Budget');
  
  await Transaction.deleteMany({ user: req.user.id });
  await Budget.deleteMany({ user: req.user.id });
  await user.deleteOne();

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  deleteAccount,
};
