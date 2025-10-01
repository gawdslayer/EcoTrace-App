// Data transformation utilities for API responses and local data

import { User, Habit, Challenge, UserStats } from '../types/models';

// Raw data interfaces for transformation
interface RawUserData {
  id: number;
  username?: string;
  email?: string;
  totalImpactPoints?: number;
  joinedDate?: string;
  trackedHabits?: number[];
}

interface RawHabitData {
  id: number;
  name?: string;
  description?: string;
  category?: string;
  impact?: number;
}

interface RawChallengeData {
  id: number;
  name?: string;
  description?: string;
  duration?: string;
  participants?: number;
  reward?: number;
}

// Transform user data for consistent formatting
export const transformUser = (userData: RawUserData): User => {
  return {
    id: userData.id,
    username: userData.username || '',
    email: userData.email || '',
    totalImpactPoints: userData.totalImpactPoints || 0,
    joinedDate: userData.joinedDate || new Date().toISOString().split('T')[0],
    trackedHabits: userData.trackedHabits || [],
  };
};

// Transform habit data
export const transformHabit = (habitData: RawHabitData): Habit => {
  return {
    id: habitData.id,
    name: habitData.name || '',
    description: habitData.description || '',
    category: habitData.category || 'General',
    impact: habitData.impact || 0,
  };
};

// Transform challenge data
export const transformChallenge = (challengeData: RawChallengeData): Challenge => {
  return {
    id: challengeData.id,
    name: challengeData.name || '',
    description: challengeData.description || '',
    duration: challengeData.duration || '',
    participants: challengeData.participants || 0,
    reward: challengeData.reward || 0,
  };
};

// Calculate user statistics
export const calculateUserStats = (user: User, allUsers: User[]): UserStats => {
  // Sort users by impact points to determine rank
  const sortedUsers = [...allUsers].sort((a, b) => b.totalImpactPoints - a.totalImpactPoints);
  const userRank = sortedUsers.findIndex(u => u.id === user.id) + 1;
  
  // Calculate completion rate (mock calculation for now)
  const completionRate = user.trackedHabits.length > 0 ? 
    Math.min(100, (user.totalImpactPoints / (user.trackedHabits.length * 30)) * 100) : 0;
  
  return {
    totalPoints: user.totalImpactPoints,
    completedHabits: user.trackedHabits.length,
    currentStreak: Math.floor(user.totalImpactPoints / 10), // Mock streak calculation
    rank: userRank,
    completionRate: Math.round(completionRate),
  };
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format relative time (e.g., "2 days ago")
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
};

// Format impact points for display
export const formatImpactPoints = (points: number): string => {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }
  return points.toString();
};

// Group habits by category
export const groupHabitsByCategory = (habits: Habit[]): Record<string, Habit[]> => {
  return habits.reduce((groups, habit) => {
    const category = habit.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(habit);
    return groups;
  }, {} as Record<string, Habit[]>);
};

// Filter habits by user's tracked habits
export const getTrackedHabits = (allHabits: Habit[], trackedHabitIds: number[]): Habit[] => {
  return allHabits.filter(habit => trackedHabitIds.includes(habit.id));
};

// Get available habits (not yet tracked by user)
export const getAvailableHabits = (allHabits: Habit[], trackedHabitIds: number[]): Habit[] => {
  return allHabits.filter(habit => !trackedHabitIds.includes(habit.id));
};

// Sort challenges by participant count
export const sortChallengesByPopularity = (challenges: Challenge[]): Challenge[] => {
  return [...challenges].sort((a, b) => b.participants - a.participants);
};

// Sort users by impact points (leaderboard)
export const sortUsersByImpact = (users: User[]): User[] => {
  return [...users].sort((a, b) => b.totalImpactPoints - a.totalImpactPoints);
};