import apiClient from './apiClient';
import { User } from '../context/AuthContext';
import { Game } from '../context/GameContext';

interface UserStatsResponse {
  success: boolean;
  data: {
    totalGames: number;
    wins: number;
    winRate: number;
    roleStats: Record<string, number>;
    recentGames: Game[];
  };
}

interface UserGamesResponse {
  success: boolean;
  data: {
    games: Game[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

interface LeaderboardResponse {
  success: boolean;
  data: {
    type: string;
    users: User[];
  };
}

/**
 * Service for user-related API calls
 */
export const userService = {
  /**
   * Get user statistics
   * @param userId - User ID (optional, defaults to current user)
   * @returns User statistics
   */
  async getUserStats(userId?: string): Promise<UserStatsResponse['data']> {
    const url = userId ? `/users/${userId}/stats` : '/users/stats';
    const response = await apiClient.get<UserStatsResponse>(url);
    
    return response.data.data;
  },
  
  /**
   * Get user games
   * @param status - Game status filter
   * @param page - Page number
   * @param limit - Items per page
   * @returns User games with pagination
   */
  async getUserGames(status?: string, page = 1, limit = 10): Promise<UserGamesResponse['data']> {
    const params: Record<string, string | number> = { page, limit };
    
    if (status) {
      params.status = status;
    }
    
    const response = await apiClient.get<UserGamesResponse>('/users/games', { params });
    
    return response.data.data;
  },
  
  /**
   * Get leaderboard
   * @param type - Leaderboard type (wins, karma, games)
   * @param limit - Number of users to return
   * @returns Leaderboard data
   */
  async getLeaderboard(type = 'wins', timeFrame = 'all', limit = 10): Promise<LeaderboardResponse['data']> {
    const response = await apiClient.get<LeaderboardResponse>('/users/leaderboard', {
      params: { type, timeFrame, limit }
    });
    
    return response.data.data;
  }
};
