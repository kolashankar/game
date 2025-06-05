/**
 * Game Routes
 * Defines API routes for game operations
 */

const express = require('express');
const router = express.Router();
const { 
  createGame,
  getGames,
  getGameById,
  joinGame,
  leaveGame,
  startGame,
  setPlayerReady,
  endTurn,
  makeDecision,
  getGameState
} = require('../controllers/game.controller');

// Game routes
router.post('/', createGame);
router.get('/', getGames);
router.get('/:id', getGameById);
router.get('/:id/state', getGameState);
router.post('/:id/join', joinGame);
router.post('/:id/leave', leaveGame);
router.post('/:id/start', startGame);
router.post('/:id/ready', setPlayerReady);
router.post('/:id/end-turn', endTurn);
router.post('/:id/decision', makeDecision);

module.exports = router;
