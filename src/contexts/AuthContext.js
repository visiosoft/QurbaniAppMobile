import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Create Auth Context
const AuthContext = createContext({});

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to children
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is already logged in on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    /**
     * Check authentication status on app load
     */
    const checkAuthStatus = async () => {
        try {
            const token = await authService.getToken();
            const userData = await authService.getUserData();

            if (token && userData) {
                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Login user
     * @param {Object} credentials - Login credentials
     */
    const login = async (credentials) => {
        try {
            setIsLoading(true);
            const { user: userData, token } = await authService.login(credentials);
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            setIsLoading(true);
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Update user data in context
     * @param {Object} updatedUser - Updated user data
     */
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    /**
     * Refresh user data from server
     * Fetches fresh user data and updates context
     */
    const refreshUser = async () => {
        try {
            console.log('🔄 AuthContext.refreshUser: Starting refresh...');
            const freshUserData = await authService.refreshUserProfile();
            console.log('✅ AuthContext.refreshUser: Fresh data received:', freshUserData?.name, 'accountType:', freshUserData?.accountType);
            setUser(freshUserData);
            return freshUserData;
        } catch (error) {
            console.error('❌ AuthContext.refreshUser: Error refreshing user:', error);
            throw error;
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
