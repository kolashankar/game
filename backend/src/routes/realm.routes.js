/**
 * Realm Routes
 * Defines API routes for realm-related operations
 */

const express = require('express');
const router = express.Router();
const realmController = require('../controllers/realm.controller');
const { authenticate } = require('../middleware/auth');
const { uuidParamValidation } = require('../utils/validator');

// Get a realm by ID
router.get('/:id', authenticate, uuidParamValidation, realmController.getRealmById);

// Create a new realm
router.post('/', authenticate, realmController.createRealm);

// Update realm development level
router.patch('/:id/development', authenticate, uuidParamValidation, realmController.updateDevelopmentLevel);

// Update realm resources
router.patch('/:id/resources', authenticate, uuidParamValidation, realmController.updateResources);

// Update realm population
router.patch('/:id/population', authenticate, uuidParamValidation, realmController.updatePopulation);

// Change realm owner
router.patch('/:id/owner', authenticate, uuidParamValidation, realmController.changeOwner);

// Get all realms for a timeline (this route is also defined in timeline.routes.js)
router.get('/timeline/:timelineId', authenticate, uuidParamValidation, realmController.getTimelineRealms);

module.exports = router;
