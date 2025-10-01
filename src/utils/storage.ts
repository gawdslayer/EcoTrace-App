import AsyncStorage from '@react-native-async-storage/async-storage';

import { logError } from './errorHandling';
import type { User } from '../types/models';

// Storage keys
const STORAGE_KEYS = {
  USER: '@ecotrace_user',
  AUTH_TOKEN: '@ecotrace_auth_token',
  // Cache keys removed - use dataCache.ts for all caching operations
} as const;

// User storage functions
export const storeUser = async (user: User): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, jsonValue);
  } catch (error) {
    logError(error, 'storage.storeUser', { userId: user.id });
    throw new Error('Failed to store user data');
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    logError(error, 'storage.getUser');
    return null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    logError(error, 'storage.removeUser');
  }
};

// Auth token storage
export const storeAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    logError(error, 'storage.storeAuthToken');
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    logError(error, 'storage.getAuthToken');
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    logError(error, 'storage.removeAuthToken');
  }
};

// DEPRECATED: Generic cache functions - Use dataCache.ts instead
// These functions have been removed to consolidate caching through dataCache.ts
// Migration: Use dataCache.set(), dataCache.get(), and dataCache.delete() instead
// 
// Previous functions removed:
// - storeCache() -> use dataCache.set()
// - getCache() -> use dataCache.get() 
// - removeCache() -> use dataCache.delete()

// Clear all app data
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    logError(error, 'storage.clearAllData', { 
      keysAttempted: Object.values(STORAGE_KEYS) 
    });
  }
};