import apiClient from './apiClient';
import { Game } from '../context/GameContext';

interface GamesResponse {
  success: boolean;
  games: Game[];
}

interface GameResponse {
  success: boolean;
  game: Game;
}

interface CreateGameData {
  name: string;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  winCondition?: string;
  role: string;
  isGuest?: boolean;
  guestUsername?: string;
}

/**
 * Service for game-related API calls
 */
export const gameService = {
  /**
   * Get all available games
   * @returns List of games
   */
  async getGames(): Promise<{ games: Game[] }> {
    try {
      const response = await apiClient.get<GamesResponse>('/game');
      return {
        games: Array.isArray(response.data) ? response.data : (response.data.games || [])
      };
    } catch (error) {
      console.error('Error fetching games:', error);
      return { games: [] };
    }
  },
  
  /**
   * Get a specific game by ID
   * @param gameId - Game ID
   * @returns Game data
   */
  async getGameById(gameId: string): Promise<{ game: Game | null }> {
    try {
      const response = await apiClient.get<GameResponse>(`/game/${gameId}`);
      return {
        game: response.data.game
      };
    } catch (error) {
      console.error('Error fetching game:', error);
      return { game: null };
    }
  },
  
  /**
   * Create a new game
   * @param gameData - Game creation data
   * @returns Created game data
   */
  async createGame(gameData: CreateGameData): Promise<{ game: Game | null }> {
    try {
      const response = await apiClient.post<GameResponse>('/game', gameData);
      return {
        game: response.data.game
      };
    } catch (error) {
      console.error('Error creating game:', error);
      return { game: null };
    }
  },
  
  /**
   * Join a game
   * @param gameId - Game ID
   * @param role - Player role
   * @param password - Game password (for private games)
   * @returns Success message
   */
  async joinGame(gameId: string, role: string, password?: string): Promise<string> {
    try {
      const requestData: any = { role };
      
      // Add password if provided
      if (password) {
        requestData.password = password;
      }
      
      // Add guest user info if this is a guest
      const guestId = localStorage.getItem('guestId');
      if (guestId) {
        requestData.isGuest = true;
        requestData.guestUsername = localStorage.getItem('guestUsername') || `Guest-${Math.floor(Math.random() * 10000)}`;
      }
      
      const response = await apiClient.post<{ success: boolean; message: string }>(
        `/game/${gameId}/join`,
        requestData
      );
      
      return response.data?.message || 'Joined game successfully';
    } catch (error: any) {
      console.error('Error joining game:', error);
      return error.response?.data?.message || 'Failed to join game';
    }
  },
  
  /**
   * Leave a game
   * @param gameId - Game ID
   * @returns Success message
   */
  async leaveGame(gameId: string): Promise<string> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(`/game/${gameId}/leave`);
      return response.data?.message || 'Left game successfully';
    } catch (error: any) {
      console.error('Error leaving game:', error);
      return error.response?.data?.message || 'Failed to leave game';
    }
  },
  
  /**
   * Start a game
   * @param gameId - Game ID
   * @returns Success message
   */
  async startGame(gameId: string): Promise<string> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(`/game/${gameId}/start`);
      return response.data?.message || 'Game started successfully';
    } catch (error: any) {
      console.error('Error starting game:', error);
      return error.response?.data?.message || 'Failed to start game';
    }
  },
  
  /**
   * Set player ready status
   * @param gameId - Game ID
   * @param ready - Ready status
   * @returns Success message
   */
  async setPlayerReady(gameId: string, ready: boolean): Promise<string> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(`/game/${gameId}/ready`, {
        ready
      });
      return response.data?.message || 'Ready status updated';
    } catch (error: any) {
      console.error('Error updating ready status:', error);
      return error.response?.data?.message || 'Failed to update ready status';
    }
  }
};
