import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';

import { apiService } from '../services/ApiService';
import { useAuth } from './AuthContext';
import { useError } from './ErrorContext';
import { useAppFocus } from '../hooks/useAppFocus';
import { getErrorMessage, logError } from '../utils/errorHandling';
import { withRetry, retryConfigs } from '../utils/retryUtils';
import { dataCache, CACHE_KEYS, CACHE_EXPIRATION, migrateLegacyCache } from '../utils/dataCache';

import type { Habit, Challenge, User } from '../types/models';

// App data state interface
interface AppDataState {
  habits: Habit[];
  challenges: Challenge[];
  users: User[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// App data actions
type AppDataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'SET_CHALLENGES'; payload: Challenge[] }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_ALL_DATA'; payload: { habits: Habit[]; challenges: Challenge[]; users: User[] } }
  | { type: 'SET_LAST_UPDATED'; payload: string };

// App data context interface
interface AppDataContextType extends AppDataState {
  refreshData: (force?: boolean) => Promise<void>;
  refreshHabits: (force?: boolean) => Promise<void>;
  refreshChallenges: (force?: boolean) => Promise<void>;
  refreshUsers: (force?: boolean) => Promise<void>;
  clearError: () => void;
  clearCache: () => Promise<void>;
  isDataStale: () => boolean;
}

// Initial state
const initialState: AppDataState = {
  habits: [],
  challenges: [],
  users: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// App data reducer
const appDataReducer = (state: AppDataState, action: AppDataAction): AppDataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case 'SET_HABITS':
      return {
        ...state,
        habits: action.payload,
      };
    
    case 'SET_CHALLENGES':
      return {
        ...state,
        challenges: action.payload,
      };
    
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
      };
    
    case 'SET_ALL_DATA':
      return {
        ...state,
        habits: action.payload.habits,
        challenges: action.payload.challenges,
        users: action.payload.users,
        loading: false,
        error: null,
      };
    
    case 'SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: action.payload,
      };
    
    default:
      return state;
  }
};

