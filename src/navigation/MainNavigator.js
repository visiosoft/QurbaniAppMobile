import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';

// Import screens (will be created later)
import DashboardScreen from '../screens/main/DashboardScreen';
import GroupMembersScreen from '../screens/main/GroupMembersScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { useAuth } from '../contexts/AuthContext';
import { ACCOUNT_TYPES } from '../config/constants';

const Tab = createBottomTabNavigator();

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
                headerStyle: {
                    backgroundColor: COLORS.primary,
                },
                headerTintColor: COLORS.textLight,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    title: 'Qurbani Status',
                }}
            />

            {/* Only show Members tab for group accounts */}
            {isGroupAccount && (
                <Tab.Screen
                    name="Members"
                    component={GroupMembersScreen}
                    options={{
                        title: 'Family Group',
                    }}
                />
            )}

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
