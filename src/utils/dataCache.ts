import AsyncStorage from '@react-native-async-storage/async-storage';

import { logError } from './errorHandling';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class DataCache {
  private static instance: DataCache;
  private cache: Map<string, CacheItem<unknown>> = new Map();

  static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }

  // Set data in cache with expiration
  async set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };

    this.cache.set(key, cacheItem);

    // Also persist to AsyncStorage for offline access
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      logError(error, 'dataCache.persistToStorage', { key });
    }
  }

  // Get data from cache
  async get<T>(key: string): Promise<T | null> {
    // First check in-memory cache
    let cacheItem = this.cache.get(key);

    // If not in memory, try to load from AsyncStorage
    if (!cacheItem) {
      try {
        const stored = await AsyncStorage.getItem(`cache_${key}`);
        if (stored) {
          cacheItem = JSON.parse(stored);
          if (cacheItem) {
            this.cache.set(key, cacheItem);
          }
        }
      } catch (error) {
        logError(error, 'dataCache.loadFromStorage', { key });
        return null;
      }
    }

    if (!cacheItem) {
      return null;
    }

    // Check if cache has expired
    const now = Date.now();
    if (now - cacheItem.timestamp > cacheItem.expiresIn) {
      this.delete(key);
      return null;
    }

    return cacheItem.data as T;
  }

  // Check if data exists and is valid
  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  // Delete data from cache
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      logError(error, 'dataCache.removeFromStorage', { key });
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    this.cache.clear();
    let cacheKeysCount = 0;
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      cacheKeysCount = cacheKeys.length;
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      logError(error, 'dataCache.clearStorage', { 
        cacheKeysCount 
      });
    }
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }
}

// Cache keys constants
export const CACHE_KEYS = {
  HABITS: 'habits',
  CHALLENGES: 'challenges',
  USERS: 'users',
  USER_PROFILE: 'user_profile',
  LEADERBOARD: 'leaderboard',
} as const;

// Cache expiration times (in milliseconds)
export const CACHE_EXPIRATION = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;

export const dataCache = DataCache.getInstance();

// Legacy cache migration utilities
export const LEGACY_STORAGE_KEYS = {
  HABITS_CACHE: '@ecotrace_habits_cache',
  CHALLENGES_CACHE: '@ecotrace_challenges_cache',
  USERS_CACHE: '@ecotrace_users_cache',
} as const;

/**
 * Migrates legacy cache data from old storage format to new dataCache format
 * This ensures smooth transition without data loss
 */
export const migrateLegacyCache = async (): Promise<void> => {
  let migratedCount = 0;
  
  try {
    console.log('Starting legacy cache migration...');
    
    // Migration mapping: legacy key -> new cache key
    const migrationMap = [
      { legacy: LEGACY_STORAGE_KEYS.HABITS_CACHE, newKey: CACHE_KEYS.HABITS, expiration: CACHE_EXPIRATION.MEDIUM },
      { legacy: LEGACY_STORAGE_KEYS.CHALLENGES_CACHE, newKey: CACHE_KEYS.CHALLENGES, expiration: CACHE_EXPIRATION.LONG },
      { legacy: LEGACY_STORAGE_KEYS.USERS_CACHE, newKey: CACHE_KEYS.USERS, expiration: CACHE_EXPIRATION.MEDIUM },
    ];

    for (const { legacy, newKey, expiration } of migrationMap) {
      try {
        // Check if legacy data exists
        const legacyData = await AsyncStorage.getItem(legacy);
        
        if (legacyData) {
          // Parse legacy data
          const parsedData = JSON.parse(legacyData);
          
          // Check if new cache already has this data
          const existingData = await dataCache.get(newKey);
          
          if (!existingData) {
            // Migrate to new cache format
            await dataCache.set(newKey, parsedData, expiration);
            console.log(`Migrated legacy cache: ${legacy} -> ${newKey}`);
            migratedCount++;
          }
          
          // Remove legacy cache entry
          await AsyncStorage.removeItem(legacy);
          console.log(`Removed legacy cache entry: ${legacy}`);
        }
      } catch (error) {
        logError(error, 'dataCache.migrateLegacyCache', { 
          legacyKey: legacy,
          newKey: newKey 
        });
        // Continue with other migrations even if one fails
      }
    }

    console.log(`Legacy cache migration completed. Migrated ${migratedCount} entries.`);
  } catch (error) {
    logError(error, 'dataCache.migrateLegacyCache.overall', { 
      migratedCount 
    });
  }
};

/**
 * Checks if any legacy cache data exists that needs migration
 */
export const hasLegacyCache = async (): Promise<boolean> => {
  try {
    const legacyKeys = Object.values(LEGACY_STORAGE_KEYS);
    
    for (const key of legacyKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    logError(error, 'dataCache.hasLegacyCache');
    return false;
  }
};

/**
 * Cleans up any remaining legacy cache entries
 * Use this after migration is complete to ensure clean state
 */
export const cleanupLegacyCache = async (): Promise<void> => {
  try {
    const legacyKeys = Object.values(LEGACY_STORAGE_KEYS);
    await AsyncStorage.multiRemove(legacyKeys);
    console.log('Legacy cache cleanup completed');
  } catch (error) {
    logError(error, 'dataCache.cleanupLegacyCache');
  }
};