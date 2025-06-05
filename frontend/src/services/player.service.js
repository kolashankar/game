import axios from 'axios';
import authHeader from './auth-header';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Player Service
 * Handles API calls related to player actions
 */
class PlayerService {
  /**
   * Get player details
   * @param {string} playerId - Player ID
   * @returns {Promise} - Promise with player data
   */
  getPlayer(playerId) {
    return axios.get(`${API_URL}/players/${playerId}`, { headers: authHeader() });
  }

  /**
   * Get player quests
   * @param {string} playerId - Player ID
   * @returns {Promise} - Promise with player quests
   */
  getPlayerQuests(playerId) {
    return axios.get(`${API_URL}/players/${playerId}/quests`, { headers: authHeader() });
  }

  /**
   * Request a new quest
   * @param {string} playerId - Player ID
   * @returns {Promise} - Promise with new quest
   */
  requestQuest(playerId) {
    return axios.post(`${API_URL}/players/${playerId}/quests/request`, {}, { headers: authHeader() });
  }

  /**
   * Complete a quest
   * @param {string} playerId - Player ID
   * @param {string} questId - Quest ID
   * @param {number} optionId - Selected option ID
   * @returns {Promise} - Promise with quest outcome
   */
  completeQuest(playerId, questId, optionId) {
    return axios.post(
      `${API_URL}/players/${playerId}/quests/${questId}/complete`, 
      { optionId }, 
      { headers: authHeader() }
    );
  }

  /**
   * Make a decision
   * @param {string} playerId - Player ID
   * @param {string} decision - Decision text
   * @param {Object} context - Decision context
   * @returns {Promise} - Promise with decision evaluation
   */
  makeDecision(playerId, decision, context) {
    return axios.post(
      `${API_URL}/players/${playerId}/decisions`, 
      { decision, context }, 
      { headers: authHeader() }
    );
  }

  /**
   * Get player's controlled realms
   * @param {string} playerId - Player ID
   * @returns {Promise} - Promise with player's realms
   */
  getPlayerRealms(playerId) {
    return axios.get(`${API_URL}/players/${playerId}/realms`, { headers: authHeader() });
  }

  /**
   * Claim a realm
   * @param {string} playerId - Player ID
   * @param {string} realmId - Realm ID
   * @returns {Promise} - Promise with claim result
   */
  claimRealm(playerId, realmId) {
    return axios.post(
      `${API_URL}/players/${playerId}/realms/${realmId}/claim`, 
      {}, 
      { headers: authHeader() }
    );
  }

  /**
   * Get player's karma history
   * @param {string} playerId - Player ID
   * @returns {Promise} - Promise with karma history
   */
  getKarmaHistory(playerId) {
    return axios.get(`${API_URL}/players/${playerId}/karma`, { headers: authHeader() });
  }

  /**
   * Get player's decision history
   * @param {string} playerId - Player ID
   * @returns {Promise} - Promise with decision history
   */
  getDecisionHistory(playerId) {
    return axios.get(`${API_URL}/players/${playerId}/decisions`, { headers: authHeader() });
  }

  /**
   * Set player ready status
   * @param {string} gameId - Game ID
   * @param {boolean} ready - Ready status
   * @returns {Promise} - Promise with updated status
   */
  setReady(gameId, ready) {
    return axios.post(
      `${API_URL}/games/${gameId}/ready`, 
      { ready }, 
      { headers: authHeader() }
    );
  }
}

export default new PlayerService();
