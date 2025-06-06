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
  const transaction = await sequelize.transaction();
  
  try {
    const { username, email, password, preferredRole } = req.body;

    logger.info(`Attempting to register user: ${username}, ${email}`, { requestId: req.requestId });

    // Validate required fields
    if (!username || !email || !password) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Check if User model is available
    if (!User) {
      await transaction.rollback();
      logger.error('User model is not defined', { requestId: req.requestId });
      return res.status(500).json({
        success: false,
        message: 'Internal server error: User model not available'
      });
    }

    // Check if user already exists
    const Op = require('sequelize').Op;
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ username }, { email }] 
      },
      transaction
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      preferredRole: preferredRole || 'time_traveler' // Default role if not provided
    }, { transaction });

    // Commit the transaction
    await transaction.commit();

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
          preferredRole: user.preferredRole || 'time_traveler',
          profilePicture: user.profilePicture,
          karmaScore: user.karmaScore || 0,
          totalGamesPlayed: user.totalGamesPlayed || 0,
          totalWins: user.totalWins || 0
        },
        token
      }
    });
  } catch (err) {
    // Rollback transaction in case of error
    if (transaction && transaction.finished !== 'commit') {
      await transaction.rollback();
    }
    
    // Log the error
    logger.error('Registration error:', { 
      error: err.message, 
      stack: err.stack,
      requestId: req.requestId 
    });
    
    // Handle specific error types
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: err.errors ? err.errors.map(e => e.message) : [err.message]
      });
    }
    
    // Default error response
    return res.status(500).json({
      success: false,
      message: 'Failed to register user. Please try again later.'
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
    logger.info('Login request received', { 
      body: req.body,
      headers: req.headers,
      requestId: req.requestId 
    });
    
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      logger.warn('Login failed: Missing credentials', { 
        username: !!username, 
        hasPassword: !!password,
        requestId: req.requestId 
      });
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    logger.info(`Login attempt for user: ${username}`, { 
      username,
      requestId: req.requestId 
    });

    // Find user by username
    let user;
    try {
      user = await User.findOne({ 
        where: { username } 
      });
      
      if (!user) {
        logger.warn('Login failed: User not found', { 
          username, 
          requestId: req.requestId 
        });
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }
    } catch (dbError) {
      logger.error('Database error during user lookup:', {
        error: dbError.message,
        stack: dbError.stack,
        username,
        requestId: req.requestId
      });
      throw new Error('Database error during authentication');
    }

    // Check if user is active
    if (user.isActive === false) {
      logger.warn('Login failed: User account is inactive', { 
        username, 
        userId: user.id,
        requestId: req.requestId 
      });
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Check password
    let isMatch = false;
    try {
      isMatch = await user.comparePassword(password);
    } catch (pwError) {
      logger.error('Error comparing passwords:', {
        error: pwError.message,
        stack: pwError.stack,
        username,
        userId: user.id,
        requestId: req.requestId
      });
      throw new Error('Error during password verification');
    }

    if (!isMatch) {
      logger.warn('Login failed: Invalid password', { 
        username, 
        userId: user.id,
        requestId: req.requestId 
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Update last login
    try {
      user.lastLogin = new Date();
      await user.save();
    } catch (updateError) {
      logger.error('Error updating last login:', {
        error: updateError.message,
        stack: updateError.stack,
        username,
        userId: user.id,
        requestId: req.requestId
      });
      // Continue with login even if last login update fails
    }

    // Generate token
    let token;
    try {
      token = generateToken(user);
    } catch (tokenError) {
      logger.error('Error generating JWT token:', {
        error: tokenError.message,
        stack: tokenError.stack,
        username,
        userId: user.id,
        requestId: req.requestId
      });
      throw new Error('Error generating authentication token');
    }

    logger.info('Login successful', { username, userId: user.id, requestId: req.requestId });

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
          preferredRole: user.preferredRole || 'time_traveler',
          profilePicture: user.profilePicture,
          karmaScore: user.karmaScore || 0,
          totalGamesPlayed: user.totalGamesPlayed || 0,
          totalWins: user.totalWins || 0
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', { 
      error: error.message, 
      stack: error.stack,
      username: req.body.username,
      requestId: req.requestId 
    });
    
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
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
