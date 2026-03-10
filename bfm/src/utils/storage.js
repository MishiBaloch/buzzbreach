import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Keys
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Platform-specific storage helpers
const isWeb = Platform.OS === 'web';

const storage = {
  async getItem(key) {
    if (isWeb) {
      return localStorage.getItem(key);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  async setItem(key, value) {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  },

  async removeItem(key) {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
};

// Onboarding functions
export const markOnboardingComplete = async () => {
  try {
    await storage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Error marking onboarding complete:', error);
    return false;
  }
};

export const isOnboardingComplete = async () => {
  try {
    const value = await storage.getItem(ONBOARDING_COMPLETE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

export const resetOnboarding = async () => {
  try {
    await storage.removeItem(ONBOARDING_COMPLETE_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    return false;
  }
};

// Token functions
export const getAuthToken = async () => {
  try {
    return await storage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const setAuthToken = async (token) => {
  try {
    await storage.setItem(AUTH_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error setting auth token:', error);
    return false;
  }
};

export const clearAuthTokens = async () => {
  try {
    await storage.removeItem(AUTH_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
    return false;
  }
};

// Clear all app data (for logout)
export const clearAllData = async () => {
  try {
    await storage.removeItem(AUTH_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    // Note: We don't clear onboarding status on logout
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

export default {
  markOnboardingComplete,
  isOnboardingComplete,
  resetOnboarding,
  getAuthToken,
  setAuthToken,
  clearAuthTokens,
  clearAllData,
};
