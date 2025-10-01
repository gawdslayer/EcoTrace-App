// Data model interfaces for EcoTrace app

export interface User {
  id: number;
  username: string;
  email: string;
  totalImpactPoints: number;
  joinedDate: string;
  trackedHabits: number[];
}

export interface Habit {
  id: number;
  name: string;
  description: string;
  category: string;
  impact: number;
}

export interface Challenge {
  id: number;
  name: string;
  description: string;
  duration: string;
  participants: number;
  reward: number;
}

export interface HabitCompletion {
  id: number;
  userId: number;
  habitId: number;
  completedAt: string;
  points: number;
}

// API Response types
export interface LoginResponse {
  user: User;
}

export interface SignupResponse {
  user: User;
}

export interface HabitCompletionResponse {
  user: User;
  pointsEarned: number;
  newTotal: number;
}

export interface TrackHabitResponse {
  user: User;
}

export interface UntrackHabitResponse {
  user: User;
}

export interface SessionValidationResponse {
  valid: boolean;
}

export interface HealthCheckResponse {
  status: string;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
  timestamp: string;
}

// Error response types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode: number;
  timestamp: string;
  validationErrors?: ValidationError[];
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface HabitCompletionRequest {
  userId: number;
  habitId: number;
}

export interface TrackHabitRequest {
  userId: number;
  habitId: number;
}

// Habit categories enum
export enum HabitCategory {
  WASTE_REDUCTION = 'Waste Reduction',
  TRANSPORTATION = 'Transportation',
  ENERGY_SAVING = 'Energy Saving',
  FOOD = 'Food',
}

// User statistics interface
export interface UserStats {
  totalPoints: number;
  completedHabits: number;
  currentStreak: number;
  rank: number;
  completionRate: number;
}