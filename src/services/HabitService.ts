import { apiService } from './ApiService';
import { logError, getErrorMessage } from '../utils/errorHandling';
import { withRetry, retryConfigs } from '../utils/retryUtils';
import { storeUser } from '../utils/storage';

import type { User } from '../types/models';

export class HabitService {
  // Track a habit for a user
  static async trackHabit(userId: number, habitId: number): Promise<User> {
    try {
      const response = await withRetry(
        () => apiService.trackHabit(userId, habitId),
        retryConfigs.userAction
      );
      
      // Update stored user data
      if (response.user) {
        await storeUser(response.user);
      }
      
      return response.user;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'HabitService.trackHabit', { 
        userId, 
        habitId,
        errorMessage 
      });
      throw new Error(errorMessage);
    }
  }

  // Untrack a habit for a user
  static async untrackHabit(userId: number, habitId: number): Promise<User> {
    try {
      const response = await withRetry(
        () => apiService.untrackHabit(userId, habitId),
        retryConfigs.userAction
      );
      
      // Update stored user data
      if (response.user) {
        await storeUser(response.user);
      }
      
      return response.user;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'HabitService.untrackHabit', { 
        userId, 
        habitId,
        errorMessage 
      });
      throw new Error(errorMessage);
    }
  }

  // Complete a habit and earn points
  static async completeHabit(userId: number, habitId: number): Promise<{
    user: User;
    pointsEarned: number;
    newTotal: number;
  }> {
    try {
      const response = await withRetry(
        () => apiService.completeHabit(userId, habitId),
        retryConfigs.userAction
      );
      
      // Update stored user data
      if (response.user) {
        await storeUser(response.user);
      }
      
      return {
        user: response.user,
        pointsEarned: response.pointsEarned,
        newTotal: response.newTotal,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'HabitService.completeHabit', { 
        userId, 
        habitId,
        errorMessage 
      });
      throw new Error(errorMessage);
    }
  }

  // Get user's habit completion history (mock for now)
  static async getHabitHistory(userId: number): Promise<unknown[]> {
    try {
      // TODO: Implement when backend supports habit history
      return [];
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'HabitService.getHabitHistory', { 
        userId,
        errorMessage 
      });
      throw new Error(errorMessage);
    }
  }

  // Calculate habit streaks (mock for now)
  static calculateHabitStreak(): number {
    // TODO: Implement streak calculation logic
    return Math.floor(Math.random() * 7) + 1; // Mock streak 1-7 days
  }

  // Get habit statistics
  static getHabitStats(userId: number, habits: unknown[], trackedHabits: number[]) {
    const totalHabits = habits.length;
    const userTrackedHabits = trackedHabits.length;
    const completionRate = userTrackedHabits > 0 ? 
      Math.floor((userTrackedHabits / totalHabits) * 100) : 0;
    
    const totalPossiblePoints = habits.reduce((sum, habit) => sum + habit.impact, 0);
    const trackedPoints = habits
      .filter(habit => trackedHabits.includes(habit.id))
      .reduce((sum, habit) => sum + habit.impact, 0);

    return {
      totalHabits,
      trackedHabits: userTrackedHabits,
      completionRate,
      totalPossiblePoints,
      trackedPoints,
    };
  }
}

export default HabitService;