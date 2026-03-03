import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Notification Service
 * Handles push notifications and local notifications
 */
const notificationService = {
    /**
     * Register for push notifications
     * @returns {Promise<string|null>} Expo push token or null
     */
    registerForPushNotifications: async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return null;
            }

            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Expo Push Token:', token);

            // TODO: Send token to backend to register device
            // await apiClient.post('/user/register-device', { token });

        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    },

    /**
     * Schedule a local notification
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {Object} data - Additional data to include
     * @param {number} seconds - Seconds until notification (default: immediate)
     */
    scheduleLocalNotification: async (title, body, data = {}, seconds = 0) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: seconds > 0 ? { seconds } : null,
        });
    },

    /**
     * Add notification received listener
     * @param {Function} callback - Callback function to handle received notification
     * @returns {Subscription} Notification subscription
     */
    addNotificationReceivedListener: (callback) => {
        return Notifications.addNotificationReceivedListener(callback);
    },

    /**
     * Add notification response listener (when user taps on notification)
     * @param {Function} callback - Callback function to handle notification response
     * @returns {Subscription} Notification subscription
     */
    addNotificationResponseReceivedListener: (callback) => {
        return Notifications.addNotificationResponseReceivedListener(callback);
    },

    /**
     * Get notification preferences
     * @returns {Promise<Object>} Notification preferences
     */
    getNotificationPreferences: async () => {
        try {
            const preferences = await AsyncStorage.getItem('notificationPreferences');
            return preferences ? JSON.parse(preferences) : { enabled: true };
        } catch (error) {
            console.error('Error getting notification preferences:', error);
            return { enabled: true };
        }
    },

    /**
     * Update notification preferences
     * @param {Object} preferences - Notification preferences
     */
    updateNotificationPreferences: async (preferences) => {
        try {
            await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error updating notification preferences:', error);
        }
    },
};

export default notificationService;
