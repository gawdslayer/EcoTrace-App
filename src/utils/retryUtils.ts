// Retry utilities for handling failed operations

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  maxDelay?: number;
  retryCondition?: (error: unknown) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
  retryCondition: (error: unknown) => {
    // Don't retry authentication errors or client errors (4xx)
    if (error instanceof Error) {
      if (error.message?.includes('Authentication failed')) return false;
      if (error.message?.includes('Access denied')) return false;
      if (error.message?.includes('Invalid request')) return false;
    }
    
    // Retry network errors and server errors (5xx)
    return true;
  },
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...defaultOptions, ...options };
  let lastError: Error;
  let currentDelay = config.delay;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if this is the last attempt
      if (attempt === config.maxAttempts) {
        break;
      }
      
      // Don't retry if the retry condition returns false
      if (!config.retryCondition(error)) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      // Increase delay for next attempt (exponential backoff)
      currentDelay = Math.min(
        currentDelay * config.backoffMultiplier,
        config.maxDelay
      );
    }
  }
  
  throw lastError!;
}

// Specific retry configurations for different scenarios
export const retryConfigs = {
  // For critical operations that should be retried aggressively
  critical: {
    maxAttempts: 5,
    delay: 500,
    backoffMultiplier: 1.5,
    maxDelay: 5000,
  },
  
  // For normal API calls
  normal: {
    maxAttempts: 3,
    delay: 1000,
    backoffMultiplier: 2,
    maxDelay: 8000,
  },
  
  // For background operations that can fail silently
  background: {
    maxAttempts: 2,
    delay: 2000,
    backoffMultiplier: 2,
    maxDelay: 10000,
  },
  
  // For user-initiated actions that should retry quickly
  userAction: {
    maxAttempts: 3,
    delay: 500,
    backoffMultiplier: 1.8,
    maxDelay: 3000,
  },
};

// Queue for managing retry operations
class RetryQueue {
  private queue: Array<{
    id: string;
    operation: () => Promise<unknown>;
    options: RetryOptions;
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];
  
  private processing = false;

  async add<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 11);
      
      this.queue.push({
        id,
        operation,
        options,
        resolve,
        reject,
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        const result = await withRetry(item.operation, item.options);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }

    this.processing = false;
  }

  clear() {
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }

  size() {
    return this.queue.length;
  }
}

export const retryQueue = new RetryQueue();