import { io } from 'socket.io-client';

// Create a socket instance
let socket;

/**
 * Initialize the socket connection
 * @param {string} token - JWT token for authentication
 * @returns {Object} - Socket instance
 */
export const initSocket = (token) => {
  // Close existing socket if it exists
  if (socket) {
    socket.close();
  }

  // Create new socket connection with fallback URL
  const socketUrl = (import.meta.env && import.meta.env.VITE_SOCKET_URL) || 'https://game-ujiz.onrender.com';
  socket = io(socketUrl, {
    auth: {
      token
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  // Setup event listeners
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

/**
 * Get the socket instance
 * @returns {Object} - Socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Emit an event to the server
 * @param {string} event - Event name
 * @param {any} data - Event data
 * @param {Function} callback - Callback function
 */
export const emitEvent = (event, data, callback) => {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  socket.emit(event, data, callback);
};

/**
 * Subscribe to an event
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 */
export const onEvent = (event, callback) => {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  socket.on(event, callback);
};

/**
 * Unsubscribe from an event
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 */
export const offEvent = (event, callback) => {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  socket.off(event, callback);
};

/**
 * Close the socket connection
 */
export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export default {
  initSocket,
  getSocket,
  emitEvent,
  onEvent,
  offEvent,
  closeSocket
};
