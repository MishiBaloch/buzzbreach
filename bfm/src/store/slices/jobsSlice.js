import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import jobsService from '../../api/services/jobsService';

// Async thunks
export const fetchAllJobs = createAsyncThunk(
  'jobs/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const result = await jobsService.getAllJobs();
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchById',
  async (jobId, { rejectWithValue }) => {
    try {
      const result = await jobsService.getJobById(jobId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch job');
    }
  }
);

const initialState = {
  jobs: [],
  selectedJob: null,
  appliedJobs: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {
    jobLevel: [],
    jobType: [],
    location: [],
    datePosted: [],
  },
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
    },
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },
    clearJobs: (state) => {
      state.jobs = [];
      state.selectedJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Jobs
      .addCase(fetchAllJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload || [];
      })
      .addCase(fetchAllJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.jobs = [];
      })
      // Fetch Job By ID
      .addCase(fetchJobById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setSearchQuery, 
  setFilters, 
  clearFilters, 
  setSelectedJob,
  clearJobs,
} = jobsSlice.actions;

export default jobsSlice.reducer;
