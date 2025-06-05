/**
 * AI Controller
 * Handles integration with the Python AI engine
 */

const axios = require('axios');
const logger = require('../utils/logger');
const { Game, GamePlayer, GameEvent } = require('../models/game.model');

// AI Engine URL
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://ai-engine:8000';

/**
 * Generate a story based on game state
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const generateStory = async (req, res, next) => {
  try {
    const { gameId } = req.body;
    
    // Get game data
    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: GameEvent,
          as: 'events',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    // Format game state for AI engine
    const gameState = formatGameStateForAI(game);
    
    // Call AI engine
    const response = await axios.post(`${AI_ENGINE_URL}/generate-story`, {
      game_state: gameState
    });
    
    res.status(200).json({
      success: true,
      data: {
        story: response.data.story
      }
    });
  } catch (error) {
    logger.error(`Error generating story: ${error.message}`, error);
    
    // Handle AI engine connection errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI Engine is currently unavailable'
      });
    }
    
    next(error);
  }
};

/**
 * Generate a quest for a player
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const generateQuest = async (req, res, next) => {
  try {
    const { gameId, playerId } = req.body;
    
    // Get game data
    const game = await Game.findByPk(gameId);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    // Get player data
    const gamePlayer = await GamePlayer.findOne({
      where: {
        GameId: gameId,
        UserId: playerId
      }
    });
    
    if (!gamePlayer) {
      return res.status(404).json({
        success: false,
        message: 'Player not found in this game'
      });
    }
    
    // Format game state and player data for AI engine
    const gameState = formatGameStateForAI(game);
    const playerData = formatPlayerDataForAI(gamePlayer);
    
    // Call AI engine
    const response = await axios.post(`${AI_ENGINE_URL}/generate-quest`, {
      player: playerData,
      game_state: gameState
    });
    
    res.status(200).json({
      success: true,
      data: {
        quest: response.data.quest
      }
    });
  } catch (error) {
    logger.error(`Error generating quest: ${error.message}`, error);
    
    // Handle AI engine connection errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI Engine is currently unavailable'
      });
    }
    
    next(error);
  }
};

/**
 * Evaluate a player's decision
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const evaluateDecision = async (req, res, next) => {
  try {
    const { playerId, decision, context } = req.body;
    
    // Call AI engine
    const response = await axios.post(`${AI_ENGINE_URL}/evaluate-decision`, {
      player_id: playerId,
      decision,
      context
    });
    
    res.status(200).json({
      success: true,
      data: {
        evaluation: response.data.evaluation,
        karma_impact: response.data.karma_impact
      }
    });
  } catch (error) {
    logger.error(`Error evaluating decision: ${error.message}`, error);
    
    // Handle AI engine connection errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI Engine is currently unavailable'
      });
    }
    
    next(error);
  }
};

/**
 * Calculate karma for a player's actions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const calculateKarma = async (req, res, next) => {
  try {
    const { playerId, actions } = req.body;
    
    // Call AI engine
    const response = await axios.post(`${AI_ENGINE_URL}/calculate-karma`, {
      player_id: playerId,
      actions
    });
    
    res.status(200).json({
      success: true,
      data: {
        karma: response.data.karma
      }
    });
  } catch (error) {
    logger.error(`Error calculating karma: ${error.message}`, error);
    
    // Handle AI engine connection errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI Engine is currently unavailable'
      });
    }
    
    next(error);
  }
};

/**
 * Format game state for AI engine
 * @param {Object} game - Game instance
 * @returns {Object} - Formatted game state
 */
const formatGameStateForAI = (game) => {
  // Implementation details for formatting game state
  // This would involve converting the Sequelize model to the format expected by the AI engine
  return {
    game_id: game.id,
    current_era: game.currentEra,
    current_turn: game.currentTurn,
    current_player_index: game.currentPlayerIndex,
    global_karma: game.globalKarma,
    events_history: game.events ? game.events.map(event => ({
      event_type: event.type,
      description: event.description,
      affected_players: event.affectedPlayers,
      affected_realms: event.affectedRealms,
      karma_impact: event.karmaImpact,
      turn: event.turn,
      timestamp: event.createdAt
    })) : []
  };
};

/**
 * Format player data for AI engine
 * @param {Object} gamePlayer - GamePlayer instance
 * @returns {Object} - Formatted player data
 */
const formatPlayerDataForAI = (gamePlayer) => {
  // Implementation details for formatting player data
  // This would involve converting the Sequelize model to the format expected by the AI engine
  return {
    player_id: gamePlayer.id,
    user_id: gamePlayer.UserId,
    role: gamePlayer.role,
    karma: gamePlayer.karma,
    owned_realms: gamePlayer.ownedRealms,
    tech_tree: {
      unlocked_technologies: gamePlayer.unlockedTechnologies,
      current_research: gamePlayer.currentResearch,
      research_progress: gamePlayer.researchProgress,
      tech_level: gamePlayer.techLevel
    }
  };
};

module.exports = {
  generateStory,
  generateQuest,
  evaluateDecision,
  calculateKarma
};
