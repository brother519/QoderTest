/**
 * Database Configuration
 * 
 * MongoDB connection setup using Mongoose.
 * Handles connection, error handling, and graceful shutdown.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * 
 * Features:
 * - Automatic reconnection on disconnection
 * - Graceful shutdown on SIGINT
 * - Error logging
 * 
 * @returns {Promise<mongoose.Connection>} - Mongoose connection object
 */
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment or use default
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-system';
    
    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });
    
    // Log disconnection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Graceful shutdown on application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
