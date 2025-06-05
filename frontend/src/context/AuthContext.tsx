import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { authService } from '../services/authService';

// Define the User type
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  preferredRole?: string;
  profilePicture?: string;
  karmaScore: number;
  totalGamesPlayed: number;
  totalWins: number;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, preferredRole?: string) => Promise<void>;
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
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      const userData = await authService.getProfile();
      setUser(userData.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication check failed:', error);
      localStorage.removeItem('token');
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
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

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
        logout,
        checkAuth,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