// Create context
const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// App data provider component
interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appDataReducer, initialState);
  const { isAuthenticated } = useAuth();
  const { showError } = useError();

  // Load cached data on startup
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        // Migrate any legacy cache data first
        await migrateLegacyCache();
        
        const [cachedHabits, cachedChallenges, cachedUsers] = await Promise.all([
          dataCache.get<Habit[]>(CACHE_KEYS.HABITS),
          dataCache.get<Challenge[]>(CACHE_KEYS.CHALLENGES),
          dataCache.get<User[]>(CACHE_KEYS.USERS),
        ]);

        if (cachedHabits || cachedChallenges || cachedUsers) {
          dispatch({
            type: 'SET_ALL_DATA',
            payload: {
              habits: cachedHabits || [],
              challenges: cachedChallenges || [],
              users: cachedUsers || [],
            },
          });
        }
      } catch (error) {
        logError(error, 'AppDataContext.loadCachedData', { 
          cacheKeys: Object.values(CACHE_KEYS) 
        });
      }
    };

    loadCachedData();
  }, []);

  // Auto-refresh data when app comes to foreground
  useAppFocus({
    onFocus: useCallback(() => {
      if (isAuthenticated && isDataStale()) {
        console.log('App focused and data is stale, refreshing...');
        refreshData(false); // Don't force, use cache if available
      }
    }, [isAuthenticated]),
  });

  // Check if data is stale (older than 5 minutes)
  const isDataStale = useCallback((): boolean => {
    if (!state.lastUpdated) return true;
    const lastUpdate = new Date(state.lastUpdated);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;
    return now.getTime() - lastUpdate.getTime() > fiveMinutes;
  }, [state.lastUpdated]);

  // Refresh all data with caching
  const refreshData = useCallback(async (force: boolean = false): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      // If not forcing and we have fresh cached data, use it
      if (!force && !isDataStale()) {
        console.log('Data is fresh, skipping refresh');
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      const [habits, challenges, users] = await Promise.all([
        withRetry(() => apiService.getHabits(), retryConfigs.normal),
        withRetry(() => apiService.getChallenges(), retryConfigs.normal),
        withRetry(() => apiService.getUsers(), retryConfigs.normal),
      ]);

      // Cache the data with appropriate expiration
      await Promise.all([
        dataCache.set(CACHE_KEYS.HABITS, habits, CACHE_EXPIRATION.MEDIUM),
        dataCache.set(CACHE_KEYS.CHALLENGES, challenges, CACHE_EXPIRATION.LONG),
        dataCache.set(CACHE_KEYS.USERS, users, CACHE_EXPIRATION.MEDIUM),
      ]);

      dispatch({
        type: 'SET_ALL_DATA',
        payload: { habits, challenges, users },
      });

      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date().toISOString() });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'AppDataContext.refreshData', { 
        isAuthenticated, 
        force, 
        isStale: isDataStale() 
      });
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Show user-friendly error notification
      showError(
        'Failed to refresh data. Please check your connection.',
        () => refreshData(true),
        'Retry'
      );
    }
  }, [isAuthenticated, isDataStale]);

  // Refresh habits only
  const refreshHabits = useCallback(async (force: boolean = false): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      // Check if habits cache is still valid
      if (!force && await dataCache.has(CACHE_KEYS.HABITS)) {
        const cachedHabits = await dataCache.get<Habit[]>(CACHE_KEYS.HABITS);
        if (cachedHabits) {
          dispatch({ type: 'SET_HABITS', payload: cachedHabits });
          return;
        }
      }

      const habits = await withRetry(() => apiService.getHabits(), retryConfigs.userAction);
      await dataCache.set(CACHE_KEYS.HABITS, habits, CACHE_EXPIRATION.MEDIUM);
      dispatch({ type: 'SET_HABITS', payload: habits });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'AppDataContext.refreshHabits', { 
        isAuthenticated, 
        force,
        cacheExists: await dataCache.has(CACHE_KEYS.HABITS)
      });
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Show user-friendly error notification
      showError(
        'Failed to load habits. Please try again.',
        () => refreshHabits(true),
        'Retry'
      );
    }
  }, [isAuthenticated]);

  // Refresh challenges only
  const refreshChallenges = useCallback(async (force: boolean = false): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      if (!force && await dataCache.has(CACHE_KEYS.CHALLENGES)) {
        const cachedChallenges = await dataCache.get<Challenge[]>(CACHE_KEYS.CHALLENGES);
        if (cachedChallenges) {
          dispatch({ type: 'SET_CHALLENGES', payload: cachedChallenges });
          return;
        }
      }

      const challenges = await withRetry(() => apiService.getChallenges(), retryConfigs.userAction);
      await dataCache.set(CACHE_KEYS.CHALLENGES, challenges, CACHE_EXPIRATION.LONG);
      dispatch({ type: 'SET_CHALLENGES', payload: challenges });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'AppDataContext.refreshChallenges', { 
        isAuthenticated, 
        force,
        cacheExists: await dataCache.has(CACHE_KEYS.CHALLENGES)
      });
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Show user-friendly error notification
      showError(
        'Failed to load challenges. Please try again.',
        () => refreshChallenges(true),
        'Retry'
      );
    }
  }, [isAuthenticated]);

  // Refresh users only
  const refreshUsers = useCallback(async (force: boolean = false): Promise<void> => {
    if (!isAuthenticated) return;

    try {
      if (!force && await dataCache.has(CACHE_KEYS.USERS)) {
        const cachedUsers = await dataCache.get<User[]>(CACHE_KEYS.USERS);
        if (cachedUsers) {
          dispatch({ type: 'SET_USERS', payload: cachedUsers });
          return;
        }
      }

      const users = await withRetry(() => apiService.getUsers(), retryConfigs.userAction);
      await dataCache.set(CACHE_KEYS.USERS, users, CACHE_EXPIRATION.MEDIUM);
      dispatch({ type: 'SET_USERS', payload: users });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'AppDataContext.refreshUsers', { 
        isAuthenticated, 
        force,
        cacheExists: await dataCache.has(CACHE_KEYS.USERS)
      });
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Show user-friendly error notification
      showError(
        'Failed to load users. Please try again.',
        () => refreshUsers(true),
        'Retry'
      );
    }
  }, [isAuthenticated]);

  // Clear all cached data
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      await dataCache.clear();
      console.log('All cached data cleared');
    } catch (error) {
      logError(error, 'AppDataContext.clearCache', { 
        cacheKeysAttempted: Object.values(CACHE_KEYS) 
      });
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Auto-refresh data when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && state.habits.length === 0) {
      refreshData();
    }
  }, [isAuthenticated, refreshData, state.habits.length]);

  const contextValue: AppDataContextType = {
    ...state,
    refreshData,
    refreshHabits,
    refreshChallenges,
    refreshUsers,
    clearError,
    clearCache,
    isDataStale,
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};

// Custom hook to use app data context
export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

export default AppDataContext;