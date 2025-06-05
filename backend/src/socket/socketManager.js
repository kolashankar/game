/**
 * Socket.IO Manager
 * Handles real-time game interactions
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');
const { Game, GamePlayer, GameEvent } = require('../models/game.model');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Store active socket connections
const activeConnections = new Map();

/**
 * Set up Socket.IO event handlers
 * @param {Object} io - Socket.IO server instance
 */
const setupSocketHandlers = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chronocore_secret_key');
      
      // Find user
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    logger.info(`User connected: ${socket.user.username} (${userId})`);
    
    // Store connection
    activeConnections.set(userId, socket);
    
    // Join game room
    socket.on('join-game', async (gameId) => {
      try {
        // Check if user is in this game
        const gamePlayer = await GamePlayer.findOne({
          where: {
            GameId: gameId,
            UserId: userId
          }
        });
        
        if (!gamePlayer) {
          socket.emit('error', { message: 'You are not in this game' });
          return;
        }
        
        // Join game room
        socket.join(`game:${gameId}`);
        logger.info(`User ${socket.user.username} joined game room: ${gameId}`);
        
        // Notify other players
        socket.to(`game:${gameId}`).emit('player-joined', {
          userId,
          username: socket.user.username
        });
      } catch (error) {
        logger.error(`Error joining game room: ${error.message}`, error);
        socket.emit('error', { message: 'Failed to join game room' });
      }
    });
    
    // Leave game room
    socket.on('leave-game', (gameId) => {
      socket.leave(`game:${gameId}`);
      logger.info(`User ${socket.user.username} left game room: ${gameId}`);
      
      // Notify other players
      socket.to(`game:${gameId}`).emit('player-left', {
        userId,
        username: socket.user.username
      });
    });
    
    // Game actions
    socket.on('game-action', async (data) => {
      try {
        const { gameId, action, payload } = data;
        
        // Check if user is in this game
        const gamePlayer = await GamePlayer.findOne({
          where: {
            GameId: gameId,
            UserId: userId
          }
        });
        
        if (!gamePlayer) {
          socket.emit('error', { message: 'You are not in this game' });
          return;
        }
        
        // Get game
        const game = await Game.findByPk(gameId);
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        // Check if game is active
        if (game.status !== 'active') {
          socket.emit('error', { message: 'Game is not active' });
          return;
        }
        
        // Process action based on type
        let result;
        switch (action) {
          case 'move':
            result = await handleMoveAction(game, gamePlayer, payload);
            break;
          case 'develop':
            result = await handleDevelopAction(game, gamePlayer, payload);
            break;
          case 'research':
            result = await handleResearchAction(game, gamePlayer, payload);
            break;
          case 'connect':
            result = await handleConnectAction(game, gamePlayer, payload);
            break;
          case 'resolve-dilemma':
            result = await handleDilemmaAction(game, gamePlayer, payload);
            break;
          case 'end-turn':
            result = await handleEndTurnAction(game, gamePlayer);
            break;
          default:
            socket.emit('error', { message: 'Unknown action type' });
            return;
        }
        
        // Update last action timestamp
        gamePlayer.lastAction = new Date();
        await gamePlayer.save();
        
        // Broadcast action to all players in the game
        io.to(`game:${gameId}`).emit('game-update', {
          action,
          result,
          player: {
            id: userId,
            username: socket.user.username
          }
        });
        
        // Check for game end
        await checkGameEnd(game, io);
      } catch (error) {
        logger.error(`Error processing game action: ${error.message}`, error);
        socket.emit('error', { message: 'Failed to process game action' });
      }
    });
    
    // Chat message
    socket.on('chat-message', async (data) => {
      try {
        const { gameId, message } = data;
        
        // Check if user is in this game
        const gamePlayer = await GamePlayer.findOne({
          where: {
            GameId: gameId,
            UserId: userId
          }
        });
        
        if (!gamePlayer) {
          socket.emit('error', { message: 'You are not in this game' });
          return;
        }
        
        // Broadcast message to all players in the game
        io.to(`game:${gameId}`).emit('chat-message', {
          id: uuidv4(),
          userId,
          username: socket.user.username,
          message,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error(`Error sending chat message: ${error.message}`, error);
        socket.emit('error', { message: 'Failed to send chat message' });
      }
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.username} (${userId})`);
      activeConnections.delete(userId);
    });
  });
};

/**
 * Handle move action
 * @param {Object} game - Game instance
 * @param {Object} gamePlayer - GamePlayer instance
 * @param {Object} payload - Action payload
 * @returns {Object} - Action result
 */
const handleMoveAction = async (game, gamePlayer, payload) => {
  // Implementation details for move action
  // This would involve updating player position, claiming realms, etc.
  return { success: true, message: 'Move action processed' };
};

/**
 * Handle develop action
 * @param {Object} game - Game instance
 * @param {Object} gamePlayer - GamePlayer instance
 * @param {Object} payload - Action payload
 * @returns {Object} - Action result
 */
const handleDevelopAction = async (game, gamePlayer, payload) => {
  // Implementation details for develop action
  // This would involve upgrading realms, building structures, etc.
  return { success: true, message: 'Develop action processed' };
};

/**
 * Handle research action
 * @param {Object} game - Game instance
 * @param {Object} gamePlayer - GamePlayer instance
 * @param {Object} payload - Action payload
 * @returns {Object} - Action result
 */
const handleResearchAction = async (game, gamePlayer, payload) => {
  // Implementation details for research action
  // This would involve researching new technologies
  return { success: true, message: 'Research action processed' };
};

/**
 * Handle connect action
 * @param {Object} game - Game instance
 * @param {Object} gamePlayer - GamePlayer instance
 * @param {Object} payload - Action payload
 * @returns {Object} - Action result
 */
const handleConnectAction = async (game, gamePlayer, payload) => {
  // Implementation details for connect action
  // This would involve connecting timelines
  return { success: true, message: 'Connect action processed' };
};

/**
 * Handle dilemma action
 * @param {Object} game - Game instance
 * @param {Object} gamePlayer - GamePlayer instance
 * @param {Object} payload - Action payload
 * @returns {Object} - Action result
 */
const handleDilemmaAction = async (game, gamePlayer, payload) => {
  // Implementation details for resolving ethical dilemmas
  return { success: true, message: 'Dilemma action processed' };
};

/**
 * Handle end turn action
 * @param {Object} game - Game instance
 * @param {Object} gamePlayer - GamePlayer instance
 * @returns {Object} - Action result
 */
const handleEndTurnAction = async (game, gamePlayer) => {
  // Implementation details for ending a turn
  // This would involve advancing to the next player
  
  // Get all active players
  const gamePlayers = await GamePlayer.findAll({
    where: {
      GameId: game.id,
      isActive: true
    },
    order: [['createdAt', 'ASC']]
  });
  
  // Calculate next player index
  const nextPlayerIndex = (game.currentPlayerIndex + 1) % gamePlayers.length;
  
  // Update game
  game.currentPlayerIndex = nextPlayerIndex;
  game.currentTurn += 1;
  await game.save();
  
  return { 
    success: true, 
    message: 'Turn ended',
    nextPlayerIndex,
    nextPlayerId: gamePlayers[nextPlayerIndex].UserId
  };
};

/**
 * Check if the game has ended
 * @param {Object} game - Game instance
 * @param {Object} io - Socket.IO server instance
 */
const checkGameEnd = async (game, io) => {
  // Implementation details for checking game end conditions
  // This would involve checking victory conditions
};

module.exports = {
  setupSocketHandlers,
  activeConnections
};
