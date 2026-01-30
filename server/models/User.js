const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    // Last login timestamp
    lastLogin: {
      type: Date,
    },
  },
  {
    // Enable virtual properties in JSON output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Pre-save middleware to hash password
 * Only runs when password is modified
 */
userSchema.pre('save', async function (next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt with 10 rounds (industry standard)
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare entered password with hashed password
 * 
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method to generate JWT token for authentication
 * 
 * @returns {string} - Signed JWT token
 */
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Virtual property to get user's transactions
 * Enables population of transactions without storing references
 */
userSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

/**
 * Virtual property to get user's budgets
 */
userSchema.virtual('budgets', {
  ref: 'Budget',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});


const User = mongoose.model('User', userSchema);

module.exports = User;
