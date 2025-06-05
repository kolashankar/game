/**
 * Player Routes
 * Defines API routes for player-related operations
 */

const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player.controller');
const { authenticate } = require('../middleware/auth');
const { uuidParamValidation, decisionValidation } = require('../utils/validator');

// Get a player by ID
router.get('/:id', authenticate, uuidParamValidation, playerController.getPlayerById);

// Update player ready status
router.patch('/:id/ready', authenticate, uuidParamValidation, playerController.updateReadyStatus);

// Make a decision
router.post('/:id/decisions', authenticate, uuidParamValidation, decisionValidation, playerController.makeDecision);

// Get active quests for a player
router.get('/:id/quests', authenticate, uuidParamValidation, playerController.getActiveQuests);

// Request a new quest
router.post('/:id/quests', authenticate, uuidParamValidation, playerController.requestQuest);

// Get controlled realms for a player
router.get('/:id/realms', authenticate, uuidParamValidation, playerController.getControlledRealms);

// Update player resources
router.patch('/:id/resources', authenticate, uuidParamValidation, playerController.updateResources);

module.exports = router;
