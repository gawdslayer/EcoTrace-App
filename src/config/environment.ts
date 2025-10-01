/**
 * Centralized Environment Configuration
 * 
 * This file contains all environment-specific configuration values
 * for the EcoTrace mobile application. It automatically selects
 * the appropriate configuration based on the development environment.
 */

export interface AppConfig {
  // API Configuration
  API_BASE_URL: string;
  PRODUCTION_API_URL: string;
  LOCAL_API_IP: string;
  LOCAL_API_PORT: number;
  
  // Cache Configuration
  CACHE_DURATION: {
    SHORT: number;    // 2 minutes
    MEDIUM: number;   // 5 minutes  
    LONG: number;     // 15 minutes
    VERY_LONG: number; // 1 hour
  };
  
  // Network Configuration
  NETWORK_TIMEOUT: number;
  CONNECTION_TEST_TIMEOUT: number;
  
  // Retry Configuration
  RETRY_ATTEMPTS: {
    CRITICAL: number;
    NORMAL: number;
    BACKGROUND: number;
    USER_ACTION: number;
  };
  
  RETRY_DELAYS: {
    CRITICAL: number;
    NORMAL: number;
    BACKGROUND: number;
    USER_ACTION: number;
  };
  
  RETRY_MAX_DELAY: {
    CRITICAL: number;
    NORMAL: number;
    BACKGROUND: number;
    USER_ACTION: number;
  };
  
  // Development Configuration
  IS_LOCAL_TESTING: boolean;
  ENABLE_LOGGING: boolean;
}

/**
 * Development Configuration
 * Used when __DEV__ is true or when IS_LOCAL_TESTING is enabled
 */
const developmentConfig: AppConfig = {
  // API Configuration
  API_BASE_URL: 'http://192.168.0.88:3001/api',
  PRODUCTION_API_URL: 'https://ecotrace-api.onrender.com/api',
  LOCAL_API_IP: '192.168.0.88',
  LOCAL_API_PORT: 3001,
  
  // Cache Configuration (shorter durations for development)
  CACHE_DURATION: {
    SHORT: 1 * 60 * 1000,      // 1 minute
    MEDIUM: 3 * 60 * 1000,     // 3 minutes
    LONG: 10 * 60 * 1000,      // 10 minutes
    VERY_LONG: 30 * 60 * 1000, // 30 minutes
  },
  
  // Network Configuration
  NETWORK_TIMEOUT: 10000,           // 10 seconds
  CONNECTION_TEST_TIMEOUT: 5000,    // 5 seconds
  
  // Retry Configuration
  RETRY_ATTEMPTS: {
    CRITICAL: 5,
    NORMAL: 3,
    BACKGROUND: 2,
    USER_ACTION: 3,
  },
  
  RETRY_DELAYS: {
    CRITICAL: 500,
    NORMAL: 1000,
    BACKGROUND: 2000,
    USER_ACTION: 500,
  },
  
  RETRY_MAX_DELAY: {
    CRITICAL: 5000,
    NORMAL: 8000,
    BACKGROUND: 10000,
    USER_ACTION: 3000,
  },
  
  // Development Configuration
  IS_LOCAL_TESTING: false, // Set to true for local development
  ENABLE_LOGGING: true,
};

/**
 * Production Configuration
 * Used when __DEV__ is false and IS_LOCAL_TESTING is false
 */
