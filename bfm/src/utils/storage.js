import * as SecureStore from 'expo-secure-store';

// Keys
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Onboarding functions
export const markOnboardingComplete = async () => {
  try {
    await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Error marking onboarding complete:', error);
    return false;
  }
};

export const isOnboardingComplete = async () => {
  try {
    const value = await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

export const resetOnboarding = async () => {
  try {
    await SecureStore.deleteItemAsync(ONBOARDING_COMPLETE_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    return false;
  }
};

// Token functions
export const getAuthToken = async () => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const setAuthToken = async (token) => {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error setting auth token:', error);
    return false;
  }
};

export const clearAuthTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
    return false;
  }
};

// Clear all app data (for logout)
export const clearAllData = async () => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
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
