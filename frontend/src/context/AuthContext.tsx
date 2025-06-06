import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { authService } from '../services/authService';

// Define the User type
export interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  preferredRole?: string;
  profilePicture?: string;
  karmaScore?: number;
  totalGamesPlayed?: number;
  totalWins?: number;
  isGuest?: boolean;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, preferredRole?: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

// Create the AuthContext
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  checkAuth: async () => {},
  clearError: () => {},
});

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const guestId = localStorage.getItem('guestId');
      
      // If we have a token, try to authenticate as a regular user
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser({ ...userData.user, isGuest: false });
          setIsAuthenticated(true);
          return;
        } catch (error) {
          console.error('Failed to authenticate with token:', error);
          localStorage.removeItem('token');
        }
      }
      
      // If we have a guest ID, restore guest session
      if (guestId) {
        const guestUsername = localStorage.getItem('guestUsername') || `Guest-${Math.floor(Math.random() * 10000)}`;
        setUser({
          id: guestId,
          username: guestUsername,
          role: 'guest',
          isGuest: true,
          karmaScore: 0,
          totalGamesPlayed: 0,
          totalWins: 0
        });
        setIsAuthenticated(true);
        return;
      }
      
      // No valid session found
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Authentication check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('guestId');
      localStorage.removeItem('guestUsername');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authService.login(username, password);
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set user data and authentication state
      setUser({ ...data.user, isGuest: false });
      setIsAuthenticated(true);
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login as guest function
  const loginAsGuest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate a guest user
      const guestId = `guest-${Date.now()}`;
      const guestUsername = `Guest-${Math.floor(Math.random() * 10000)}`;
      
      const guestUser: User = {
        id: guestId,
        username: guestUsername,
        role: 'guest',
        isGuest: true,
        karmaScore: 0,
        totalGamesPlayed: 0,
        totalWins: 0
      };
      
      // Store guest info in localStorage
      localStorage.setItem('guestId', guestId);
      localStorage.setItem('guestUsername', guestUsername);
      
      // Set guest user data and authentication state
      setUser(guestUser);
      setIsAuthenticated(true);
    } catch (error: any) {
      setError('Failed to login as guest. Please try again.');
      console.error('Guest login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = async (username: string, email: string, password: string, preferredRole?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authService.register(username, email, password, preferredRole);
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set user data and authentication state
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('guestId');
    localStorage.removeItem('guestUsername');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        loginAsGuest,
        logout,
        checkAuth,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
