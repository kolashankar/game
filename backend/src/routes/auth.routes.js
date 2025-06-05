/**
 * Authentication Routes
 * Defines API routes for user authentication
 */

const express = require('express');
const router = express.Router();
const { authenticateJwt } = require('../middleware/auth.middleware');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword 
} = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateJwt, getProfile);
router.put('/profile', authenticateJwt, updateProfile);
router.post('/change-password', authenticateJwt, changePassword);

module.exports = router;
