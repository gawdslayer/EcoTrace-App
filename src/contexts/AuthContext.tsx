import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

import { apiService } from '../services/ApiService';
import { useError } from './ErrorContext';
import { getErrorMessage, logError } from '../utils/errorHandling';
import { withRetry, retryConfigs } from '../utils/retryUtils';
import { storeUser, getUser, removeUser, storeAuthToken, getAuthToken, removeAuthToken } from '../utils/storage';

import type { User } from '../types/models';

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initializing: boolean;
}

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_INITIALIZING'; payload: boolean }
  | { type: 'RESTORE_SESSION'; payload: User };

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (updatedUser: User) => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initializing: true,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error, // Clear error when starting new operation
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
        initializing: false,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        initializing: false,
      };
    
    case 'SET_INITIALIZING':
      return {
        ...state,
        initializing: action.payload,
      };
    
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        initializing: false,
        loading: false,
        error: null,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { showError } = useError();

  // Restore session on app startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        dispatch({ type: 'SET_INITIALIZING', payload: true });
        
        const storedUser = await getUser();
        const authToken = await getAuthToken();
        
        if (storedUser && authToken) {
          // Validate session by checking if user still exists
          try {
            const validation = await apiService.validateSession(storedUser.id);
            if (validation.valid) {
              dispatch({ type: 'RESTORE_SESSION', payload: storedUser });
            } else {
              // Session is invalid, clear stored data
              await removeUser();
              await removeAuthToken();
              dispatch({ type: 'SET_INITIALIZING', payload: false });
            }
          } catch (error) {
            // Network error or server down, assume session is valid for offline use
            logError(error, 'AuthContext.validateSession', { 
              userId: storedUser.id,
              hasAuthToken: !!authToken 
            });
            dispatch({ type: 'RESTORE_SESSION', payload: storedUser });
          }
        } else {
          dispatch({ type: 'SET_INITIALIZING', payload: false });
        }
      } catch (error) {
        logError(error, 'AuthContext.restoreSession', { 
          hasStoredUser: !!storedUser,
          hasAuthToken: !!authToken 
        });
        dispatch({ type: 'SET_INITIALIZING', payload: false });
      }
    };

    restoreSession();
  }, []);

  // Login function with retry logic
  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('AuthContext: Starting login for:', email);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const user = await withRetry(
        () => apiService.login(email, password),
        retryConfigs.userAction
      );
      
      console.log('AuthContext: Login successful for user:', user.username);
      
      // Store user data and auth token
      await storeUser(user);
      await storeAuthToken('mock_token_' + user.id); // In real app, backend would provide token
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'AuthContext.login', { 
        email,
        attemptedRetry: true 
      });
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Show user-friendly error notification
      showError(
        errorMessage,
        () => login(email, password),
        'Try Again'
      );
      
      throw error;
    }
  };

  // Signup function with retry logic
  const signup = async (username: string, email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const user = await withRetry(
        () => apiService.signup(username, email, password),
        retryConfigs.userAction
      );
      
      // Store user data and auth token
      await storeUser(user);
      await storeAuthToken('mock_token_' + user.id); // In real app, backend would provide token
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'AuthContext.signup', { 
        username,
        email,
        attemptedRetry: true 
      });
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Show user-friendly error notification
      showError(
        errorMessage,
        () => signup(username, email, password),
        'Try Again'
      );
      
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Clear stored data
      await removeUser();
      await removeAuthToken();
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      logError(error, 'AuthContext.logout', { 
        userId: state.user?.id,
        wasAuthenticated: state.isAuthenticated 
      });
      // Even if clearing storage fails, we should still log out the user
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Update user function (for habit tracking updates)
  const updateUser = (updatedUser: User): void => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUser });
  };

  // Check session validity periodically
  useEffect(() => {
    if (!state.isAuthenticated || !state.user) return;

    const checkSession = async () => {
      try {
        const validation = await apiService.validateSession(state.user!.id);
        if (!validation.valid) {
          // Session expired, logout user
          await logout();
        }
      } catch (error) {
        // Network error, don't logout user
        logError(error, 'AuthContext.checkSession', { 
          userId: state.user?.id,
          intervalCheck: true 
        });
      }
    };

    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.user]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active' && state.isAuthenticated && state.user) {
        // App came to foreground, validate session
        try {
          const validation = await apiService.validateSession(state.user.id);
          if (!validation.valid) {
            await logout();
          }
        } catch (error) {
          logError(error, 'AuthContext.handleAppStateChange', { 
            userId: state.user?.id,
            appState: nextAppState 
          });
        }
      }
    };

    // Note: In a real app, you'd import AppState from 'react-native'
    // and add the listener. For now, we'll skip this to avoid import issues
    // AppState.addEventListener('change', handleAppStateChange);
    
    // return () => AppState.removeEventListener('change', handleAppStateChange);
  }, [state.isAuthenticated, state.user]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;