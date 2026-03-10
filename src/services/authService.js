import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Authentication Service
 * Handles login, logout, and token management
 */
const authService = {
    /**
     * Login user with credentials
     * @param {Object} credentials - {phoneNumber, passportNumber} or other login credentials
     * @returns {Promise<Object>} User data and token
     */
    login: async (credentials) => {
        try {
            // Send phoneNumber and passportNumber directly to backend
            const loginData = {
                phoneNumber: credentials.phoneNumber,
                passportNumber: credentials.passportNumber
            };

            const response = await apiClient.post(API_ENDPOINTS.LOGIN, loginData);
            const { authToken, user, qurbani } = response.data;

            // Validate token exists
            if (!authToken) {
                throw new Error('No authentication token received from server');
            }

            // Store token, user data, and qurbani data
            await AsyncStorage.setItem('authToken', authToken);
            await AsyncStorage.setItem('userData', JSON.stringify(user));
            await AsyncStorage.setItem('qurbaniData', JSON.stringify(qurbani));

            return { token: authToken, user, qurbani };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Logout user
     * @returns {Promise<void>}
     */
    logout: async () => {
        try {
            // Call logout endpoint (optional, if backend needs to invalidate token)
            await apiClient.post(API_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clear local storage regardless of API call result
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
        }
    },

    /**
     * Get stored auth token
     * @returns {Promise<string|null>} Auth token or null
     */
    getToken: async () => {
        try {
            return await AsyncStorage.getItem('authToken');
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    /**
     * Get stored user data
     * @returns {Promise<Object|null>} User data or null
     */
    getUserData: async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    /**
     * Check if user is authenticated
     * @returns {Promise<boolean>} True if authenticated
     */
    isAuthenticated: async () => {
        const token = await authService.getToken();
        return !!token;
    },

    /**
     * Refresh user profile data from server
     * Updates the stored userData with fresh data from backend
     * @returns {Promise<Object>} Fresh user data
     */
    refreshUserProfile: async () => {
        try {
            console.log('🔄 authService.refreshUserProfile: Calling API...');
            const response = await apiClient.get(API_ENDPOINTS.GET_USER_PROFILE);
            console.log('📦 authService.refreshUserProfile: Response received');
            // Backend returns { success: true, user: {...} }
            const user = response.data.user;
            console.log('👤 authService.refreshUserProfile: User data:', JSON.stringify(user, null, 2));

            // Update stored user data
            await AsyncStorage.setItem('userData', JSON.stringify(user));
            console.log('✅ authService.refreshUserProfile: User data updated in storage');

            return user;
        } catch (error) {
            console.error('❌ Error refreshing user profile:', error);
            throw error;
        }
    },
};

export default authService;
