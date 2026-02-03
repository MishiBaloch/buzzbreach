import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../api/services/userService';

// Async thunks
export const fetchUserDetails = createAsyncThunk(
  'profile/fetchUserDetails',
  async (_, { rejectWithValue }) => {
    try {
      const result = await userService.getUserDetails();
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user details');
    }
  }
);

export const fetchProfessionalProfile = createAsyncThunk(
  'profile/fetchProfessionalProfile',
  async (_, { rejectWithValue }) => {
    try {
      const result = await userService.getProfessionalProfile();
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch professional profile');
    }
  }
);

export const updateProfileAsync = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const result = await userService.updateProfile(profileData);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const updateProfessionalProfileAsync = createAsyncThunk(
  'profile/updateProfessionalProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const result = await userService.updateProfessionalProfile(profileData);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update professional profile');
    }
  }
);

const initialState = {
  userDetails: null,
  professionalProfile: null,
  connections: [],
  isLoading: false,
  error: null,
  activeTab: 0,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    clearProfile: (state) => {
      state.userDetails = null;
      state.professionalProfile = null;
      state.connections = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userDetails = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Professional Profile
      .addCase(fetchProfessionalProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfessionalProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.professionalProfile = action.payload;
      })
      .addCase(fetchProfessionalProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfileAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Professional Profile
      .addCase(updateProfessionalProfileAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfessionalProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateProfessionalProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setActiveTab, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
