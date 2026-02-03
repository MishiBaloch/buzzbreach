// API Configuration
// Update BASE_URL to match your backend server

export const API_CONFIG = {
  // Development - Use your actual IP for physical device
  BASE_URL: 'http://192.168.0.101:5000/api/v1', // Your local network IP
  // BASE_URL: 'http://10.0.2.2:5000/api/v1', // Android emulator localhost
  // BASE_URL: 'http://localhost:5000/api/v1', // iOS simulator
  
  // Production
  // BASE_URL: 'https://api.buzzbreach.com/api/v1',
  
  TIMEOUT: 30000,
};

// Keycloak Configuration
export const KEYCLOAK_CONFIG = {
  REALM: 'buzzbreach',
  CLIENT_ID: 'buzzbreach-mobile',
  // Update this to your Keycloak server URL
  SERVER_URL: 'http://192.168.0.101:8080',
  // SERVER_URL: 'https://auth.buzzbreach.com',
};

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/user/auth/login',
    REGISTER: '/user/auth/register',
    SYNC: '/user/auth/sync',
    VERIFY_OTP: '/user/auth/verify-otp',
    FORGOT_PASSWORD: '/user/auth/forgot-password',
    RESET_PASSWORD: '/user/auth/reset-password',
  },
  
  // User
  USER: {
    IS_ADMIN: '/user/isadmin',
    DETAILS: '/user/get-user-details',
    PROFESSIONAL_PROFILE: '/user/get-professional-profile',
    CREATE_INDIVIDUAL: '/user/create-individual-user',
    UPDATE_PROFILE: '/user/update-profile',
    UPDATE_PROFESSIONAL: '/user/update-professional-profile',
  },
  
  // Jobs - Match actual backend routes
  JOBS: {
    GET_ALL: '/corporate/job/get-all-jobs',
    GET_BY_ID: (id) => `/corporate/job/get-job/${id}`,
    CREATE: (corporateId) => `/corporate/job/create-job/${corporateId}`,
    UPDATE: (corporateId, jobId) => `/corporate/job/update-job/${corporateId}/${jobId}`,
    DELETE: (corporateId, jobId) => `/corporate/job/delete-job/${corporateId}/${jobId}`,
    GET_APPLICATIONS: (jobId) => `/corporate/job/get-all-job-applications/${jobId}`,
    APPLICANTS_INFO: (jobId) => `/corporate/job/job-applicants-info/${jobId}`,
  },
  
  // Events - Match actual backend routes
  EVENTS: {
    GET_ALL: '/corporate/event/',
    GET_BY_ID: (eventId) => `/corporate/event/${eventId}`,
    CREATE: (corporateId) => `/corporate/event/create-event/${corporateId}`,
    UPDATE: (corporateId, eventId) => `/corporate/event/${corporateId}/${eventId}`,
    DELETE: (corporateId, eventId) => `/corporate/event/${corporateId}/${eventId}`,
    GET_CORPORATE: (corporateId) => `/corporate/event/specificCorporateEvents/${corporateId}`,
    REGISTERED_USERS: (eventId) => `/corporate/event/${eventId}/registered-users`,
  },
  
  // Corporate Pages
  CORPORATE: {
    GET_ALL_PAGES: '/corporate/page/get-all-corporate-pages',
    GET_PAGE: (id) => `/corporate/page/get-corporate-page/${id}`,
  },
  
  // Services
  SERVICES: {
    GET_ALL: '/corporate/services/',
  },
  
  // Career Path
  CAREER_PATH: {
    GET_ALL: '/corporate/career-path/',
  },
};
