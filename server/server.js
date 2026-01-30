/**
 * Personal Finance Tracker - Server Entry Point
 * 
 * Main Express server configuration with security middleware,
 * route mounting, and error handling.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

// Database connection
const connectDB = require('./config/db');

// Routes
const { authRoutes, transactionRoutes, budgetRoutes } = require('./routes');

// Middleware
const { errorHandler, notFound, apiLimiter } = require('./middleware');

// Initialize Express app
const app = express();

/**
 * Security Middleware
 */

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Enable CORS with credentials
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());

/**
 * Body Parsing Middleware
 */

// Parse JSON bodies
app.use(express.json({ limit: '10kb' })); // Limit body size for security

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse cookies
app.use(cookieParser());

/**
 * Rate Limiting
 * Applied globally, with stricter limits on auth routes
 */
app.use('/api', apiLimiter);

/**
 * API Routes
 */

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);

/**
 * Error Handling
 */

// Handle 404 - Route not found
app.use(notFound);

// Global error handler
app.use(errorHandler);

/**
 * Server Initialization
 */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`
🚀 Server running in ${process.env.NODE_ENV || 'development'} mode
📡 Listening on port ${PORT}
🔗 API URL: http://localhost:${PORT}/api
      `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error(`❌ Uncaught Exception: ${err.message}`);
      process.exit(1);
    });

  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for testing
module.exports = app;
