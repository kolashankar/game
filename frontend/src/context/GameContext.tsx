import { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { gameService } from '../services/gameService';
import { useAuth } from '../hooks/useAuth';

// Define game-related types
export interface Game {
  id: string;
  name: string;
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
  currentEra: 'Initiation' | 'Progression' | 'Distortion' | 'Equilibrium';
  currentTurn: number;
  currentPlayerIndex: number;
  maxPlayers: number;
  isPrivate: boolean;
  winCondition: string;
  globalKarma: number;
  creator: {
    id: string;
    username: string;
  };
  players: GamePlayer[];
  timelines?: Timeline[];
  events?: GameEvent[];
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GamePlayer {
  id: string;
  username: string;
  role: 'Techno Monk' | 'Shadow Broker' | 'Chrono Diplomat' | 'Bio-Smith';
  karma: number;
  ownedRealms: string[];
  techLevel: number;
  unlockedTechnologies: string[];
  currentResearch: string | null;
  researchProgress: number;
  inventory: Record<string, any>;
  isReady: boolean;
  isWinner: boolean;
  isActive: boolean;
}

export interface Timeline {
  id: string;
  name: string;
  description: string;
  type: string;
  stability: number;
  techLevel: number;
  karmaAlignment: number;
  connectedTimelines: string[];
  realms: Realm[];
}

export interface Realm {
  id: string;
  name: string;
  description: string;
  type: string;
  position: { x: number; y: number };
  ownerId: string | null;
  developmentLevel: number;
  resources: Record<string, number>;
  structures: any[];
  adjacentRealms: string[];
}

export interface GameEvent {
  id: string;
  type: string;
  description: string;
  affectedPlayers: string[];
  affectedRealms: string[];
  karmaImpact: number;
  turn: number;
  data: any;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

// Define the GameContext type
interface GameContextType {
  games: Game[];
  currentGame: Game | null;
  loading: boolean;
  error: string | null;
  socket: Socket | null;
  chatMessages: ChatMessage[];
  fetchGames: () => Promise<void>;
  fetchGameById: (gameId: string) => Promise<void>;
  createGame: (gameData: any) => Promise<Game>;
  joinGame: (gameId: string, role: string, password?: string) => Promise<void>;
  leaveGame: (gameId: string) => Promise<void>;
  startGame: (gameId: string) => Promise<void>;
  setPlayerReady: (gameId: string, ready: boolean) => Promise<void>;
  performGameAction: (gameId: string, action: string, payload: any) => void;
  sendChatMessage: (gameId: string, message: string) => void;
  clearError: () => void;
}

// Create the GameContext
export const GameContext = createContext<GameContextType>({
  games: [],
  currentGame: null,
  loading: false,
  error: null,
  socket: null,
  chatMessages: [],
  fetchGames: async () => {},
  fetchGameById: async () => {},
  createGame: async () => ({ id: '' } as Game),
  joinGame: async () => {},
  leaveGame: async () => {},
  startGame: async () => {},
  setPlayerReady: async () => {},
  performGameAction: () => {},
  sendChatMessage: () => {},
  clearError: () => {},
});

// Create the GameProvider component
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const { isAuthenticated } = useAuth();

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      
      if (token) {
        const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
          auth: { token }
        });
        
        setSocket(socketInstance);
        
        // Socket event listeners
        socketInstance.on('connect', () => {
          console.log('Socket connected');
        });
        
        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
        });
        
        socketInstance.on('error', (error) => {
          console.error('Socket error:', error);
          setError(`Socket error: ${error.message}`);
        });
        
        socketInstance.on('game-update', (data) => {
          console.log('Game update:', data);
          // Refresh game data when an update is received
          if (currentGame) {
            fetchGameById(currentGame.id);
          }
        });
        
        socketInstance.on('chat-message', (message) => {
          setChatMessages((prev) => [...prev, message]);
        });
        
        return () => {
          socketInstance.disconnect();
        };
      }
    }
  }, [isAuthenticated]);

  // Fetch all available games
  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await gameService.getGames();
      setGames(data.games);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a specific game by ID
  const fetchGameById = useCallback(async (gameId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await gameService.getGameById(gameId);
      setCurrentGame(data.game);
      
      // Join game room via socket if connected
      if (socket && socket.connected) {
        socket.emit('join-game', gameId);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch game');
    } finally {
      setLoading(false);
    }
  }, [socket]);

  // Create a new game
  const createGame = async (gameData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await gameService.createGame(gameData);
      
      // Add the new game to the list
      setGames((prev) => [...prev, data.game]);
      
      return data.game;
    } catch (error: any) {
      setError(error.message || 'Failed to create game');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Join a game
  const joinGame = async (gameId: string, role: string, password?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await gameService.joinGame(gameId, role, password);
      
      // Fetch updated game data
      await fetchGameById(gameId);
      
      // Join game room via socket
      if (socket && socket.connected) {
        socket.emit('join-game', gameId);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to join game');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Leave a game
  const leaveGame = async (gameId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await gameService.leaveGame(gameId);
      
      // Leave game room via socket
      if (socket && socket.connected) {
        socket.emit('leave-game', gameId);
      }
      
      // Clear current game if it's the one we're leaving
      if (currentGame && currentGame.id === gameId) {
        setCurrentGame(null);
      }
      
      // Remove game from list if it was deleted
      setGames((prev) => prev.filter((game) => game.id !== gameId));
    } catch (error: any) {
      setError(error.message || 'Failed to leave game');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Start a game
  const startGame = async (gameId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await gameService.startGame(gameId);
      
      // Fetch updated game data
      await fetchGameById(gameId);
    } catch (error: any) {
      setError(error.message || 'Failed to start game');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Set player ready status
  const setPlayerReady = async (gameId: string, ready: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      await gameService.setPlayerReady(gameId, ready);
      
      // Fetch updated game data
      await fetchGameById(gameId);
    } catch (error: any) {
      setError(error.message || 'Failed to update ready status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Perform a game action via socket
  const performGameAction = (gameId: string, action: string, payload: any) => {
    if (!socket || !socket.connected) {
      setError('Socket not connected');
      return;
    }
    
    socket.emit('game-action', {
      gameId,
      action,
      payload
    });
  };

  // Send a chat message
  const sendChatMessage = (gameId: string, message: string) => {
    if (!socket || !socket.connected) {
      setError('Socket not connected');
      return;
    }
    
    socket.emit('chat-message', {
      gameId,
      message
    });
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <GameContext.Provider
      value={{
        games,
        currentGame,
        loading,
        error,
        socket,
        chatMessages,
        fetchGames,
        fetchGameById,
        createGame,
        joinGame,
        leaveGame,
        startGame,
        setPlayerReady,
        performGameAction,
        sendChatMessage,
        clearError,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
