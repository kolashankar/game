/**
 * User Controller
 * Handles user profile management and statistics
 */

const { User } = require('../models/user.model');
const { Game, GamePlayer } = require('../models/game.model');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getUserProfile = async (req, res, next) => {
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
const updateUserProfile = async (req, res, next) => {
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
 * Get user statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get game statistics
    const totalGames = await GamePlayer.count({
      where: { UserId: userId }
    });

    const wins = await GamePlayer.count({
      where: { 
        UserId: userId,
        isWinner: true
      }
    });

    // Get role statistics
    const roleCounts = await GamePlayer.findAll({
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('role')), 'count']],
      where: { UserId: userId },
      group: ['role']
    });

    // Format role statistics
    const roleStats = {};
    roleCounts.forEach(role => {
      roleStats[role.role] = role.get('count');
    });

    // Get recent games
    const recentGames = await Game.findAll({
      include: [
        {
          model: GamePlayer,
          where: { UserId: userId }
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit: 5
    });

    res.status(200).json({
      success: true,
      data: {
        totalGames,
        wins,
        winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
        roleStats,
        recentGames
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user games
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getUserGames = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {
      include: [
        {
          model: GamePlayer,
          where: { UserId: userId }
        }
      ],
      order: [['updatedAt', 'DESC']]
    };

    // Add status filter if provided
    if (status) {
      query.where = { status };
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query.limit = parseInt(limit);
    query.offset = offset;

    // Get games
    const { count, rows: games } = await Game.findAndCountAll(query);

    res.status(200).json({
      success: true,
      data: {
        games,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get leaderboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const { type = 'wins', limit = 10 } = req.query;

    let users;

    switch (type) {
      case 'wins':
        // Get users with most wins
        users = await User.findAll({
          order: [['totalWins', 'DESC']],
          limit: parseInt(limit),
          attributes: ['id', 'username', 'profilePicture', 'totalGamesPlayed', 'totalWins', 'karmaScore']
        });
        break;
      case 'karma':
        // Get users with highest karma
        users = await User.findAll({
          order: [['karmaScore', 'DESC']],
          limit: parseInt(limit),
          attributes: ['id', 'username', 'profilePicture', 'totalGamesPlayed', 'totalWins', 'karmaScore']
        });
        break;
      case 'games':
        // Get users with most games played
        users = await User.findAll({
          order: [['totalGamesPlayed', 'DESC']],
          limit: parseInt(limit),
          attributes: ['id', 'username', 'profilePicture', 'totalGamesPlayed', 'totalWins', 'karmaScore']
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid leaderboard type'
        });
    }

    res.status(200).json({
      success: true,
      data: {
        type,
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getUserGames,
  getLeaderboard
};
