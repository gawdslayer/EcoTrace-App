// Session management utilities

import { getAuthToken, removeAuthToken, removeUser } from './storage';
import { logError } from './errorHandling';

// Check if session is expired (mock implementation)
export const isSessionExpired = (loginTime: string): boolean => {
  const now = new Date().getTime();
  const login = new Date(loginTime).getTime();
  const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  return (now - login) > sessionDuration;
};

// Clear all session data
export const clearSession = async (): Promise<void> => {
  try {
    await removeUser();
    await removeAuthToken();
  } catch (error) {
    logError(error, 'sessionUtils.clearSession');
  }
};

// Check if user has valid token
export const hasValidToken = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    logError(error, 'sessionUtils.hasValidToken');
    return false;
  }
};

// Generate session info for debugging
export const getSessionInfo = async (): Promise<{
  hasToken: boolean;
  tokenPreview?: string;
}> => {
  try {
    const token = await getAuthToken();
    return {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : undefined,
    };
  } catch (error) {
    logError(error, 'sessionUtils.getSessionInfo');
    return { hasToken: false };
  }
};

// Session timeout warning (for future implementation)
export const shouldShowSessionWarning = (loginTime: string): boolean => {
  const now = new Date().getTime();
  const login = new Date(loginTime).getTime();
  const warningThreshold = 23 * 60 * 60 * 1000; // 23 hours - warn 1 hour before expiry
  
  return (now - login) > warningThreshold;
};