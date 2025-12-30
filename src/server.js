/**
 * Server Entry Point
 * 
 * Initializes database connection and starts the HTTP server.
 * Handles graceful shutdown and process-level error handling.
 */

// Load environment variables from .env file
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const appConfig = require('./config/app');

/**
 * Initialize and start the server
 * Connects to database before starting HTTP listener
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start HTTP server
    const server = app.listen(appConfig.port, () => {
      console.log(`Server running in ${appConfig.nodeEnv} mode on port ${appConfig.port}`);
      console.log(`Health check: http://localhost:${appConfig.port}/health`);
    });
    
    /**
     * Handle graceful shutdown
     * Closes server and waits for connections to drain
     * 
     * @param {string} signal - Process signal received
     */
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds if connections don't close
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
