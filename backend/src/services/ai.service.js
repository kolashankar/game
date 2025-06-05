/**
 * AI Service
 * Handles interactions with the AI engine
 */

const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.baseUrl = process.env.AI_ENGINE_URL || 'https://game-ai-engine.onrender.com';
    this.apiKey = process.env.AI_ENGINE_API_KEY;
  }

  /**
   * Create HTTP client with authorization headers
   * @returns {Object} Axios instance
   */
  getClient() {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  /**
   * Initialize a new game in the AI engine
   * @param {string} gameId - Game ID
   * @param {string} gameName - Game name
   * @returns {Object} AI game state
   */
  async initializeGame(gameId, gameName) {
    try {
      const client = this.getClient();
      const response = await client.post('/games', {
        game_id: gameId,
        name: gameName
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error initializing game in AI engine:', error);
      throw new Error('Failed to initialize game in AI engine');
    }
  }

  /**
   * Register a player in the AI engine
   * @param {string} aiGameStateId - AI game state ID
   * @param {string} playerId - Player ID
   * @param {string} playerName - Player name
   * @param {string} role - Player role
   * @returns {Object} AI player
   */
  async registerPlayer(aiGameStateId, playerId, playerName, role) {
    try {
      const client = this.getClient();
      const response = await client.post(`/games/${aiGameStateId}/players`, {
        player_id: playerId,
        name: playerName,
        role: role
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error registering player in AI engine:', error);
      throw new Error('Failed to register player in AI engine');
    }
  }

  /**
   * Start the game in the AI engine
   * @param {string} aiGameStateId - AI game state ID
   * @returns {Object} Updated AI game state
   */
  async startGame(aiGameStateId) {
    try {
      const client = this.getClient();
      const response = await client.post(`/games/${aiGameStateId}/start`);
      
      return response.data;
    } catch (error) {
      logger.error('Error starting game in AI engine:', error);
      throw new Error('Failed to start game in AI engine');
    }
  }

  /**
   * Initialize the game world in the AI engine
   * @param {string} aiGameStateId - AI game state ID
   * @param {string} mainTimelineId - Main timeline ID
   * @param {Array} playerIds - Array of player IDs
   * @returns {Object} AI world state
   */
  async initializeWorld(aiGameStateId, mainTimelineId, playerIds) {
    try {
      const client = this.getClient();
      const response = await client.post(`/games/${aiGameStateId}/world`, {
        main_timeline_id: mainTimelineId,
        player_ids: playerIds
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error initializing world in AI engine:', error);
      throw new Error('Failed to initialize world in AI engine');
    }
  }

  /**
   * Process the end of a turn in the AI engine
   * @param {string} aiGameStateId - AI game state ID
   * @param {string} playerId - Player ID
   * @param {number} currentTurn - Current turn number
   * @param {string} currentEra - Current era
   * @returns {Object} Turn results
   */
  async processTurnEnd(aiGameStateId, playerId, currentTurn, currentEra) {
    try {
      const client = this.getClient();
      const response = await client.post(`/games/${aiGameStateId}/turns/end`, {
        player_id: playerId,
        turn: currentTurn,
        era: currentEra
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error processing turn end in AI engine:', error);
      throw new Error('Failed to process turn end in AI engine');
    }
  }

  /**
   * Generate a quest for a player
   * @param {string} aiGameStateId - AI game state ID
   * @param {string} playerId - Player ID
   * @returns {Object} Generated quest
   */
  async generateQuest(aiGameStateId, playerId) {
    try {
      const client = this.getClient();
      const response = await client.post(`/games/${aiGameStateId}/quests`, {
        player_id: playerId
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error generating quest in AI engine:', error);
      throw new Error('Failed to generate quest in AI engine');
    }
  }

  /**
   * Evaluate a player's decision
   * @param {string} aiGameStateId - AI game state ID
   * @param {string} playerId - Player ID
   * @param {string} decision - Decision text
   * @param {Object} context - Decision context
   * @returns {Object} Decision evaluation
   */
  async evaluateDecision(aiGameStateId, playerId, decision, context) {
    try {
      const client = this.getClient();
      const response = await client.post(`/games/${aiGameStateId}/decisions/evaluate`, {
        player_id: playerId,
        decision: decision,
        context: context
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error evaluating decision in AI engine:', error);
      throw new Error('Failed to evaluate decision in AI engine');
    }
  }

  /**
   * Generate a time rift
   * @param {string} aiGameStateId - AI game state ID
   * @param {string} timelineId - Timeline ID
   * @returns {Object} Generated time rift
   */
  async generateTimeRift(aiGameStateId, timelineId) {
    try {
      const client = this.getClient();
      const response = await client.post(`/games/${aiGameStateId}/time-rifts`, {
        timeline_id: timelineId
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error generating time rift in AI engine:', error);
      throw new Error('Failed to generate time rift in AI engine');
    }
  }

  /**
   * Get game state from AI engine
   * @param {string} aiGameStateId - AI game state ID
   * @returns {Object} Game state
   */
  async getGameState(aiGameStateId) {
    try {
      const client = this.getClient();
      const response = await client.get(`/games/${aiGameStateId}`);
      
      return response.data;
    } catch (error) {
      logger.error('Error getting game state from AI engine:', error);
      throw new Error('Failed to get game state from AI engine');
    }
  }
}

module.exports = new AIService();
