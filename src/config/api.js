// API Configuration
// Using ngrok tunnel for remote access (works from anywhere)
export const API_BASE_URL = 'https://ingrained-unserved-irmgard.ngrok-free.dev';
//
// Alternative local network access (same WiFi only):
// export const API_BASE_URL = 'http://192.168.1.8:5000';

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/api/auth/authenticate',
    LOGOUT: '/api/auth/logout',
    GET_USER_PROFILE: '/api/auth/user/profile',

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
