import React, { createContext, useContext, useState, ReactNode } from 'react';

import ErrorNotification from '../components/ErrorNotification';
import { logError } from '../utils/errorHandling';

interface ErrorNotification {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
  onRetry?: () => void;
  retryText?: string;
}

interface ErrorContextType {
  showError: (message: string, onRetry?: () => void, retryText?: string) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  dismissError: (id: string) => void;
  dismissAllErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const addNotification = (notification: Omit<ErrorNotification, 'id'>) => {
    const id = generateId();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Log error for debugging
    if (notification.type === 'error') {
      logError(new Error(notification.message), 'ErrorContext');
    }
    
    return id;
  };

  const showError = (
    message: string, 
    onRetry?: () => void, 
    retryText: string = 'Retry'
  ) => {
    addNotification({
      message,
      type: 'error',
      duration: 0, // Don't auto-dismiss errors
      onRetry,
      retryText,
    });
  };

  const showWarning = (message: string, duration: number = 4000) => {
    addNotification({
      message,
      type: 'warning',
      duration,
    });
  };

  const showInfo = (message: string, duration: number = 3000) => {
    addNotification({
      message,
      type: 'info',
      duration,
    });
  };

  const showSuccess = (message: string, duration: number = 3000) => {
    addNotification({
      message,
      type: 'success',
      duration,
    });
  };

  const dismissError = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const dismissAllErrors = () => {
    setNotifications([]);
  };

  const contextValue: ErrorContextType = {
    showError,
    showWarning,
    showInfo,
    showSuccess,
    dismissError,
    dismissAllErrors,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      
      {/* Render notifications */}
      {notifications.map((notification) => (
        <ErrorNotification
          key={notification.id}
          visible={true}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onDismiss={() => dismissError(notification.id)}
          onRetry={notification.onRetry}
          retryText={notification.retryText}
        />
      ))}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;