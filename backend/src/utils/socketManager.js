/**
 * Socket Manager Utility
 * Manages WebSocket connections and real-time communication
 */

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

class SocketManager {
  constructor() {
    this.io = null;
    this.connections = new Map();
  }

  /**
   * Initialize Socket.IO with the HTTP server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });

    // Set up authentication middleware
    this.io.use(this.authenticateSocket);

    // Set up connection handler
    this.io.on('connection', this.handleConnection.bind(this));

    logger.info('Socket.IO initialized');
  }

  /**
   * Authenticate socket connection using JWT
   * @param {Object} socket - Socket instance
   * @param {Function} next - Next function
   */
  authenticateSocket(socket, next) {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  }

  /**
   * Handle new socket connection
   * @param {Object} socket - Socket instance
   */
  handleConnection(socket) {
    const userId = socket.user.id;
    logger.info(`User connected: ${userId}`);

    // Store the connection
    this.connections.set(userId, socket);

    // Join user's room
    socket.join(`user:${userId}`);

    // Handle joining game rooms
    socket.on('joinGame', (gameId) => {
      socket.join(`game:${gameId}`);
      logger.info(`User ${userId} joined game room: ${gameId}`);
    });

    // Handle leaving game rooms
    socket.on('leaveGame', (gameId) => {
      socket.leave(`game:${gameId}`);
      logger.info(`User ${userId} left game room: ${gameId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.connections.delete(userId);
      logger.info(`User disconnected: ${userId}`);
    });
  }

  /**
   * Send event to a specific user
   * @param {string} userId - User ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Send event to all users in a game
   * @param {string} gameId - Game ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToGame(gameId, event, data) {
    this.io.to(`game:${gameId}`).emit(event, data);
  }

  /**
   * Send event to all connected users
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToAll(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Check if a user is connected
   * @param {string} userId - User ID
   * @returns {boolean} True if connected, false otherwise
   */
  isUserConnected(userId) {
    return this.connections.has(userId);
  }
}

module.exports = new SocketManager();
