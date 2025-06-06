import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get base URL from environment with fallback
const getBaseUrl = (): string => {
  try {
    // @ts-ignore - import.meta.env is defined by Vite
    return import.meta.env?.VITE_API_URL || 'https://game-ujiz.onrender.com/api';
  } catch (error) {
    return 'https://game-ujiz.onrender.com/api';
  }
};

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token) {
      // Initialize headers if they don't exist
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      // Set the authorization header
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Clear token if it's invalid or expired
        localStorage.removeItem('token');
        
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Extract error message from response
      const errorData = error.response?.data as { message?: string } | undefined;
      const errorMessage = 
        errorData?.message || 
        error.message || 
        'An unexpected error occurred';
      
      return Promise.reject(new Error(errorMessage));
    }
    
    // Handle non-Axios errors
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
