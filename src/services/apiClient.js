import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, REQUEST_TIMEOUT } from '../config/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
    },
    // Mobile app uses token-based auth, not cookies
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            console.log('🔑 Auth token exists:', !!token);
            console.log('🌐 Request:', config.method.toUpperCase(), config.url);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn('⚠️ No auth token found in AsyncStorage');
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ Response received:', response.status, response.config.url);
        console.log('📦 Response data keys:', Object.keys(response.data || {}));
        return response;
    },
    async (error) => {
        if (error.response) {
            console.error('❌ Response error:', error.response.status, error.response.data);
            // Handle 401 Unauthorized - Token expired or invalid
            if (error.response.status === 401) {
                console.warn('🔒 Unauthorized - clearing storage');
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('userData');
                // TODO: Navigate to login screen
                // You can emit an event here or use navigation ref
            }

            // Handle other error status codes
            const errorMessage = error.response.data?.message || 'An error occurred';
            return Promise.reject(new Error(errorMessage));
        } else if (error.request) {
            // Request made but no response received
            console.error('❌ No response received:', error.request);
            return Promise.reject(new Error('Network error. Please check your connection.'));
        } else {
            // Something else happened
            console.error('❌ Request setup error:', error.message);
            return Promise.reject(error);
        }
    }
);

export default apiClient;
