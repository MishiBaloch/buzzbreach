import apiClient, { tokenManager } from '../apiClient';
import { ENDPOINTS, KEYCLOAK_CONFIG, OAUTH_CONFIG } from '../config';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Lazy load AppleAuthentication only when needed and only on iOS
// This prevents web bundling errors since expo-apple-authentication is iOS-only
const getAppleAuthentication = () => {
  if (Platform.OS !== 'ios') {
    return null;
  }
  
  try {
    // Use require() for conditional loading that works with Expo bundler
    return require('expo-apple-authentication');
  } catch (error) {
    console.warn('expo-apple-authentication not available:', error.message);
    return null;
  }
};

WebBrowser.maybeCompleteAuthSession();

// Keycloak Discovery Document
const discovery = {
  authorizationEndpoint: `${KEYCLOAK_CONFIG.SERVER_URL}/realms/${KEYCLOAK_CONFIG.REALM}/protocol/openid-connect/auth`,
  tokenEndpoint: `${KEYCLOAK_CONFIG.SERVER_URL}/realms/${KEYCLOAK_CONFIG.REALM}/protocol/openid-connect/token`,
  revocationEndpoint: `${KEYCLOAK_CONFIG.SERVER_URL}/realms/${KEYCLOAK_CONFIG.REALM}/protocol/openid-connect/revoke`,
  userInfoEndpoint: `${KEYCLOAK_CONFIG.SERVER_URL}/realms/${KEYCLOAK_CONFIG.REALM}/protocol/openid-connect/userinfo`,
  endSessionEndpoint: `${KEYCLOAK_CONFIG.SERVER_URL}/realms/${KEYCLOAK_CONFIG.REALM}/protocol/openid-connect/logout`,
};

// Get redirect URI for OAuth
export const getRedirectUri = () => {
  return AuthSession.makeRedirectUri({
    scheme: 'buzzbreach',
    path: 'auth',
  });
};

// Login with email and password (Direct API call)
export const loginWithCredentials = async (email, password) => {
  try {
    // For development/testing without Keycloak
    // This will call the backend directly
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    if (response.data && response.data.token) {
      // Store token
      await tokenManager.setToken(response.data.token);
      if (response.data.refreshToken) {
        await tokenManager.setRefreshToken(response.data.refreshToken);
      }

      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Invalid email or password',
    };
  }
};

// Login with Keycloak OAuth
export const loginWithKeycloak = async () => {
  try {
    const redirectUri = getRedirectUri();
    
    const request = new AuthSession.AuthRequest({
      clientId: KEYCLOAK_CONFIG.CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      usePKCE: true,
    });

    const result = await request.promptAsync(discovery);

    if (result.type === 'success') {
      // Exchange code for tokens
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: KEYCLOAK_CONFIG.CLIENT_ID,
          code: result.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        },
        discovery
      );

      // Store tokens
      await tokenManager.setToken(tokenResponse.accessToken);
      if (tokenResponse.refreshToken) {
        await tokenManager.setRefreshToken(tokenResponse.refreshToken);
      }

      // Sync user with backend
      await syncUser();

      return {
        success: true,
        accessToken: tokenResponse.accessToken,
        idToken: tokenResponse.idToken,
      };
    }

    return { success: false, error: 'Authentication cancelled' };
  } catch (error) {
    console.error('Keycloak login error:', error);
    return { success: false, error: error.message };
  }
};

// Register new user (without auto-login)
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
    
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data,
        user: response.data.user,
      };
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle network errors specifically
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return { 
        success: false, 
        error: 'Cannot connect to server. Please check if the backend server is running and your network connection.' 
      };
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return { 
        success: false, 
        error: 'Connection timeout. Please check if the backend server is running at the configured address.' 
      };
    }
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Registration failed' 
    };
  }
};

// Sync user with backend after Keycloak login
export const syncUser = async () => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.SYNC);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Sync error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Sync failed' 
    };
  }
};

// Logout
export const logout = async () => {
  try {
    await tokenManager.clearTokens();
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const token = await tokenManager.getToken();
  return !!token;
};

// Get current user details
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.USER.DETAILS);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Get user error:', error);
    
    // Handle network errors specifically
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return { 
        success: false, 
        error: 'Cannot connect to server. Please check if the backend server is running.' 
      };
    }
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to get user' 
    };
  }
};

// Check if user is admin
export const checkIsAdmin = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.USER.IS_ADMIN);
    return { success: true, isAdmin: response.data.isAdmin };
  } catch (error) {
    return { success: false, isAdmin: false };
  }
};

// Forgot Password - Request reset link
export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    
    // Log the full response for debugging
    console.log('Forgot password API response:', {
      status: response.status,
      data: response.data,
      hasDevToken: !!response.data.devToken,
    });
    
    return { 
      success: true, 
      message: response.data.message || 'Password reset link sent',
      devToken: response.data.devToken || undefined, // Only in dev mode or if email failed
    };
  } catch (error) {
    console.error('Forgot password API error:', error);
    console.error('Error response:', error.response?.data);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to send reset link' 
    };
  }
};

// Reset Password - Set new password with token (legacy, kept for compatibility)
export const resetPassword = async (email, token, newPassword) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { 
      email, 
      token, 
      newPassword 
    });
    return { 
      success: true, 
      message: response.data.message || 'Password reset successful' 
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to reset password' 
    };
  }
};

// Verify OTP for password reset
export const verifyPasswordResetOtp = async (email, otp) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_RESET_OTP, { 
      email, 
      otp 
    });
    return { 
      success: true, 
      message: response.data.message || 'OTP verified successfully' 
    };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Invalid or expired OTP' 
    };
  }
};

