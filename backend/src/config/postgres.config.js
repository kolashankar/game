/**
 * PostgreSQL Configuration
 * Sets up connection to PostgreSQL database using Sequelize
 */

const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Create Sequelize instance
let sequelize;

// Check if DATABASE_URL is provided (used in docker-compose)
if (process.env.DATABASE_URL) {
  logger.info('Using DATABASE_URL for PostgreSQL connection');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  });
} else {
  
  //no need to change anything beacuse the render.com only takes the url
  // Use individual connection parameters
  logger.info('Using individual parameters for PostgreSQL connection');
  sequelize = new Sequelize(
    process.env.POSTGRES_DB || 'postgres',
    process.env.POSTGRES_USER || 'postgres',
    process.env.POSTGRES_PASSWORD || 'root',
    {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      dialect: 'postgres',
      logging: (msg) => logger.debug(msg),
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

/**
 * Connect to PostgreSQL database
 * @returns {Promise<void>}
 */
const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connection established successfully');
    
    // Import and sync models after connection is established
    const { syncModels } = require('../models');
    
    // Sync models with database (in development mode)
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      // Force sync to recreate all tables - use with caution in production
      // This will drop all tables and recreate them
      // Only use this during initial development or when schema changes significantly
      const forceSync = process.env.FORCE_DB_SYNC === 'true';
      
      // Use force: true only when explicitly set in environment
      // Otherwise use alter: true which is safer
      if (forceSync) {
        logger.warn('Forcing database sync - all tables will be dropped and recreated');
        await syncModels(true);
        logger.info('Database models force synchronized');
      } else {
        // Use alter mode which attempts to modify existing tables
        await syncModels(false);
        logger.info('Database models synchronized with alter mode');
      }
    }
  } catch (error) {
    logger.error('Unable to connect to PostgreSQL database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectPostgres
};