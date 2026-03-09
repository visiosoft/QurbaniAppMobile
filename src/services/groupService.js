import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * Group Service
 * Handles group operations for group representatives
 */
const groupService = {
    /**
     * Get all members in the group
     * @returns {Promise<Array>} List of group members
     */
    getMembers: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.GET_MEMBERS);
            console.log('🔍 groupService.getMembers response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ groupService.getMembers error:', error);
            throw error;
        }
    },

    /**
     * Mark a member's Qurbani as ready
     * @param {string} memberId - Member ID
     * @returns {Promise<Object>} Updated member data
     */
    markMemberReady: async (memberId) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.MARK_MEMBER_READY, { memberId });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Validate group capacity before marking member as ready
     * @param {string} qurbaniType - Type of Qurbani (sheep, cow, camel)
     * @param {number} currentReadyCount - Current count of members marked as ready
     * @returns {Promise<Object>} Validation result
     */
    validateGroup: async (qurbaniType, currentReadyCount) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.VALIDATE_GROUP, {
                qurbaniType,
                currentReadyCount,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default groupService;
