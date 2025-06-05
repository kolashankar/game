/**
 * ChronoCore Backend Server
 * Main entry point for the Express and Socket.IO server
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');

// Import routes and middleware
const authRoutes = require('./routes/auth.routes');
const gameRoutes = require('./routes/game.routes');
const userRoutes = require('./routes/user.routes');
const aiRoutes = require('./routes/ai.routes');
const { authenticateJwt } = require('./middleware/auth.middleware');
const { errorHandler } = require('./middleware/error.middleware');

// Import database connections
const { connectPostgres } = require('./config/postgres.config');
const { connectMongoDB } = require('./config/mongodb.config');

// Import socket handlers
const { setupSocketHandlers } = require('./socket/socketManager');

// Import logger
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['https://game-frontend-7455.onrender.com', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['https://game-frontend-7455.onrender.com', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const requestId = uuidv4();
  req.requestId = requestId;
  logger.info(`[${requestId}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', authenticateJwt, gameRoutes);
app.use('/api/users', authenticateJwt, userRoutes);
app.use('/api/ai', authenticateJwt, aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

// Set up Socket.IO handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  
  try {
    // Connect to databases
    await connectPostgres();
    await connectMongoDB();
    logger.info('Database connections established');
  } catch (error) {
    logger.error('Failed to connect to databases:', error);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = { app, server, io };
