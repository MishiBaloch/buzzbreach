import apiClient, { tokenManager } from '../apiClient';
import { ENDPOINTS, KEYCLOAK_CONFIG } from '../config';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

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
    return { 
      success: false, 
      error: error.response?.data?.message || 'Registration failed' 
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
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get user' 
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
    return { 
      success: true, 
      message: response.data.message || 'Password reset link sent',
      devToken: response.data.devToken, // Only in dev mode
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to send reset link' 
    };
  }
};

// Reset Password - Set new password with token
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

export default {
  loginWithCredentials,
  loginWithKeycloak,
  registerUser,
  syncUser,
  logout,
  isAuthenticated,
  getCurrentUser,
  checkIsAdmin,
  getRedirectUri,
  forgotPassword,
  resetPassword,
};
