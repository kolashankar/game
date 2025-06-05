/**
 * Timeline Routes
 * Defines API routes for timeline-related operations
 */

const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timeline.controller');
const { authenticate } = require('../middleware/auth');
const { uuidParamValidation } = require('../utils/validator');

// Get a timeline by ID
router.get('/:id', authenticate, uuidParamValidation, timelineController.getTimelineById);

// Create a new timeline
router.post('/', authenticate, timelineController.createTimeline);

// Update timeline stability
router.patch('/:id/stability', authenticate, uuidParamValidation, timelineController.updateStability);

// Generate a time rift in a timeline
router.post('/:id/rifts', authenticate, uuidParamValidation, timelineController.generateTimeRift);

// Resolve a time rift
router.patch('/rifts/:riftId/resolve', authenticate, uuidParamValidation, timelineController.resolveTimeRift);

// Get all timelines for a game (this route is also defined in game.routes.js)
router.get('/game/:gameId', authenticate, uuidParamValidation, timelineController.getGameTimelines);

module.exports = router;
