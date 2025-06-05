/**
 * Player Service
 * Handles player operations and state management
 */

const { Player, Game, Realm, Quest, Decision, Timeline } = require('../database/models');
const aiService = require('./ai.service');
const logger = require('../utils/logger');

class PlayerService {
  /**
   * Get a player by ID with related data
   * @param {string} playerId - Player ID
   * @returns {Object} Player with related data
   */
  async getPlayerById(playerId) {
    try {
      const player = await Player.findByPk(playerId, {
        include: [
          { 
            model: Game, 
            as: 'game'
          },
          { 
            model: Realm, 
            as: 'realms'
          },
          { 
            model: Quest, 
            as: 'quests',
            where: { status: 'active' },
            required: false
          }
        ]
      });

      if (!player) {
        throw new Error('Player not found');
      }

      return player;
    } catch (error) {
      logger.error('Error getting player by ID:', error);
      throw error;
    }
  }

  /**
   * Update player ready status
   * @param {string} playerId - Player ID
   * @param {boolean} isReady - Ready status
   * @returns {Object} Updated player
   */
  async updateReadyStatus(playerId, isReady) {
    try {
      const player = await Player.findByPk(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      player.isReady = isReady;
      await player.save();

      return player;
    } catch (error) {
      logger.error('Error updating player ready status:', error);
      throw error;
    }
  }

  /**
   * Make a decision
   * @param {string} playerId - Player ID
   * @param {string} decisionText - Decision text
   * @param {Object} context - Decision context
   * @returns {Object} Decision result
   */
  async makeDecision(playerId, decisionText, context) {
    try {
      // Get player and game
      const player = await Player.findByPk(playerId, {
        include: [{ model: Game, as: 'game' }]
      });
      
      if (!player) {
        throw new Error('Player not found');
      }

      const game = player.game;
      if (!game) {
        throw new Error('Game not found');
      }

      // Check if game is active
      if (game.status !== 'active') {
        throw new Error('Game is not active');
      }

      // Check if it's the player's turn
      if (game.players[game.currentPlayerIndex].id !== playerId) {
        throw new Error('It is not your turn');
      }

      // Evaluate the decision with the AI engine
      const evaluation = await aiService.evaluateDecision(
        game.aiGameStateId,
        playerId,
        decisionText,
        context
      );

      // Create a decision record
      const decision = await Decision.create({
        playerId,
        gameId: game.id,
        questId: context.questId || null,
        decisionText,
        context,
        evaluation,
        karmaImpact: evaluation.karma_impact || 0,
        ethicalImpact: evaluation.ethical_impact || null,
        technologicalImpact: evaluation.technological_impact || null,
        temporalImpact: evaluation.temporal_impact || null,
        affectedRealms: context.affectedRealms || [],
        affectedTimelines: context.affectedTimelines || [],
        turn: game.currentTurn
      });

      // Update player karma
      player.karma += evaluation.karma_impact || 0;
      await player.save();

      // Update global karma
      game.globalKarma += evaluation.karma_impact || 0;
      await game.save();

      // If this decision was for a quest, update the quest
      if (context.questId) {
        const quest = await Quest.findByPk(context.questId);
        if (quest) {
          quest.status = 'completed';
          quest.selectedOption = context.selectedOption;
          quest.outcome = evaluation;
          quest.completedAt = new Date();
          await quest.save();

          // Update player stats
          player.stats.questsCompleted += 1;
          await player.save();
        }
      }

      // Update player stats
      player.stats.decisionsCount += 1;
      await player.save();

      return {
        decision,
        evaluation
      };
    } catch (error) {
      logger.error('Error making decision:', error);
      throw error;
    }
  }

  /**
   * Get active quests for a player
   * @param {string} playerId - Player ID
   * @returns {Array} Active quests
   */
  async getActiveQuests(playerId) {
    try {
      const quests = await Quest.findAll({
        where: {
          playerId,
          status: 'active'
        }
      });

      return quests;
    } catch (error) {
      logger.error('Error getting active quests:', error);
      throw error;
    }
  }

  /**
   * Request a new quest
   * @param {string} playerId - Player ID
   * @returns {Object} New quest
   */
  async requestQuest(playerId) {
    try {
      // Get player and game
      const player = await Player.findByPk(playerId, {
        include: [{ model: Game, as: 'game' }]
      });
      
      if (!player) {
        throw new Error('Player not found');
      }

      const game = player.game;
      if (!game) {
        throw new Error('Game not found');
      }

      // Check if game is active
      if (game.status !== 'active') {
        throw new Error('Game is not active');
      }

      // Generate a quest with the AI engine
      const aiQuest = await aiService.generateQuest(
        game.aiGameStateId,
        playerId
      );

      // Create a quest record
      const quest = await Quest.create({
        playerId,
        title: aiQuest.title,
        description: aiQuest.description,
        type: aiQuest.type,
        difficulty: aiQuest.difficulty,
        options: aiQuest.options,
        status: 'active',
        aiQuestId: aiQuest.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
      });

      return quest;
    } catch (error) {
      logger.error('Error requesting quest:', error);
      throw error;
    }
  }

  /**
   * Get controlled realms for a player
   * @param {string} playerId - Player ID
   * @returns {Array} Controlled realms
   */
  async getControlledRealms(playerId) {
    try {
      const realms = await Realm.findAll({
        where: {
          ownerId: playerId
        },
        include: [
          { model: Timeline, as: 'timeline' }
        ]
      });

      return realms;
    } catch (error) {
      logger.error('Error getting controlled realms:', error);
      throw error;
    }
  }

  /**
   * Update player resources
   * @param {string} playerId - Player ID
   * @param {number} amount - Amount to add (can be negative)
   * @returns {Object} Updated player
   */
  async updateResources(playerId, amount) {
    try {
      const player = await Player.findByPk(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      player.resources += amount;
      if (player.resources < 0) {
        player.resources = 0;
      }
      
      await player.save();

      return player;
    } catch (error) {
      logger.error('Error updating player resources:', error);
      throw error;
    }
  }
}

module.exports = new PlayerService();
