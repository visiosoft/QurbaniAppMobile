import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * Qurbani Service
 * Handles Qurbani status and operations
 */
const qurbaniService = {
    /**
     * Get Qurbani status for the logged-in user
     * @returns {Promise<Object>} Qurbani status data
     */
    getStatus: async () => {
        try {
            const response = await apiClient.get('/api/qurbani/my');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mark user's Qurbani as ready (update status to 'ready')
     * @returns {Promise<Object>} Updated Qurbani data
     */
    markReady: async () => {
        try {
            const response = await apiClient.put('/api/qurbani/my/status', {
                status: 'ready'
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update qurbani status
     * @param {string} status - New status (pending, ready, done)
     * @returns {Promise<Object>} Updated Qurbani data
     */
    updateStatus: async (status) => {
        try {
            const response = await apiClient.put('/api/qurbani/my/status', {
                status
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get detailed Qurbani information
     * @param {string} qurbaniId - Qurbani ID
     * @returns {Promise<Object>} Qurbani details
     */
    getDetails: async (qurbaniId) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.GET_QURBANI_DETAILS}/${qurbaniId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default qurbaniService;
