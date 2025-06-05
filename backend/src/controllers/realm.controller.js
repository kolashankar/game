/**
 * Realm Controller
 * Handles realm-related API endpoints
 */

const realmService = require('../services/realm.service');
const { success, error } = require('../utils/responseFormatter');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Get a realm by ID
 * @route GET /api/realms/:id
 */
const getRealmById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const realm = await realmService.getRealmById(id);
    return success(res, 200, 'Realm retrieved successfully', realm);
  } catch (err) {
    logger.error(`Error retrieving realm: ${err.message}`);
    next(err);
  }
};

/**
 * Create a new realm
 * @route POST /api/realms
 */
const createRealm = async (req, res, next) => {
  try {
    const realmData = req.body;
    const realm = await realmService.createRealm(realmData);
    return success(res, 201, 'Realm created successfully', realm);
  } catch (err) {
    logger.error(`Error creating realm: ${err.message}`);
    next(err);
  }
};

/**
 * Update realm development level
 * @route PATCH /api/realms/:id/development
 */
const updateDevelopmentLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { levelChange } = req.body;
    
    if (levelChange === undefined) {
      throw new ApiError(400, 'Development level change value is required');
    }
    
    const realm = await realmService.updateDevelopmentLevel(id, levelChange);
    return success(res, 200, 'Realm development level updated successfully', realm);
  } catch (err) {
    logger.error(`Error updating realm development level: ${err.message}`);
    next(err);
  }
};

/**
 * Update realm resources
 * @route PATCH /api/realms/:id/resources
 */
const updateResources = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resourceChange } = req.body;
    
    if (resourceChange === undefined) {
      throw new ApiError(400, 'Resource change value is required');
    }
    
    const realm = await realmService.updateResources(id, resourceChange);
    return success(res, 200, 'Realm resources updated successfully', realm);
  } catch (err) {
    logger.error(`Error updating realm resources: ${err.message}`);
    next(err);
  }
};

/**
 * Update realm population
 * @route PATCH /api/realms/:id/population
 */
const updatePopulation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { populationChange } = req.body;
    
    if (populationChange === undefined) {
      throw new ApiError(400, 'Population change value is required');
    }
    
    const realm = await realmService.updatePopulation(id, populationChange);
    return success(res, 200, 'Realm population updated successfully', realm);
  } catch (err) {
    logger.error(`Error updating realm population: ${err.message}`);
    next(err);
  }
};

/**
 * Change realm owner
 * @route PATCH /api/realms/:id/owner
 */
const changeOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;
    
    if (!newOwnerId) {
      throw new ApiError(400, 'New owner ID is required');
    }
    
    const realm = await realmService.changeOwner(id, newOwnerId);
    return success(res, 200, 'Realm owner changed successfully', realm);
  } catch (err) {
    logger.error(`Error changing realm owner: ${err.message}`);
    next(err);
  }
};

/**
 * Get all realms for a timeline
 * @route GET /api/timelines/:timelineId/realms
 */
const getTimelineRealms = async (req, res, next) => {
  try {
    const { timelineId } = req.params;
    const realms = await realmService.getTimelineRealms(timelineId);
    return success(res, 200, 'Timeline realms retrieved successfully', realms);
  } catch (err) {
    logger.error(`Error retrieving timeline realms: ${err.message}`);
    next(err);
  }
};

module.exports = {
  getRealmById,
  createRealm,
  updateDevelopmentLevel,
  updateResources,
  updatePopulation,
  changeOwner,
  getTimelineRealms
};
