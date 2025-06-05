import axios from 'axios';
import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Game Service
 * Handles API calls related to game operations
 */
class GameService {
  /**
   * Create a new game
   * @param {Object} gameData - Game creation data
   * @returns {Promise} - Promise with created game
   */
  createGame(gameData) {
    return axios.post(`${API_URL}/games`, gameData, { headers: authHeader() });
  }

  /**
   * Get all available games
   * @returns {Promise} - Promise with games list
   */
  getGames() {
    return axios.get(`${API_URL}/games`, { headers: authHeader() });
  }

  /**
   * Get game by ID
   * @param {string} gameId - Game ID
   * @returns {Promise} - Promise with game data
   */
  getGameById(gameId) {
    return axios.get(`${API_URL}/games/${gameId}`, { headers: authHeader() });
  }

  /**
   * Get current game state
   * @param {string} gameId - Game ID
   * @returns {Promise} - Promise with game state
   */
  getGameState(gameId) {
    return axios.get(`${API_URL}/games/${gameId}/state`, { headers: authHeader() });
  }

  /**
   * Join a game
   * @param {string} gameId - Game ID
   * @param {Object} joinData - Join data (role, password)
   * @returns {Promise} - Promise with join result
   */
  joinGame(gameId, joinData) {
    return axios.post(`${API_URL}/games/${gameId}/join`, joinData, { headers: authHeader() });
  }

  /**
   * Leave a game
   * @param {string} gameId - Game ID
   * @returns {Promise} - Promise with leave result
   */
  leaveGame(gameId) {
    return axios.post(`${API_URL}/games/${gameId}/leave`, {}, { headers: authHeader() });
  }

  /**
   * Start a game
   * @param {string} gameId - Game ID
   * @returns {Promise} - Promise with start result
   */
  startGame(gameId) {
    return axios.post(`${API_URL}/games/${gameId}/start`, {}, { headers: authHeader() });
  }

  /**
   * End current player's turn
   * @param {string} gameId - Game ID
   * @returns {Promise} - Promise with turn end result
   */
  endTurn(gameId) {
    return axios.post(`${API_URL}/games/${gameId}/end-turn`, {}, { headers: authHeader() });
  }

  /**
   * Make a decision in the game
   * @param {string} gameId - Game ID
   * @param {string} decision - Decision text
   * @param {string} targetTimelineId - Target timeline ID (optional)
   * @param {string} targetRealmId - Target realm ID (optional)
   * @returns {Promise} - Promise with decision result
   */
  makeDecision(gameId, decision, targetTimelineId, targetRealmId) {
    return axios.post(
      `${API_URL}/games/${gameId}/decision`, 
      { 
        decision,
        targetTimelineId,
        targetRealmId
      }, 
      { headers: authHeader() }
    );
  }

  /**
   * Get game timelines
   * @param {string} gameId - Game ID
   * @returns {Promise} - Promise with timelines data
   */
  getGameTimelines(gameId) {
    return axios.get(`${API_URL}/games/${gameId}/timelines`, { headers: authHeader() });
  }

  /**
   * Get game events
   * @param {string} gameId - Game ID
   * @param {number} limit - Number of events to retrieve (optional)
   * @returns {Promise} - Promise with game events
   */
  getGameEvents(gameId, limit = 20) {
    return axios.get(`${API_URL}/games/${gameId}/events?limit=${limit}`, { headers: authHeader() });
  }

  /**
   * Get game players
   * @param {string} gameId - Game ID
   * @returns {Promise} - Promise with game players
   */
  getGamePlayers(gameId) {
    return axios.get(`${API_URL}/games/${gameId}/players`, { headers: authHeader() });
  }
}

export default new GameService();
