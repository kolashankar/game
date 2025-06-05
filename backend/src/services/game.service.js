/**
 * Game Service
 * Handles game creation, management, and state updates
 */

const { v4: uuidv4 } = require('uuid');
const { Game, Player, Timeline, Realm, User } = require('../database/models');
const aiService = require('./ai.service');
const logger = require('../utils/logger');

class GameService {
  /**
   * Create a new game
   * @param {Object} gameData - Game data
   * @param {string} userId - Creator's user ID
   * @returns {Object} Newly created game
   */
  async createGame(gameData, userId) {
    try {
      // Generate a unique join code
      const joinCode = this.generateJoinCode();
      
      // Create the game
      const game = await Game.create({
        ...gameData,
        joinCode,
        creatorId: userId,
        status: 'created'
      });

      // Initialize the game in the AI engine
      const aiGameState = await aiService.initializeGame(game.id, gameData.name);
      
      // Update the game with the AI game state ID
      game.aiGameStateId = aiGameState.id;
      await game.save();
      
      return game;
    } catch (error) {
      logger.error('Error creating game:', error);
      throw error;
    }
  }

  /**
   * Generate a unique join code for a game
   * @returns {string} Join code
   */
  generateJoinCode() {
    // Generate a 6-character alphanumeric code
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    
    return code;
  }

  /**
   * Join a game using a join code
   * @param {string} joinCode - Game join code
   * @param {string} userId - User ID
   * @param {Object} playerData - Player data
   * @returns {Object} Player and game data
   */
  async joinGame(joinCode, userId, playerData) {
    try {
      // Find the game by join code
      const game = await Game.findOne({ where: { joinCode } });
      if (!game) {
        throw new Error('Game not found');
      }

      // Check if game is joinable
      if (game.status !== 'created') {
        throw new Error('Game is no longer accepting players');
      }

      // Check if player count is at maximum
      const playerCount = await Player.count({ where: { gameId: game.id } });
      if (playerCount >= game.maxPlayers) {
        throw new Error('Game is full');
      }

      // Check if user is already in the game
      const existingPlayer = await Player.findOne({
        where: { gameId: game.id, userId }
      });
      
      if (existingPlayer) {
        throw new Error('You are already in this game');
      }

      // Create a new player
      const player = await Player.create({
        ...playerData,
        gameId: game.id,
        userId,
        isActive: true
      });

      // Register player with AI engine
      const aiPlayer = await aiService.registerPlayer(
        game.aiGameStateId,
        player.id,
        playerData.name,
        playerData.role
      );
      
      // Update player with AI player ID
      player.aiPlayerId = aiPlayer.id;
      await player.save();

      return {
        player,
        game
      };
    } catch (error) {
      logger.error('Error joining game:', error);
      throw error;
    }
  }

  /**
   * Start a game
   * @param {string} gameId - Game ID
   * @param {string} userId - User ID (must be the creator)
   * @returns {Object} Updated game
   */
  async startGame(gameId, userId) {
    try {
      // Find the game
      const game = await Game.findByPk(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // Check if user is the creator
      if (game.creatorId !== userId) {
        throw new Error('Only the game creator can start the game');
      }

      // Check if game is in created status
      if (game.status !== 'created') {
        throw new Error('Game has already started or ended');
      }

      // Check if there are at least 2 players
      const playerCount = await Player.count({ where: { gameId } });
      if (playerCount < 2) {
        throw new Error('Game needs at least 2 players to start');
      }

      // Update game status
      game.status = 'active';
      game.currentTurn = 1;
      await game.save();

      // Initialize timelines and realms
      await this.initializeGameWorld(game);

      // Start the game in the AI engine
      await aiService.startGame(game.aiGameStateId);

      return game;
    } catch (error) {
      logger.error('Error starting game:', error);
      throw error;
    }
  }

  /**
   * Initialize the game world with timelines and realms
   * @param {Object} game - Game object
   */
  async initializeGameWorld(game) {
    try {
      // Create the main timeline
      const mainTimeline = await Timeline.create({
        gameId: game.id,
        name: 'Prime Timeline',
        description: 'The original timeline from which all others branch',
        stability: 100
      });

      // Get all players in the game
      const players = await Player.findAll({
        where: { gameId: game.id },
        include: [{ model: User, as: 'user' }]
      });

      // Create a realm for each player
      for (const player of players) {
        await Realm.create({
          timelineId: mainTimeline.id,
          name: `${player.name}'s Realm`,
          description: `A realm controlled by ${player.name}`,
          ownerId: player.id,
          developmentLevel: 1,
          technologyFocus: 'Balanced',
          ethicalAlignment: 0,
          resources: 50,
          population: 1000000,
          coordinates: {
            x: Math.floor(Math.random() * 100),
            y: Math.floor(Math.random() * 100)
          }
        });
      }

      // Initialize the world in the AI engine
      await aiService.initializeWorld(
        game.aiGameStateId,
        mainTimeline.id,
        players.map(p => p.id)
      );

      return true;
    } catch (error) {
      logger.error('Error initializing game world:', error);
      throw error;
    }
  }

  /**
   * Get a game by ID with related data
   * @param {string} gameId - Game ID
   * @returns {Object} Game with related data
   */
  async getGameById(gameId) {
    try {
      const game = await Game.findByPk(gameId, {
        include: [
          {
            model: Player,
            as: 'players',
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }]
          },
          {
            model: Timeline,
            as: 'timelines',
            include: [{ model: Realm, as: 'realms' }]
          }
        ]
      });

      if (!game) {
        throw new Error('Game not found');
      }

      return game;
    } catch (error) {
      logger.error('Error getting game by ID:', error);
      throw error;
    }
  }

  /**
   * End a player's turn
   * @param {string} gameId - Game ID
   * @param {string} playerId - Player ID
   * @returns {Object} Updated game state
   */
  async endTurn(gameId, playerId) {
    try {
      // Find the game
      const game = await Game.findByPk(gameId, {
        include: [{ model: Player, as: 'players' }]
      });
      
      if (!game) {
        throw new Error('Game not found');
      }

      // Check if game is active
      if (game.status !== 'active') {
        throw new Error('Game is not active');
      }

      // Check if it's the player's turn
      const currentPlayerIndex = game.currentPlayerIndex;
      const currentPlayer = game.players[currentPlayerIndex];
      
      if (currentPlayer.id !== playerId) {
        throw new Error('It is not your turn');
      }

      // Move to the next player
      const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
      game.currentPlayerIndex = nextPlayerIndex;

      // If we've gone through all players, increment the turn counter
      if (nextPlayerIndex === 0) {
        game.currentTurn += 1;
        
        // Progress the game era if needed
        if (game.currentTurn === 5 && game.currentEra === 'Initiation') {
          game.currentEra = 'Progression';
        } else if (game.currentTurn === 10 && game.currentEra === 'Progression') {
          game.currentEra = 'Distortion';
        } else if (game.currentTurn === 15 && game.currentEra === 'Distortion') {
          game.currentEra = 'Equilibrium';
        }
      }

      await game.save();

      // Process end of turn in AI engine
      await aiService.processTurnEnd(
        game.aiGameStateId,
        playerId,
        game.currentTurn,
        game.currentEra
      );

      return game;
    } catch (error) {
      logger.error('Error ending turn:', error);
      throw error;
    }
  }
}

module.exports = new GameService();
