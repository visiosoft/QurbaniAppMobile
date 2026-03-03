import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * User Service
 * Handles user profile operations
 */
const userService = {
    /**
     * Get user profile
     * @returns {Promise<Object>} User profile data
     */
    getProfile: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.GET_PROFILE);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update user profile
     * @param {Object} profileData - Updated profile data
     * @returns {Promise<Object>} Updated user data
     */
    updateProfile: async (profileData) => {
        try {
            const response = await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, profileData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default userService;
