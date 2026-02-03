import apiClient from '../apiClient';
import { ENDPOINTS } from '../config';

// Get user details
export const getUserDetails = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.USER.DETAILS);
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get user details error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch user details' 
    };
  }
};

// Get professional profile
export const getProfessionalProfile = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.USER.PROFESSIONAL_PROFILE);
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get professional profile error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch professional profile' 
    };
  }
};

// Update basic profile
export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.put(ENDPOINTS.USER.UPDATE_PROFILE, profileData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Update profile error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update profile' 
    };
  }
};

// Update professional profile
export const updateProfessionalProfile = async (profileData) => {
  try {
    const response = await apiClient.put(ENDPOINTS.USER.UPDATE_PROFESSIONAL, profileData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Update professional profile error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update professional profile' 
    };
  }
};

// Create individual user
export const createIndividualUser = async (userData) => {
  try {
    const response = await apiClient.post(ENDPOINTS.USER.CREATE_INDIVIDUAL, userData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Create user error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create user' 
    };
  }
};

// Check if user is admin
export const checkIsAdmin = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.USER.IS_ADMIN);
    return { success: true, isAdmin: response.data.isAdmin || false };
  } catch (error) {
    console.error('Check admin error:', error);
    return { success: false, isAdmin: false };
  }
};

export default {
  getUserDetails,
  getProfessionalProfile,
  updateProfile,
  updateProfessionalProfile,
  createIndividualUser,
  checkIsAdmin,
};
