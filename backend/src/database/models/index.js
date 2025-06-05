/**
 * Database Models Index
 * Initializes and exports all database models
 */

const fs = require('fs');
const path = require('path');
const { sequelize } = require('../../config/postgres.config');
const logger = require('../../utils/logger');

const db = {};

// Read all model files and import them
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
    logger.debug(`Loaded model: ${model.name}`);
  });

// Set up associations between models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    logger.debug(`Set up associations for model: ${modelName}`);
  }
});

db.sequelize = sequelize;

module.exports = db;
