/**
 * Database Initialization
 * Sets up database connections and initializes models
 */

const { sequelize } = require('../config/postgres.config');
const mongoose = require('mongoose');
const { syncModels } = require('./models'); // Import syncModels function
const logger = require('../utils/logger');

/**
 * Initialize the PostgreSQL database
 * @returns {Promise} Resolves when database is initialized
 */
const initializePostgres = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    logger.info('PostgreSQL connection established successfully');

    // Sync models with database using the proper order
    // In production, use migrations instead of sync
    if (process.env.NODE_ENV !== 'production') {
      // Use syncModels instead of sequelize.sync to ensure proper table creation order
      await syncModels(true); // force: true for development to recreate tables
      logger.info('PostgreSQL models synchronized in correct order');
    } else {
      // In production, just sync without force to preserve data
      await syncModels(false);
      logger.info('PostgreSQL models synchronized');
    }

    return true;
  } catch (error) {
    logger.error('Unable to connect to PostgreSQL database:', error);
    throw error;
  }
};

/**
 * Initialize the MongoDB database
 * @returns {Promise} Resolves when database is initialized
 */
const initializeMongoDB = async () => {
  try {
    // Get MongoDB URI from environment
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chronocore';

    // Set up connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    };

    // Connect to MongoDB
    await mongoose.connect(mongoURI, options);
    logger.info('MongoDB connection established successfully');

    return true;
  } catch (error) {
    logger.error('Unable to connect to MongoDB database:', error);
    throw error;
  }
};

/**
 * Initialize all databases
 * @returns {Promise} Resolves when all databases are initialized
 */
const initializeDatabase = async () => {
  try {
    // Initialize PostgreSQL
    await initializePostgres();

    // Initialize MongoDB
    await initializeMongoDB();

    logger.info('All database connections established successfully');
    return true;
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

/**
 * Close all database connections gracefully
 * @returns {Promise} Resolves when all connections are closed
 */
const closeDatabaseConnections = async () => {
  try {
    // Close PostgreSQL connection
    await sequelize.close();
    logger.info('PostgreSQL connection closed');

    // Close MongoDB connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');

    logger.info('All database connections closed successfully');
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  initializePostgres,
  initializeMongoDB,
  closeDatabaseConnections
};