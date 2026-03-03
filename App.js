import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import notificationService from './src/services/notificationService';
import { COLORS } from './src/config/constants';

/**
 * Main App Component
 */
export default function App() {
    useEffect(() => {
        // Notification registration disabled in Expo Go
        // Uncomment this when using a development build
        /*
        registerNotifications();

        const notificationListener = notificationService.addNotificationReceivedListener(
            handleNotificationReceived
        );

        const responseListener = notificationService.addNotificationResponseReceivedListener(
            handleNotificationResponse
        );

        return () => {
            if (notificationListener) {
                notificationListener.remove();
            }
            if (responseListener) {
                responseListener.remove();
            }
        };
        */
    }, []);

    /**
     * Register for push notifications
     */
    const registerNotifications = async () => {
        try {
            await notificationService.registerForPushNotifications();
        } catch (error) {
            console.error('Error registering for notifications:', error);
        }
    };

    /**
     * Handle notification received while app is open
     */
    const handleNotificationReceived = (notification) => {
        console.log('Notification received:', notification);
        // You can display an in-app notification here if needed
    };

    /**
     * Handle notification tap/response
     */
    const handleNotificationResponse = (response) => {
        console.log('Notification response:', response);

        // Handle navigation based on notification data
        const data = response.notification.request.content.data;

        // TODO: Navigate to specific screen based on notification type
        // Example: if (data.type === 'qurbani_done') navigate to dashboard
    };

    return (
        <AuthProvider>
            <StatusBar style="light" backgroundColor={COLORS.primary} />
            <RootNavigator />
        </AuthProvider>
    );
}
