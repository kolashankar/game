/**
 * AI Routes
 * Defines API routes for AI engine integration
 */

const express = require('express');
const router = express.Router();
const { 
  generateStory,
  generateQuest,
  evaluateDecision,
  calculateKarma
} = require('../controllers/ai.controller');

// AI routes
router.post('/generate-story', generateStory);
router.post('/generate-quest', generateQuest);
router.post('/evaluate-decision', evaluateDecision);
router.post('/calculate-karma', calculateKarma);

module.exports = router;
