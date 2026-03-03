import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Import screens (will be created later)
import LoginScreen from '../screens/auth/LoginScreen';
import MainNavigator from './MainNavigator';
import HelpInfoScreen from '../screens/main/HelpInfoScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../config/constants';

const Stack = createStackNavigator();

/**
 * Root Navigator
 * Handles authentication flow and main app navigation
 */
const RootNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading screen while checking auth status
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth Stack - User not logged in
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    // Main App Stack - User logged in
                    <>
                        <Stack.Screen name="Main" component={MainNavigator} />
                        <Stack.Screen name="HelpInfo" component={HelpInfoScreen} options={{ headerShown: true, title: 'Help & Info' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
});

export default RootNavigator;
