import apiClient from './apiClient';
import { Game } from '../context/GameContext';

interface GamesResponse {
  success: boolean;
  data: {
    games: Game[];
  };
}

interface GameResponse {
  success: boolean;
  data: {
    game: Game;
  };
}

interface CreateGameData {
  name: string;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  winCondition?: string;
  role: string;
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
    const response = await apiClient.get<GamesResponse>('/game');
    
    return {
      games: response.data.games
    };
  },
  
  /**
   * Get a specific game by ID
   * @param gameId - Game ID
   * @returns Game data
   */
  async getGameById(gameId: string): Promise<{ game: Game }> {
    const response = await apiClient.get<GameResponse>(`/game/${gameId}`);
    
    return {
      game: response.data.game
    };
  },
  
  /**
   * Create a new game
   * @param gameData - Game creation data
   * @returns Created game data
   */
  async createGame(gameData: CreateGameData): Promise<{ game: Game }> {
    const response = await apiClient.post<GameResponse>('/game', gameData);
    
    return {
      game: response.data.game
    };
  },
  
  /**
   * Join a game
   * @param gameId - Game ID
   * @param role - Player role
   * @param password - Game password (for private games)
   * @returns Success message
   */
  async joinGame(gameId: string, role: string, password?: string): Promise<string> {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/game/${gameId}/join`, {
      role,
      password
    });
    
    return response.message;
  },
  
  /**
   * Leave a game
   * @param gameId - Game ID
   * @returns Success message
   */
  async leaveGame(gameId: string): Promise<string> {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/game/${gameId}/leave`, {});
    
    return response.message;
  },
  
  /**
   * Start a game
   * @param gameId - Game ID
   * @returns Success message
   */
  async startGame(gameId: string): Promise<string> {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/game/${gameId}/start`, {});
    
    return response.message;
  },
  
  /**
   * Set player ready status
   * @param gameId - Game ID
   * @param ready - Ready status
   * @returns Success message
   */
  async setPlayerReady(gameId: string, ready: boolean): Promise<string> {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/game/${gameId}/ready`, {
      ready
    });
    
    return response.message;
  }
};
