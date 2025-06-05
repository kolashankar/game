/**
 * User Model
 * Defines the Sequelize model for users
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/postgres.config');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preferredRole: {
    type: DataTypes.ENUM('Techno Monk', 'Shadow Broker', 'Chrono Diplomat', 'Bio-Smith'),
    allowNull: true
  },
  totalGamesPlayed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalWins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  karmaScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    // Hash password before saving
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

/**
 * Compare password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Update last login timestamp
 * @returns {Promise<User>} - Updated user
 */
User.prototype.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

/**
 * Increment games played count
 * @returns {Promise<User>} - Updated user
 */
User.prototype.incrementGamesPlayed = async function() {
  this.totalGamesPlayed += 1;
  return await this.save();
};

/**
 * Increment wins count
 * @returns {Promise<User>} - Updated user
 */
User.prototype.incrementWins = async function() {
  this.totalWins += 1;
  return await this.save();
};

/**
 * Update karma score
 * @param {number} karma - Karma points to add (positive or negative)
 * @returns {Promise<User>} - Updated user
 */
User.prototype.updateKarma = async function(karma) {
  this.karmaScore += karma;
  return await this.save();
};

module.exports = {
  User
};
