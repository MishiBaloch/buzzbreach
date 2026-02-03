import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../api/services/authService';

// Login with email and password
export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await authService.loginWithCredentials(email, password);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Login with Keycloak OAuth
export const loginWithKeycloakAsync = createAsyncThunk(
  'auth/loginKeycloak',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.loginWithKeycloak();
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Keycloak login failed');
    }
  }
);

// Register user
export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const result = await authService.registerUser(userData);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Logout
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.logout();
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Get current user
export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.getCurrentUser();
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get user');
    }
  }
);

// Check authentication status
export const checkAuthAsync = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        return rejectWithValue('Not authenticated');
      }
      // If authenticated, get user details
      const userResult = await authService.getCurrentUser();
      if (!userResult.success) {
        return rejectWithValue(userResult.error);
      }
      return userResult.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: false, // Changed to false by default for fresh start
  error: null,
  isAdmin: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Login with credentials
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      // Login with Keycloak
      .addCase(loginWithKeycloakAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithKeycloakAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithKeycloakAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Keycloak login failed';
        state.isAuthenticated = false;
      })
      // Register (does NOT auto-login - user must go to Login screen)
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.isLoading = false;
        // Don't set isAuthenticated - user needs to login after registration
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      })
      // Logout
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Logout failed';
      })
      // Get Current User
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to get user';
      })
      // Check Auth
      .addCase(checkAuthAsync.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuthAsync.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuthAsync.rejected, (state) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError, setUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;
