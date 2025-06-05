/**
 * User Routes
 * Defines API routes for user operations
 */

const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth.middleware');
const { 
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getLeaderboard,
  getUserGames
} = require('../controllers/user.controller');

// User routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/stats', getUserStats);
router.get('/games', getUserGames);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
