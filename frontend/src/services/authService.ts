import apiClient from './apiClient';
import { User } from '../context/AuthContext';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

/**
 * Service for authentication-related API calls
 */
export const authService = {
  /**
   * Register a new user
   * @param username - Username
   * @param email - Email address
   * @param password - Password
   * @param preferredRole - Preferred game role
   * @returns User data and token
   */
  async register(username: string, email: string, password: string, preferredRole?: string): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      username,
      email,
      password,
      preferredRole
    });
    
    return {
      user: response.data.user,
      token: response.data.token
    };
  },
  
  /**
   * Login a user
   * @param username - Username
   * @param password - Password
   * @returns User data and token
   */
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      username,
      password
    });
    
    return {
      user: response.data.user,
      token: response.data.token
    };
  },
  
  /**
   * Get user profile
   * @returns User data
   */
  async getProfile(): Promise<{ user: User }> {
    const response = await apiClient.get<ProfileResponse>('/auth/profile');
    
    return {
      user: response.data.user
    };
  },
  
  /**
   * Update user profile
   * @param profileData - Profile data to update
   * @returns Updated user data
   */
  async updateProfile(profileData: Partial<User>): Promise<{ user: User }> {
    const response = await apiClient.put<ProfileResponse>('/auth/profile', profileData);
    
    return {
      user: response.data.user
    };
  },
  
  /**
   * Change user password
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Success message
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/change-password', {
      currentPassword,
      newPassword
    });
    
    return response.message;
  }
};
