// Error handling utilities for the app

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error message mapping for user-friendly messages
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof NetworkError) {
    return 'Please check your internet connection and try again.';
  }
  
  if (error instanceof AuthenticationError) {
    return 'Invalid credentials. Please check your email and password.';
  }
  
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  // Handle API errors
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    // Common API error messages
    if (error.message.includes('Invalid credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    
    if (error.message.includes('User already exists')) {
      return 'An account with this email already exists.';
    }
    
    if (error.message.includes('User not found')) {
      return 'Account not found. Please check your email.';
    }
    
    if (error.message.includes('Network request failed')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    
    return error.message;
  }
  
  // Default error message
  return 'Something went wrong. Please try again.';
};

// Retry mechanism for failed requests
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry authentication errors
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      // Don't retry validation errors
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

// Check if device is online (basic check)
export const isOnline = async (): Promise<boolean> => {
  try {
    await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return true;
  } catch {
    return false;
  }
};

// Log errors for debugging with enhanced context information
export const logError = (
  error: unknown, 
  context?: string, 
  additionalContext?: Record<string, unknown>
): void => {
  const timestamp = new Date().toISOString();
  const contextInfo = context ? ` [${context}]` : '';
  
  // Create structured log entry for debugging
  const errorInfo = {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : 'Unknown',
    stack: error instanceof Error ? error.stack : undefined,
    ...additionalContext,
  };
  
  console.error(`${timestamp}${contextInfo}:`, error);
  
  // Log additional context if provided
  if (additionalContext && Object.keys(additionalContext).length > 0) {
    console.error('Additional context:', additionalContext);
  }
  
  // In production, you might want to send errors to a logging service
  // Example: Sentry, Bugsnag, etc.
  // logToService(logEntry);
};