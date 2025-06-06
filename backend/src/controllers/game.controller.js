/**
 * Game Controller
 * Handles game creation, joining, and gameplay operations
 */

const { 
  Game, GamePlayer, GameEvent, Timeline, Realm 
} = require('../models/game.model');
const { User } = require('../models/user.model');
const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Create a new game
 */
const createGame = async (req, res, next) => {
  try {
    const { name, maxPlayers = 4, isPrivate = false, password, winCondition = 'dominance', playerName } = req.body;
    
    // Generate a guest user if not authenticated
    const userId = req.user?.id || `guest-${Date.now()}`;
    const username = req.user?.username || playerName || `Guest-${Math.floor(Math.random() * 10000)}`;

    const game = await Game.create({
      name: name || `${username}'s Game`,
      maxPlayers,
      isPrivate,
      password,
      winCondition,
      creatorId: userId,
      creatorName: username
    });

    // Add creator as first player
    const role = req.body.role || 'time_traveler';
    await GamePlayer.create({
      GameId: game.id,
      UserId: userId,
      username,
      role,
      isGuest: !req.user?.id
    });

    // Add guest user to response if needed
    const userData = req.user ? req.user : { id: userId, username, isGuest: true };

    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: { 
        game,
        user: userData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available games
 */
const getGames = async (req, res, next) => {
  try {
    const games = await Game.findAll({
      where: {
        status: 'waiting',
        isPrivate: false
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'players',
          attributes: ['id', 'username'],
          through: { attributes: ['role'] }
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: { games }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get game by ID
 */
const getGameById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const game = await Game.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'players',
          attributes: ['id', 'username'],
          through: { attributes: ['role', 'karma', 'isReady'] }
        },
        {
          model: Timeline,
          as: 'timelines',
          include: [
            {
              model: Realm,
              as: 'realms'
            }
          ]
        },
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

    res.status(200).json({
      success: true,
      data: { game }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Join a game
 */
const joinGame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, password } = req.body;
    const user = req.user;

    const game = await Game.findByPk(id, {
      include: [
        {
          model: User,
          as: 'players',
          attributes: ['id']
        }
      ]
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Check if game is full
    const playerCount = await GamePlayer.count({ where: { GameId: id } });
    if (playerCount >= game.maxPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Game is full'
      });
    }

    // Check if already in game (for authenticated users)
    if (req.user) {
      const existingPlayer = await GamePlayer.findOne({
        where: { GameId: id, UserId: userId }
      });

      if (existingPlayer) {
        return res.status(400).json({
          success: false,
          message: 'Already in this game'
        });
      }
    }

    // Add player to game
    await GamePlayer.create({
      GameId: id,
      UserId: userId,
      username,
      role: role || 'time_traveler',
      isGuest: !req.user?.id
    });

    // Update player count
    await game.update({
      playerCount: playerCount + 1
    });

    // Add guest user to response if needed
    const userData = req.user ? req.user : { id: userId, username, isGuest: true };

    res.status(200).json({
      success: true,
      message: 'Joined game successfully',
      data: { 
        game,
        user: userData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Leave a game
 */
const leaveGame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const gamePlayer = await GamePlayer.findOne({
      where: {
        GameId: id,
        UserId: user.id
      }
    });

    if (!gamePlayer) {
      return res.status(404).json({
        success: false,
        message: 'You are not in this game'
      });
    }

    const game = await Game.findByPk(id);

    // If game hasn't started, remove player
    if (game.status === 'waiting') {
      await gamePlayer.destroy();
    } else {
      // If game has started, mark player as inactive
      gamePlayer.isActive = false;
      await gamePlayer.save();
    }

    // If creator leaves and game hasn't started, delete game
    if (game.creatorId === user.id && game.status === 'waiting') {
      await game.destroy();
    }

    res.status(200).json({
      success: true,
      message: 'Left game successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start a game
 */
const startGame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const game = await Game.findByPk(id, {
      include: [
        {
          model: User,
          as: 'players',
          through: { attributes: ['isReady'] }
        }
      ]
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Check if user is the creator
    if (game.creatorId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can start the game'
      });
    }

    // Check if game has already started
    if (game.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Game has already started or ended'
      });
    }

    // Check if there are enough players
    if (game.players.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Need at least 2 players to start'
      });
    }

    // Check if all players are ready
    const allReady = game.players.every(player => player.GamePlayer.isReady);
    if (!allReady) {
      return res.status(400).json({
        success: false,
        message: 'Not all players are ready'
      });
    }

    // Initialize game board
    await initializeGameBoard(game);

    // Update game status
    game.status = 'active';
    game.startedAt = new Date();
    await game.save();

    res.status(200).json({
      success: true,
      message: 'Game started successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initialize game board
 */
const initializeGameBoard = async (game) => {
  // Create timelines
  const timelineTypes = ['Utopia', 'Dystopia', 'Tech Empire', 'Earth Roots', 'AI Matrix', 'Cosmic Plane'];
  const timelines = [];

  for (const type of timelineTypes) {
    const timeline = await Timeline.create({
      GameId: game.id,
      name: `${type} Timeline`,
      description: `A timeline representing a ${type.toLowerCase()} reality.`,
      type,
      stability: 100,
      techLevel: type === 'Tech Empire' ? 3 : 1,
      karmaAlignment: type === 'Utopia' ? 50 : (type === 'Dystopia' ? -50 : 0)
    });
    
    timelines.push(timeline);
  }

  // Create realms for each timeline
  const realmTypes = ['Urban', 'Natural', 'Technological', 'Spiritual', 'Wasteland', 'Hybrid'];
  
  for (const timeline of timelines) {
    // Create 5-8 realms per timeline
    const realmCount = Math.floor(Math.random() * 4) + 5;
    
    for (let i = 0; i < realmCount; i++) {
      const realmType = realmTypes[Math.floor(Math.random() * realmTypes.length)];
      
      await Realm.create({
        TimelineId: timeline.id,
        name: `${realmType} Realm ${i+1}`,
        description: `A ${realmType.toLowerCase()} realm in the ${timeline.type} timeline.`,
        type: realmType,
        position: { x: Math.floor(Math.random() * 10), y: Math.floor(Math.random() * 10) },
        developmentLevel: 1,
        resources: {
          energy: Math.floor(Math.random() * 10) + 1,
          knowledge: Math.floor(Math.random() * 10) + 1,
          materials: Math.floor(Math.random() * 10) + 1
        }
      });
    }
  }
};

/**
 * Make a player ready
 */
const setPlayerReady = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ready } = req.body;
    const user = req.user;

    const gamePlayer = await GamePlayer.findOne({
      where: {
        GameId: id,
        UserId: user.id
      }
    });

    if (!gamePlayer) {
      return res.status(404).json({
        success: false,
        message: 'You are not in this game'
      });
    }

    gamePlayer.isReady = ready;
    await gamePlayer.save();

    res.status(200).json({
      success: true,
      message: `Player ${ready ? 'ready' : 'not ready'}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * End player turn
 */
const endTurn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const game = await Game.findByPk(id, {
      include: [
        {
          model: User,
          as: 'players',
          attributes: ['id', 'username'],
          through: { attributes: ['role', 'karma', 'isReady'] }
        }
      ]
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Check if game is active
    if (game.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Game is not active'
      });
    }

    // Check if user is in the game
    const playerIndex = game.players.findIndex(player => player.id === user.id);
    if (playerIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'You are not in this game'
      });
    }

    // Check if it's the user's turn
    if (game.currentPlayerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'It is not your turn'
      });
    }

    // Find the next player
    const playerIds = game.players.map(player => player.id);
    const currentPlayerIndex = playerIds.indexOf(user.id);
    const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;
    const nextPlayerId = playerIds[nextPlayerIndex];

    // Update game state
    game.currentPlayerId = nextPlayerId;
    game.currentTurn += 1;
    await game.save();

    // Create turn end event
    await GameEvent.create({
      GameId: game.id,
      type: 'turn_end',
      data: {
        playerId: user.id,
        playerName: user.username,
        turn: game.currentTurn - 1
      }
    });

    // Create turn start event
    const nextPlayer = game.players.find(player => player.id === nextPlayerId);
    await GameEvent.create({
      GameId: game.id,
      type: 'turn_start',
      data: {
        playerId: nextPlayerId,
        playerName: nextPlayer.username,
        turn: game.currentTurn
      }
    });

    res.status(200).json({
      success: true,
      message: 'Turn ended successfully',
      data: {
        nextPlayerId,
        currentTurn: game.currentTurn
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Make a decision in the game
 */
const makeDecision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, targetTimelineId, targetRealmId } = req.body;
    const user = req.user;

    const game = await Game.findByPk(id, {
      include: [
        {
          model: User,
          as: 'players',
          attributes: ['id', 'username'],
          through: { attributes: ['role', 'karma'] }
        },
        {
          model: Timeline,
          as: 'timelines',
          include: [{ model: Realm, as: 'realms' }]
        }
      ]
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Check if game is active
    if (game.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Game is not active'
      });
    }

    // Check if user is in the game
    const playerIndex = game.players.findIndex(player => player.id === user.id);
    if (playerIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'You are not in this game'
      });
    }

    // Check if it's the user's turn
    if (game.currentPlayerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'It is not your turn'
      });
    }

    // Validate decision
    if (!decision || decision.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Decision cannot be empty'
      });
    }

    // Get player data
    const player = game.players[playerIndex];
    const playerData = {
      id: player.id,
      username: player.username,
      role: player.GamePlayer.role,
      karma: player.GamePlayer.karma
    };

    // Prepare game state for AI evaluation
    const gameState = {
      id: game.id,
      currentTurn: game.currentTurn,
      currentEra: game.currentEra,
      timelineStability: game.timelineStability
    };

    try {
      // Call AI service to evaluate decision
      const aiResponse = await axios.post(`${process.env.AI_ENGINE_URL}/api/decisions/evaluate`, {
        player: playerData,
        game: gameState,
        decision,
        context: {
          targetTimelineId,
          targetRealmId,
          timestamp: new Date().toISOString()
        }
      });

      const evaluation = aiResponse.data;

      // Update player karma
      const gamePlayer = await GamePlayer.findOne({
        where: {
          GameId: game.id,
          UserId: user.id
        }
      });

      gamePlayer.karma += evaluation.karma_impact;
      await gamePlayer.save();

      // Update affected timelines and realms if specified
      if (targetTimelineId) {
        const timeline = await Timeline.findByPk(targetTimelineId);
        if (timeline && timeline.GameId === game.id) {
          timeline.stability += evaluation.timeline_stability_impact || 0;
          timeline.karmaAlignment += evaluation.karma_impact / 2;
          await timeline.save();
        }
      }

      if (targetRealmId) {
        const realm = await Realm.findByPk(targetRealmId);
        if (realm) {
          const timeline = await Timeline.findByPk(realm.TimelineId);
          if (timeline && timeline.GameId === game.id) {
            realm.developmentLevel += evaluation.development_impact || 0;
            await realm.save();
          }
        }
      }

      // Create decision event
      await GameEvent.create({
        GameId: game.id,
        type: 'decision',
        data: {
          playerId: user.id,
          playerName: user.username,
          decision,
          evaluation: {
            ethicalImpact: evaluation.ethical_impact,
            technologicalImpact: evaluation.technological_impact,
            temporalImpact: evaluation.temporal_impact,
            karmaImpact: evaluation.karma_impact,
            explanation: evaluation.explanation
          },
          targetTimelineId,
          targetRealmId
        }
      });

      res.status(200).json({
        success: true,
        message: 'Decision made successfully',
        data: {
          evaluation: {
            ethicalImpact: evaluation.ethical_impact,
            technologicalImpact: evaluation.technological_impact,
            temporalImpact: evaluation.temporal_impact,
            karmaImpact: evaluation.karma_impact,
            explanation: evaluation.explanation
          }
        }
      });
    } catch (aiError) {
      logger.error('AI service error:', aiError);
      
      // Fallback evaluation if AI service fails
      const fallbackEvaluation = {
        ethical_impact: 'Neutral',
        technological_impact: 'Minor advancement',
        temporal_impact: 'Minimal timeline disturbance',
        karma_impact: 0,
        explanation: 'Your decision has been recorded, but the full impact could not be determined.'
      };
      
      // Create decision event with fallback evaluation
      await GameEvent.create({
        GameId: game.id,
        type: 'decision',
        data: {
          playerId: user.id,
          playerName: user.username,
          decision,
          evaluation: {
            ethicalImpact: fallbackEvaluation.ethical_impact,
            technologicalImpact: fallbackEvaluation.technological_impact,
            temporalImpact: fallbackEvaluation.temporal_impact,
            karmaImpact: fallbackEvaluation.karma_impact,
            explanation: fallbackEvaluation.explanation
          },
          targetTimelineId,
          targetRealmId
        }
      });
      
      res.status(200).json({
        success: true,
        message: 'Decision recorded, but evaluation service unavailable',
        data: {
          evaluation: {
            ethicalImpact: fallbackEvaluation.ethical_impact,
            technologicalImpact: fallbackEvaluation.technological_impact,
            temporalImpact: fallbackEvaluation.temporal_impact,
            karmaImpact: fallbackEvaluation.karma_impact,
            explanation: fallbackEvaluation.explanation
          }
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get current game state
 */
const getGameState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const game = await Game.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'players',
          attributes: ['id', 'username'],
          through: { attributes: ['role', 'karma', 'isReady'] }
        },
        {
          model: Timeline,
          as: 'timelines',
          include: [
            {
              model: Realm,
              as: 'realms'
            }
          ]
        },
        {
          model: GameEvent,
          as: 'events',
          limit: 20,
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

    // Check if user is in the game
    const isPlayerInGame = game.players.some(player => player.id === user.id);
    if (!isPlayerInGame) {
      return res.status(403).json({
        success: false,
        message: 'You are not in this game'
      });
    }

    // Get current player
    const currentPlayer = game.players.find(player => player.id === game.currentPlayerId);
    
    // Format response
    const gameState = {
      id: game.id,
      name: game.name,
      status: game.status,
      currentTurn: game.currentTurn,
      currentEra: game.currentEra,
      timelineStability: game.timelineStability,
      winCondition: game.winCondition,
      currentPlayer: currentPlayer ? {
        id: currentPlayer.id,
        username: currentPlayer.username,
        role: currentPlayer.GamePlayer.role
      } : null,
      players: game.players.map(player => ({
        id: player.id,
        username: player.username,
        role: player.GamePlayer.role,
        karma: player.GamePlayer.karma,
        isReady: player.GamePlayer.isReady,
        isCurrentPlayer: player.id === game.currentPlayerId
      })),
      timelines: game.timelines.map(timeline => ({
        id: timeline.id,
        name: timeline.name,
        type: timeline.type,
        stability: timeline.stability,
        techLevel: timeline.techLevel,
        karmaAlignment: timeline.karmaAlignment,
        realms: timeline.realms.map(realm => ({
          id: realm.id,
          name: realm.name,
          type: realm.type,
          position: realm.position,
          developmentLevel: realm.developmentLevel,
          resources: realm.resources
        }))
      })),
      recentEvents: game.events.map(event => ({
        id: event.id,
        type: event.type,
        data: event.data,
        createdAt: event.createdAt
      }))
    };

    res.status(200).json({
      success: true,
      data: { gameState }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
