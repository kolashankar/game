/**
 * Player Controller
 * Handles player-related API endpoints
 */

const playerService = require('../services/player.service');
const { success, error } = require('../utils/responseFormatter');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Get a player by ID
 * @route GET /api/players/:id
 */
const getPlayerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const player = await playerService.getPlayerById(id);
    return success(res, 200, 'Player retrieved successfully', player);
  } catch (err) {
    logger.error(`Error retrieving player: ${err.message}`);
    next(err);
  }
};

/**
 * Update player ready status
 * @route PATCH /api/players/:id/ready
 */
const updateReadyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isReady } = req.body;
    
    if (isReady === undefined) {
      throw new ApiError(400, 'Ready status is required');
    }
    
    const player = await playerService.updateReadyStatus(id, isReady);
    return success(res, 200, 'Player ready status updated successfully', player);
  } catch (err) {
    logger.error(`Error updating player ready status: ${err.message}`);
    next(err);
  }
};

/**
 * Make a decision
 * @route POST /api/players/:id/decisions
 */
const makeDecision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decisionText, context } = req.body;
    
    if (!decisionText) {
      throw new ApiError(400, 'Decision text is required');
    }
    
    if (!context || typeof context !== 'object') {
      throw new ApiError(400, 'Decision context is required and must be an object');
    }
    
    const result = await playerService.makeDecision(id, decisionText, context);
    return success(res, 201, 'Decision made successfully', result);
  } catch (err) {
    logger.error(`Error making decision: ${err.message}`);
    next(err);
  }
};

/**
 * Get active quests for a player
 * @route GET /api/players/:id/quests
 */
const getActiveQuests = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quests = await playerService.getActiveQuests(id);
    return success(res, 200, 'Active quests retrieved successfully', quests);
  } catch (err) {
    logger.error(`Error retrieving active quests: ${err.message}`);
    next(err);
  }
};

/**
 * Request a new quest
 * @route POST /api/players/:id/quests
 */
const requestQuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quest = await playerService.requestQuest(id);
    return success(res, 201, 'Quest requested successfully', quest);
  } catch (err) {
    logger.error(`Error requesting quest: ${err.message}`);
    next(err);
  }
};

/**
 * Get controlled realms for a player
 * @route GET /api/players/:id/realms
 */
const getControlledRealms = async (req, res, next) => {
  try {
    const { id } = req.params;
    const realms = await playerService.getControlledRealms(id);
    return success(res, 200, 'Controlled realms retrieved successfully', realms);
  } catch (err) {
    logger.error(`Error retrieving controlled realms: ${err.message}`);
    next(err);
  }
};

/**
 * Update player resources
 * @route PATCH /api/players/:id/resources
 */
const updateResources = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    if (amount === undefined) {
      throw new ApiError(400, 'Resource amount is required');
    }
    
    const player = await playerService.updateResources(id, amount);
    return success(res, 200, 'Player resources updated successfully', player);
  } catch (err) {
    logger.error(`Error updating player resources: ${err.message}`);
    next(err);
  }
};

module.exports = {
  getPlayerById,
  updateReadyStatus,
  makeDecision,
  getActiveQuests,
  requestQuest,
  getControlledRealms,
  updateResources
};
