/**
 * MongoDB Configuration
 * Sets up connection to MongoDB database using Mongoose
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
};

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectMongoDB = async () => {
  try {
    // Check if MongoDB is required
    const mongoRequired = process.env.MONGODB_REQUIRED === 'true';
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chronocore';
    
    try {
      await mongoose.connect(uri, options);
      logger.info('MongoDB connection established successfully');
    } catch (error) {
      logger.warn('Unable to connect to MongoDB database:', error);
      
      // If MongoDB is required, throw the error; otherwise, continue
      if (mongoRequired) {
        throw error;
      } else {
        logger.info('Continuing without MongoDB as it is not required');
      }
    }
  } catch (error) {
    logger.error('Error in MongoDB connection process:', error);
    throw error;
  }
};

module.exports = {
  mongoose,
  connectMongoDB
};
