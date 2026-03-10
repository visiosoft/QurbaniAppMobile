import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/constants';

// Import screens
import DashboardScreen from '../screens/main/DashboardScreen';
import GroupMembersScreen from '../screens/main/GroupMembersScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import HelpInfoScreen from '../screens/main/HelpInfoScreen';
import PrayerTimesScreen from '../screens/main/PrayerTimesScreen';
import { useAuth } from '../contexts/AuthContext';
import { ACCOUNT_TYPES } from '../config/constants';

const Tab = createBottomTabNavigator();

/**
 * Custom Header Component for Dashboard
 * Modern gradient design with Islamic styling
 */
const DashboardHeader = () => {
    return (
        <View style={headerStyles.container}>
            <MaterialCommunityIcons name="sheep" size={28} color="#C9A961" style={headerStyles.icon} />
            <Text style={headerStyles.title}>Qurbani Mate</Text>
        </View>
    );
};

/**
 * Custom Header Background with Gradient
 */
const HeaderBackground = () => {
    return (
        <LinearGradient
            colors={['#2E7D32', '#1B5E20', '#0D3C15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
        />
    );
};

const headerStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    icon: {
        marginRight: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1.2,
        fontFamily: Platform.OS === 'ios' ? 'Damascus' : 'serif',
    },
});

/**
 * Main Navigator
 * Bottom tab navigation for authenticated users
 */
const MainNavigator = () => {
    const { user } = useAuth();
    const isGroupAccount = user?.accountType === ACCOUNT_TYPES.GROUP;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Members') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'PrayerTimes') {
                        iconName = focused ? 'moon' : 'moon-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                headerBackground: () => <HeaderBackground />,
                headerStyle: {
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: COLORS.textLight,
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                    letterSpacing: 0.5,
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    headerTitle: () => <DashboardHeader />,
                    headerBackground: () => <HeaderBackground />,
                    headerStyle: {
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0,
                    },
                }}
            />

            {/* Members screen - always available for navigation but only visible in tabs for group accounts */}
            <Tab.Screen
                name="Members"
                component={GroupMembersScreen}
                options={{
                    title: 'Family Group',
                    tabBarButton: isGroupAccount ? undefined : () => null,
                    tabBarStyle: isGroupAccount ? undefined : { display: 'none' },
                }}
            />

            {/* Prayer Times screen - always visible */}
            <Tab.Screen
                name="PrayerTimes"
                component={PrayerTimesScreen}
                options={{
                    title: 'Prayer Times',
                }}
            />

            {/* Help & Info screen - hidden from tabs but available for navigation */}
            <Tab.Screen
                name="HelpInfo"
                component={HelpInfoScreen}
                options={{
                    title: 'Help & Info',
                    tabBarButton: () => null,
                }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'My Profile',
                }}
            />
        </Tab.Navigator>
    );
};

export default MainNavigator;
