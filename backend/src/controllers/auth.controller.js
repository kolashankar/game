/**
 * Authentication Controller
 * Handles user registration, login, and token management
 */

const jwt = require('jsonwebtoken');
const db = require('../database/models');
const logger = require('../utils/logger');
const { sequelize } = require('../config/postgres.config');

const { User } = db;

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      username: user.username,
      role: user.role 
    },
    process.env.JWT_SECRET || 'chronocore_secret_key',
    { expiresIn: '24h' }
  );
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, preferredRole } = req.body;

    logger.info(`Attempting to register user: ${username}, ${email}`);

    // Check if User model is available
    if (!User) {
      logger.error('User model is not defined');
      return res.status(500).json({
        success: false,
        message: 'Internal server error: User model not available'
      });
    }

    // Check if user already exists
    try {
      const Op = require('sequelize').Op;
      const existingUser = await User.findOne({ 
        where: { 
          [Op.or]: [{ username }, { email }] 
        } 
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists'
        });
      }
    } catch (err) {
      logger.error('Error checking for existing user:', err);
      return res.status(500).json({
        success: false,
        message: 'Error checking for existing user'
      });
    }

    // Create new user
    try {
      const user = await User.create({
        username,
        email,
        password,
        preferredRole
      });

      // Generate token
      const token = generateToken(user);

      // Return user info and token
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            preferredRole: user.preferredRole
          },
          token
        }
      });
    } catch (err) {
      logger.error('Error creating user:', err);
      return res.status(500).json({
        success: false,
        message: 'Error creating user'
      });
    }
  } catch (error) {
    logger.error('Unhandled error in register function:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ 
      where: { username } 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user);

    // Return user info and token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          preferredRole: user.preferredRole,
          profilePicture: user.profilePicture,
          karmaScore: user.karmaScore,
          totalGamesPlayed: user.totalGamesPlayed,
          totalWins: user.totalWins
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getProfile = async (req, res, next) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          preferredRole: user.preferredRole,
          profilePicture: user.profilePicture,
          bio: user.bio,
          karmaScore: user.karmaScore,
          totalGamesPlayed: user.totalGamesPlayed,
          totalWins: user.totalWins,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateProfile = async (req, res, next) => {
  try {
    const { bio, preferredRole, profilePicture } = req.body;
    const user = req.user;

    // Update user fields
    if (bio !== undefined) user.bio = bio;
    if (preferredRole !== undefined) user.preferredRole = preferredRole;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    // Save changes
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          preferredRole: user.preferredRole,
          profilePicture: user.profilePicture,
          bio: user.bio
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
