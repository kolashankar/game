/**
 * API Routes Index
 * Centralizes all API routes for the application
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const gameRoutes = require('./game.routes');
const playerRoutes = require('./player.routes');
const timelineRoutes = require('./timeline.routes');
const realmRoutes = require('./realm.routes');
const aiRoutes = require('./ai.routes');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ChronoCore API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/games', gameRoutes);
router.use('/players', playerRoutes);
router.use('/timelines', timelineRoutes);
router.use('/realms', realmRoutes);
router.use('/ai', aiRoutes);

// API documentation route
router.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

module.exports = router;
