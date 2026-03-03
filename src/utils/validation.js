import { MAX_MEMBERS_PER_ANIMAL, QURBANI_TYPES } from '../config/constants';

/**
 * Validation utilities for the Qurbani app
 */

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        return false;
    }
    // Basic phone number validation (at least 10 digits)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phoneNumber.trim());
};

/**
 * Validate passport number
 * @param {string} passportNumber - Passport number to validate
 * @returns {boolean} - True if valid
 */
export const validatePassportNumber = (passportNumber) => {
    if (!passportNumber || typeof passportNumber !== 'string') {
        return false;
    }
    // Passport number should be at least 6 characters
    return passportNumber.trim().length >= 6;
};

/**
 * Validate if group can mark more members as ready
 * @param {string} qurbaniType - Type of Qurbani (sheep, cow, camel)
 * @param {number} currentReadyCount - Current count of ready members
 * @returns {Object} - {valid: boolean, message: string}
 */
export const validateGroupCapacity = (qurbaniType, currentReadyCount) => {
    const maxAllowed = MAX_MEMBERS_PER_ANIMAL[qurbaniType];

    if (!maxAllowed) {
        return {
            valid: false,
            message: 'Invalid Qurbani type',
        };
    }

    if (currentReadyCount >= maxAllowed) {
        return {
            valid: false,
            message: `Maximum ${maxAllowed} member(s) allowed for ${qurbaniType}`,
        };
    }

    return {
        valid: true,
        message: `${currentReadyCount} of ${maxAllowed} members marked as ready`,
    };
};

/**
 * Validate email format (optional field)
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const validateEmail = (email) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validate required field
 * @param {string} value - Value to check
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} - {valid: boolean, message: string}
 */
export const validateRequired = (value, fieldName) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return {
            valid: false,
            message: `${fieldName} is required`,
        };
    }

    return {
        valid: true,
        message: '',
    };
};

/**
 * Validate Qurbani type
 * @param {string} qurbaniType - Qurbani type to validate
 * @returns {boolean} - True if valid
 */
export const validateQurbaniType = (qurbaniType) => {
    return Object.values(QURBANI_TYPES).includes(qurbaniType);
};