// Reset Password with OTP
export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  try {
    const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD_WITH_OTP, { 
      email, 
      otp, 
      newPassword 
    });
    return { 
      success: true, 
      message: response.data.message || 'Password reset successful' 
    };
  } catch (error) {
    console.error('Reset password with OTP error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to reset password' 
    };
  }
};

// Login with Google - Direct OAuth
export const loginWithGoogle = async () => {
  try {
    const redirectUri = getRedirectUri();
    const clientId = Platform.OS === 'ios' 
      ? (OAUTH_CONFIG.GOOGLE.IOS_CLIENT_ID || OAUTH_CONFIG.GOOGLE.CLIENT_ID)
      : OAUTH_CONFIG.GOOGLE.CLIENT_ID;

    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
      return { 
        success: false, 
        error: 'Google OAuth not configured. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID in your .env file' 
      };
    }

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      usePKCE: true,
      responseType: AuthSession.ResponseType.IdToken,
    });

    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    const result = await request.promptAsync(discovery);

    if (result.type === 'success' && result.params.id_token) {
      // Send ID token to backend for verification
      const response = await apiClient.post(ENDPOINTS.AUTH.GOOGLE, {
        idToken: result.params.id_token,
      });

      if (response.data && response.data.token) {
        // Store token
        await tokenManager.setToken(response.data.token);
        if (response.data.refreshToken) {
          await tokenManager.setRefreshToken(response.data.refreshToken);
        }

        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      }

      return { success: false, error: 'Failed to authenticate with Google' };
    }

    return { success: false, error: 'Authentication cancelled' };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: error.message || 'Google login failed' };
  }
};

// Login with Facebook - Direct OAuth
export const loginWithFacebook = async () => {
  try {
    const redirectUri = getRedirectUri();
    const appId = OAUTH_CONFIG.FACEBOOK.APP_ID;

    if (!appId || appId === 'YOUR_FACEBOOK_APP_ID') {
      return { 
        success: false, 
        error: 'Facebook OAuth not configured. Please set EXPO_PUBLIC_FACEBOOK_APP_ID in your .env file' 
      };
    }

    const request = new AuthSession.AuthRequest({
      clientId: appId,
      scopes: ['public_profile', 'email'],
      redirectUri,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Token,
    });

    const discovery = {
      authorizationEndpoint: `https://www.facebook.com/v18.0/dialog/oauth`,
      tokenEndpoint: `https://graph.facebook.com/v18.0/oauth/access_token`,
    };

    const result = await request.promptAsync(discovery);

    if (result.type === 'success' && result.params.access_token) {
      // Send access token to backend for verification
      const response = await apiClient.post(ENDPOINTS.AUTH.FACEBOOK, {
        accessToken: result.params.access_token,
      });

      if (response.data && response.data.token) {
        // Store token
        await tokenManager.setToken(response.data.token);
        if (response.data.refreshToken) {
          await tokenManager.setRefreshToken(response.data.refreshToken);
        }

        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      }

      return { success: false, error: 'Failed to authenticate with Facebook' };
    }

    return { success: false, error: 'Authentication cancelled' };
  } catch (error) {
    console.error('Facebook login error:', error);
    return { success: false, error: error.message || 'Facebook login failed' };
  }
};

// Login with Apple - Direct OAuth
export const loginWithApple = async () => {
  try {
    // Get Apple Authentication module (only available on iOS)
    const AppleAuthentication = getAppleAuthentication();
    
    if (!AppleAuthentication) {
      return { 
        success: false, 
        error: 'Apple Sign In is only available on iOS devices' 
      };
    }

    // Check if Apple Authentication is available on this device
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    
    if (!isAvailable) {
      return { 
        success: false, 
        error: 'Apple Sign In is not available on this device' 
      };
    }

    // Request Apple authentication
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Send credentials to backend for verification
    const response = await apiClient.post(ENDPOINTS.AUTH.APPLE, {
      identityToken: credential.identityToken,
      authorizationCode: credential.authorizationCode,
      user: {
        email: credential.email,
        name: credential.fullName ? {
          firstName: credential.fullName.givenName,
          lastName: credential.fullName.familyName,
          givenName: credential.fullName.givenName,
          familyName: credential.fullName.familyName,
        } : null,
      },
    });

    if (response.data && response.data.token) {
      // Store token
      await tokenManager.setToken(response.data.token);
      if (response.data.refreshToken) {
        await tokenManager.setRefreshToken(response.data.refreshToken);
      }

      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
      };
    }

    return { success: false, error: 'Failed to authenticate with Apple' };
  } catch (error) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      return { success: false, error: 'Authentication cancelled' };
    }
    console.error('Apple login error:', error);
    return { success: false, error: error.message || 'Apple login failed' };
  }
};

// Complete onboarding - Save onboarding data and mark user as onboarded
export const completeOnboarding = async (onboardingData) => {
  try {
    const response = await apiClient.post(ENDPOINTS.USER.COMPLETE_ONBOARDING, {
      onboardingData,
    });
    
    if (response.data && response.data.success) {
      return {
        success: true,
        user: response.data.user,
        message: response.data.message || 'Onboarding completed successfully',
      };
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to complete onboarding' 
    };
  }
};

export default {
  loginWithCredentials,
  loginWithKeycloak,
  loginWithGoogle,
  loginWithFacebook,
  loginWithApple,
  registerUser,
  syncUser,
  logout,
  isAuthenticated,
  getCurrentUser,
  checkIsAdmin,
  getRedirectUri,
  forgotPassword,
  resetPassword,
  completeOnboarding,
};
