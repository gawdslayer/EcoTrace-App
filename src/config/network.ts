import { config, getApiBaseUrl as getConfigApiBaseUrl } from './environment';

/**
 * Get API base URL from centralized configuration
 * 
 * @deprecated Use getApiBaseUrl from environment.ts instead
 * This function is maintained for backward compatibility
 */
export const getApiBaseUrl = (): string => {
  return getConfigApiBaseUrl();
};

/**
 * Test connectivity to server using centralized configuration
 */
export const testServerConnection = async (baseUrl?: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.CONNECTION_TEST_TIMEOUT);

    // Use provided baseUrl or get from config
    const targetUrl = baseUrl || config.API_BASE_URL;

    const response = await fetch(`${targetUrl}/habits`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    if (config.ENABLE_LOGGING) {
      console.log('Server connection test failed:', error);
    }
    return false;
  }
};