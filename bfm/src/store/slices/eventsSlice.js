import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eventsService from '../../api/services/eventsService';

// Async thunks
export const fetchAllEvents = createAsyncThunk(
  'events/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const result = await eventsService.getAllEvents();
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch events');
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchById',
  async (eventId, { rejectWithValue }) => {
    try {
      const result = await eventsService.getEventById(eventId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch event');
    }
  }
);

const initialState = {
  events: [],
  selectedEvent: null,
  registeredEvents: [],
  isLoading: false,
  error: null,
  filter: 'all', // 'all', 'today', 'thisWeek', 'thisMonth'
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    clearEvents: (state) => {
      state.events = [];
      state.selectedEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Events
      .addCase(fetchAllEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload || [];
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.events = [];
      })
      // Fetch Event By ID
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilter, setSelectedEvent, clearEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
