import { config } from '../config/environment';

import type {
  User,
  Habit,
  Challenge,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  HabitCompletionRequest,
  HabitCompletionResponse,
  TrackHabitRequest,
  TrackHabitResponse,
  UntrackHabitResponse,
  SessionValidationResponse,
  HealthCheckResponse,
  ApiError,
} from '../types/models';

class ApiService {
  private baseUrl: string;

  constructor() {
    // Use centralized configuration to get the correct base URL
    this.baseUrl = config.API_BASE_URL;
    if (config.ENABLE_LOGGING) {
      console.log('ApiService initialized with baseUrl:', this.baseUrl);
    }
  }

  // Helper method for making HTTP requests with comprehensive error handling
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Create manual timeout for React Native compatibility using centralized config
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.NETWORK_TIMEOUT);

    const requestConfig: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    };

    try {
      if (config.ENABLE_LOGGING) {
        console.log('Making request to:', url);
      }
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId); // Clear timeout on successful response
      if (config.ENABLE_LOGGING) {
        console.log('Response status:', response.status);
      }
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses (like HTML error pages)
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        // Handle different HTTP error codes
        switch (response.status) {
          case 400:
            throw new Error(data.error || 'Invalid request data');
          case 401:
            throw new Error('Authentication failed. Please log in again.');
          case 403:
            throw new Error('Access denied. You don\'t have permission for this action.');
          case 404:
            throw new Error('The requested resource was not found');
          case 429:
            throw new Error('Too many requests. Please try again later.');
          case 500:
            throw new Error('Server error. Please try again later.');
          case 503:
            throw new Error('Service temporarily unavailable. Please try again later.');
          default:
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId); // Clear timeout on error
      if (config.ENABLE_LOGGING) {
        console.error(`API request failed for ${endpoint}:`, error);
      }
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      // Re-throw the error if it's already a handled error
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<User> {
    if (config.ENABLE_LOGGING) {
      console.log('ApiService: Attempting login for:', email);
    }
    const requestData: LoginRequest = { email, password };
    const response = await this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    if (config.ENABLE_LOGGING) {
      console.log('ApiService: Login response received:', response);
    }
    return response.user;
  }

  async signup(username: string, email: string, password: string): Promise<User> {
    const requestData: SignupRequest = { username, email, password };
    const response = await this.makeRequest<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response.user;
  }

  // Data fetching endpoints
  async getHabits(): Promise<Habit[]> {
    return this.makeRequest<Habit[]>('/habits');
  }

  async getChallenges(): Promise<Challenge[]> {
    return this.makeRequest<Challenge[]>('/challenges');
  }

  async getUsers(): Promise<User[]> {
    return this.makeRequest<User[]>('/users');
  }

  async getUserById(id: number): Promise<User> {
    return this.makeRequest<User>(`/user/${id}`);
  }

  // Habit tracking endpoints
  async completeHabit(userId: number, habitId: number): Promise<HabitCompletionResponse> {
    const requestData: HabitCompletionRequest = { userId, habitId };
    return this.makeRequest<HabitCompletionResponse>('/habits/complete', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async trackHabit(userId: number, habitId: number): Promise<TrackHabitResponse> {
    const requestData: TrackHabitRequest = { userId, habitId };
    return this.makeRequest<TrackHabitResponse>('/habits/track', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async untrackHabit(userId: number, habitId: number): Promise<UntrackHabitResponse> {
    const requestData: TrackHabitRequest = { userId, habitId };
    return this.makeRequest<UntrackHabitResponse>('/habits/untrack', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Challenge endpoints
  async joinChallenge(userId: number, challengeId: number): Promise<void> {
    await this.makeRequest<void>('/challenges/join', {
      method: 'POST',
      body: JSON.stringify({ userId, challengeId }),
    });
  }

  async leaveChallenge(userId: number, challengeId: number): Promise<void> {
    await this.makeRequest<void>('/challenges/leave', {
      method: 'POST',
      body: JSON.stringify({ userId, challengeId }),
    });
  }

  // User profile endpoints
  async updateUserProfile(userId: number, updates: Partial<User>): Promise<User> {
    return this.makeRequest<User>(`/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Session validation
  async validateSession(userId: number): Promise<SessionValidationResponse> {
    try {
      const user = await this.getUserById(userId);
      return { valid: !!user };
    } catch (error) {
      return { valid: false };
    }
  }

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.makeRequest<HealthCheckResponse>('/health');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default ApiService;