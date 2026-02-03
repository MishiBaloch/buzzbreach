import apiClient from '../apiClient';
import { ENDPOINTS } from '../config';

// Get all events
export const getAllEvents = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.EVENTS.GET_ALL);
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get events error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch events' 
    };
  }
};

// Get event by ID
export const getEventById = async (eventId) => {
  try {
    const response = await apiClient.get(ENDPOINTS.EVENTS.GET_BY_ID(eventId));
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get event error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch event details' 
    };
  }
};

// Get corporate events
export const getCorporateEvents = async (corporateId) => {
  try {
    const response = await apiClient.get(ENDPOINTS.EVENTS.GET_CORPORATE(corporateId));
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get corporate events error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch corporate events' 
    };
  }
};

// Get registered users for an event
export const getRegisteredUsers = async (eventId) => {
  try {
    const response = await apiClient.get(ENDPOINTS.EVENTS.REGISTERED_USERS(eventId));
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get registered users error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch registered users' 
    };
  }
};

export default {
  getAllEvents,
  getEventById,
  getCorporateEvents,
  getRegisteredUsers,
};