const productionConfig: AppConfig = {
  // API Configuration
  API_BASE_URL: 'https://ecotrace-api.onrender.com/api',
  PRODUCTION_API_URL: 'https://ecotrace-api.onrender.com/api',
  LOCAL_API_IP: '192.168.0.88',
  LOCAL_API_PORT: 3001,
  
  // Cache Configuration (longer durations for production)
  CACHE_DURATION: {
    SHORT: 2 * 60 * 1000,      // 2 minutes
    MEDIUM: 5 * 60 * 1000,     // 5 minutes
    LONG: 15 * 60 * 1000,      // 15 minutes
    VERY_LONG: 60 * 60 * 1000, // 1 hour
  },
  
  // Network Configuration
  NETWORK_TIMEOUT: 15000,           // 15 seconds (longer for production)
  CONNECTION_TEST_TIMEOUT: 8000,    // 8 seconds
  
  // Retry Configuration
  RETRY_ATTEMPTS: {
    CRITICAL: 5,
    NORMAL: 3,
    BACKGROUND: 2,
    USER_ACTION: 3,
  },
  
  RETRY_DELAYS: {
    CRITICAL: 500,
    NORMAL: 1000,
    BACKGROUND: 2000,
    USER_ACTION: 500,
  },
  
  RETRY_MAX_DELAY: {
    CRITICAL: 5000,
    NORMAL: 8000,
    BACKGROUND: 10000,
    USER_ACTION: 3000,
  },
  
  // Production Configuration
  IS_LOCAL_TESTING: false,
  ENABLE_LOGGING: false, // Disable verbose logging in production
};

/**
 * Get the current configuration based on environment
 * 
 * Priority:
 * 1. If IS_LOCAL_TESTING is true in development config, use local API
 * 2. If __DEV__ is true, use development config
 * 3. Otherwise, use production config
 */
function getCurrentConfig(): AppConfig {
  // Check if we're in development mode
  const isDevelopment = __DEV__;
  
  if (isDevelopment) {
    // In development, check if local testing is enabled
    if (developmentConfig.IS_LOCAL_TESTING) {
      return {
        ...developmentConfig,
        API_BASE_URL: `http://${developmentConfig.LOCAL_API_IP}:${developmentConfig.LOCAL_API_PORT}/api`,
      };
    }
    return {
      ...developmentConfig,
      API_BASE_URL: developmentConfig.PRODUCTION_API_URL,
    };
  }
  
  return productionConfig;
}

/**
 * Current application configuration
 * This is the main export that should be used throughout the application
 */
export const config: AppConfig = getCurrentConfig();

/**
 * Helper function to get API base URL
 * Maintains backward compatibility with existing getApiBaseUrl function
 */
export const getApiBaseUrl = (): string => {
  if (config.ENABLE_LOGGING) {
    console.log('Environment config: Using base URL:', config.API_BASE_URL);
  }
  return config.API_BASE_URL;
};

/**
 * Helper function to get cache duration by type
 */
export const getCacheDuration = (type: keyof AppConfig['CACHE_DURATION']): number => {
  return config.CACHE_DURATION[type];
};

/**
 * Helper function to get retry configuration by type
 */
export const getRetryConfig = (type: keyof AppConfig['RETRY_ATTEMPTS']) => {
  return {
    maxAttempts: config.RETRY_ATTEMPTS[type],
    delay: config.RETRY_DELAYS[type],
    maxDelay: config.RETRY_MAX_DELAY[type],
  };
};

/**
 * Development utilities
 */
export const devUtils = {
  /**
   * Toggle local testing mode (development only)
   */
  setLocalTesting: (enabled: boolean) => {
    if (__DEV__) {
      (developmentConfig as typeof developmentConfig & { IS_LOCAL_TESTING: boolean }).IS_LOCAL_TESTING = enabled;
      // Update the current config
      Object.assign(config, getCurrentConfig());
      console.log('Local testing mode:', enabled ? 'enabled' : 'disabled');
      console.log('New API base URL:', config.API_BASE_URL);
    }
  },
  
  /**
   * Get current environment info
   */
  getEnvironmentInfo: () => ({
    isDevelopment: __DEV__,
    isLocalTesting: config.IS_LOCAL_TESTING,
    apiBaseUrl: config.API_BASE_URL,
    loggingEnabled: config.ENABLE_LOGGING,
  }),
};

// Log configuration on startup (development only)
if (__DEV__ && config.ENABLE_LOGGING) {
  console.log('=== EcoTrace Environment Configuration ===');
  console.log('Environment:', __DEV__ ? 'Development' : 'Production');
  console.log('Local Testing:', config.IS_LOCAL_TESTING);
  console.log('API Base URL:', config.API_BASE_URL);
  console.log('Cache Durations:', config.CACHE_DURATION);
  console.log('Network Timeout:', config.NETWORK_TIMEOUT);
  console.log('==========================================');
}