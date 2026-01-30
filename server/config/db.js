/**
 * Database Configuration
 * 
 * This module handles MongoDB connection using Mongoose.
 * It includes connection retry logic and event handlers for
 * monitoring connection status.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * 
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Mongoose connection options for optimal performance and reliability
    const options = {
      // Use the new URL parser
      // These are now default in Mongoose 6+, but explicitly set for clarity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if server not found
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
