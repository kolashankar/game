/**
 * Timeline Controller
 * Handles timeline-related API endpoints
 */

const timelineService = require('../services/timeline.service');
const { success, error } = require('../utils/responseFormatter');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Get a timeline by ID
 * @route GET /api/timelines/:id
 */
const getTimelineById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const timeline = await timelineService.getTimelineById(id);
    return success(res, 200, 'Timeline retrieved successfully', timeline);
  } catch (err) {
    logger.error(`Error retrieving timeline: ${err.message}`);
    next(err);
  }
};

/**
 * Create a new timeline
 * @route POST /api/timelines
 */
const createTimeline = async (req, res, next) => {
  try {
    const timelineData = req.body;
    const timeline = await timelineService.createTimeline(timelineData);
    return success(res, 201, 'Timeline created successfully', timeline);
  } catch (err) {
    logger.error(`Error creating timeline: ${err.message}`);
    next(err);
  }
};

/**
 * Update timeline stability
 * @route PATCH /api/timelines/:id/stability
 */
const updateStability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stabilityChange } = req.body;
    
    if (stabilityChange === undefined) {
      throw new ApiError(400, 'Stability change value is required');
    }
    
    const timeline = await timelineService.updateStability(id, stabilityChange);
    return success(res, 200, 'Timeline stability updated successfully', timeline);
  } catch (err) {
    logger.error(`Error updating timeline stability: ${err.message}`);
    next(err);
  }
};

/**
 * Generate a time rift in a timeline
 * @route POST /api/timelines/:id/rifts
 */
const generateTimeRift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { aiGameStateId } = req.body;
    
    if (!aiGameStateId) {
      throw new ApiError(400, 'AI game state ID is required');
    }
    
    const timeRift = await timelineService.generateTimeRift(id, aiGameStateId);
    return success(res, 201, 'Time rift generated successfully', timeRift);
  } catch (err) {
    logger.error(`Error generating time rift: ${err.message}`);
    next(err);
  }
};

/**
 * Resolve a time rift
 * @route PATCH /api/timelines/rifts/:riftId/resolve
 */
const resolveTimeRift = async (req, res, next) => {
  try {
    const { riftId } = req.params;
    const { playerId } = req.body;
    
    if (!playerId) {
      throw new ApiError(400, 'Player ID is required');
    }
    
    const timeRift = await timelineService.resolveTimeRift(riftId, playerId);
    return success(res, 200, 'Time rift resolved successfully', timeRift);
  } catch (err) {
    logger.error(`Error resolving time rift: ${err.message}`);
    next(err);
  }
};

/**
 * Get all timelines for a game
 * @route GET /api/games/:gameId/timelines
 */
const getGameTimelines = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const timelines = await timelineService.getGameTimelines(gameId);
    return success(res, 200, 'Game timelines retrieved successfully', timelines);
  } catch (err) {
    logger.error(`Error retrieving game timelines: ${err.message}`);
    next(err);
  }
};

module.exports = {
  getTimelineById,
  createTimeline,
  updateStability,
  generateTimeRift,
  resolveTimeRift,
  getGameTimelines
};
