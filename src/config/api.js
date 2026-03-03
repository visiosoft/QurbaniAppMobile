// API Configuration
// TODO: Replace with your actual backend API URL
export const API_BASE_URL = 'http://192.168.1.8:5000';

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/api/auth/authenticate',
    LOGOUT: '/api/auth/logout',

    // User
    GET_PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',

    // Qurbani
    GET_QURBANI_STATUS: '/api/qurbani/status',
    MARK_READY: '/api/qurbani/mark-ready',
    GET_QURBANI_DETAILS: '/api/qurbani/details',

    // Group Management
    GET_MEMBERS: '/api/group/members',
    MARK_MEMBER_READY: '/api/group/member/mark-ready',
    VALIDATE_GROUP: '/api/group/validate',
};

// Request timeout
export const REQUEST_TIMEOUT = 10000;
