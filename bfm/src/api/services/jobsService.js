import apiClient from '../apiClient';
import { ENDPOINTS } from '../config';

// Get all jobs
export const getAllJobs = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.JOBS.GET_ALL);
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get jobs error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch jobs' 
    };
  }
};

// Get job by ID
export const getJobById = async (jobId) => {
  try {
    const response = await apiClient.get(ENDPOINTS.JOBS.GET_BY_ID(jobId));
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get job error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch job details' 
    };
  }
};

// Get job applications
export const getJobApplications = async (jobId) => {
  try {
    const response = await apiClient.get(ENDPOINTS.JOBS.GET_APPLICATIONS(jobId));
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get applications error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch job applications' 
    };
  }
};

// Get job applicants info
export const getJobApplicantsInfo = async (jobId) => {
  try {
    const response = await apiClient.get(ENDPOINTS.JOBS.APPLICANTS_INFO(jobId));
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get applicants info error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch applicants info' 
    };
  }
};

export default {
  getAllJobs,
  getJobById,
  getJobApplications,
  getJobApplicantsInfo,
};
