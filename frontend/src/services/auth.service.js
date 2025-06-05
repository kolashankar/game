import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://game-ujiz.onrender.com/api';

/**
 * Auth Service
 * Handles API calls related to authentication
 */
class AuthService {
  /**
   * Register a new user
   * @param {string} username - Username
   * @param {string} email - Email
   * @param {string} password - Password
   * @param {Object} profile - Additional profile data
   * @returns {Promise} - Promise with registration result
   */
  register(username, email, password, profile = {}) {
    return axios.post(`${API_URL}/auth/register`, {
      username,
      email,
      password,
      ...profile
    });
  }

  /**
   * Login user
   * @param {string} username - Username or email
   * @param {string} password - Password
   * @returns {Promise} - Promise with login result
   */
  login(username, password) {
    return axios
      .post(`${API_URL}/auth/login`, {
        username,
        password
      })
      .then(response => {
        if (response.data.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data.data));
        }

        return response.data;
      });
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('user');
  }

  /**
   * Get current user
   * @returns {Object} - Current user data
   */
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  /**
   * Check if user is logged in
   * @returns {boolean} - True if user is logged in
   */
  isLoggedIn() {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }

  /**
   * Refresh token
   * @returns {Promise} - Promise with refresh result
   */
  refreshToken() {
    const user = this.getCurrentUser();
    
    if (!user || !user.refreshToken) {
      return Promise.reject('No refresh token available');
    }
    
    return axios
      .post(`${API_URL}/auth/refresh-token`, {
        refreshToken: user.refreshToken
      })
      .then(response => {
        if (response.data.data.token) {
          // Update stored user with new tokens
          localStorage.setItem('user', JSON.stringify({
            ...user,
            token: response.data.data.token,
            refreshToken: response.data.data.refreshToken
          }));
        }
        
        return response.data;
      });
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} - Promise with update result
   */
  updateProfile(profileData) {
    const user = this.getCurrentUser();
    
    if (!user || !user.token) {
      return Promise.reject('User not authenticated');
    }
    
    return axios
      .put(
        `${API_URL}/users/profile`, 
        profileData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      .then(response => {
        // Update stored user with new profile data
        localStorage.setItem('user', JSON.stringify({
          ...user,
          ...response.data.data.user
        }));
        
        return response.data;
      });
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} - Promise with request result
   */
  requestPasswordReset(email) {
    return axios.post(`${API_URL}/auth/forgot-password`, { email });
  }

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise} - Promise with reset result
   */
  resetPassword(token, password) {
    return axios.post(`${API_URL}/auth/reset-password`, {
      token,
      password
    });
  }
}

export default new AuthService();
