import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Switch,
    Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import notificationService from '../../services/notificationService';
import Card, { InfoRow } from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import {
    COLORS,
    SPACING,
    FONT_SIZES,
    QURBANI_TYPE_LABELS,
    ACCOUNT_TYPES,
} from '../../config/constants';

/**
 * Profile Screen
 * View and edit user profile information
 */
const ProfileScreen = () => {
    const { user, updateUser, logout, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Editable fields
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Validation errors
    const [errors, setErrors] = useState({});

    /**
     * Load notification preferences
     */
    useEffect(() => {
        loadNotificationPreferences();
    }, []);

    // Refresh user data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            console.log('👁️ ProfileScreen focused - refreshing user data');
            const refreshUserData = async () => {
                try {
                    const freshUser = await refreshUser();
                    setPhoneNumber(freshUser?.phoneNumber || '');
                    console.log('✅ User data refreshed on ProfileScreen');
                } catch (error) {
                    console.log('⚠️ Could not refresh user on ProfileScreen:', error);
                    // Check for different types of errors
                    if (error.message?.includes('Network') || error.message?.includes('network') ||
                        error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
                        const title = 'Connection Failed';
                        const message = 'Cannot connect to server. Please check your internet connection.';

                        if (Platform.OS === 'web') {
                            window.alert(title + '\\n\\n' + message);
                        } else {
                            Alert.alert(title, message);
                        }
                    }
                }
            };
            refreshUserData();
        }, [])
    );

    /**
     * Load notification preferences from storage
     */
    const loadNotificationPreferences = async () => {
        try {
            const preferences = await notificationService.getNotificationPreferences();
            setNotificationsEnabled(preferences.enabled);
        } catch (error) {
            console.error('Error loading notification preferences:', error);
        }
    };

    /**
     * Handle save profile changes
     */
    const handleSaveProfile = async () => {
        // Basic validation - just check if not empty
        if (!phoneNumber.trim()) {
            setErrors({ phoneNumber: 'Phone number is required' });
            return;
        }

        try {
            setIsSaving(true);
            setErrors({});

            // API call to update profile
            const updatedUser = await userService.updateProfile({
                phoneNumber: phoneNumber.trim(),
            });

            // Update user in context
            updateUser(updatedUser);

            if (Platform.OS === 'web') {
                window.alert('Profile updated successfully!');
            } else {
                Alert.alert('Success', 'Profile updated successfully!');
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);

            // Check for duplicate phone number error
            if (error.response?.data?.error === 'Duplicate entry') {
                setErrors({ phoneNumber: error.response.data.message });
            } else {
                if (Platform.OS === 'web') {
                    window.alert('Error: ' + (error.message || 'Failed to update profile.'));
                } else {
                    Alert.alert('Error', error.message || 'Failed to update profile.');
                }
            }
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Handle notification preference change
     */
    const handleNotificationToggle = async (value) => {
        try {
            setNotificationsEnabled(value);

            // Save preference
            await notificationService.updateNotificationPreferences({
                enabled: value,
            });

            if (value) {
                // Register for push notifications
                await notificationService.registerForPushNotifications();
                if (Platform.OS === 'web') {
                    window.alert('Notifications Enabled\nYou will receive notifications about your Qurbani status.');
                } else {
                    Alert.alert('Notifications Enabled', 'You will receive notifications about your Qurbani status.');
                }
            } else {
                if (Platform.OS === 'web') {
                    window.alert('Notifications Disabled\nYou will not receive push notifications.');
                } else {
                    Alert.alert('Notifications Disabled', 'You will not receive push notifications.');
                }
            }
        } catch (error) {
            console.error('Error updating notification preference:', error);
            if (Platform.OS === 'web') {
                window.alert('Error: Failed to update notification preferences.');
            } else {
                Alert.alert('Error', 'Failed to update notification preferences.');
            }
            // Revert toggle
            setNotificationsEnabled(!value);
        }
    };

    /**
     * Cancel editing
     */
    const handleCancelEdit = () => {
        setPhoneNumber(user?.phoneNumber || '');
        setErrors({});
        setIsEditing(false);
    };

    if (isLoading) {
        return <Loading message="Loading profile..." />;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* User Information Card */}
            <Card title="Personal Information" style={styles.card}>
                <InfoRow label="Name" value={user?.name || 'N/A'} />
                <InfoRow label="Passport Number" value={user?.passportNumber || 'N/A'} />

                {isEditing ? (
                    <View style={styles.editSection}>
                        <Input
                            label="Phone Number"
                            value={phoneNumber}
                            onChangeText={(text) => {
                                setPhoneNumber(text);
                                if (errors.phoneNumber) {
                                    setErrors({});
                                }
                            }}
                            placeholder="+1234567890"
                            keyboardType="phone-pad"
                            error={errors.phoneNumber}
                        />
                    </View>
                ) : (
                    <InfoRow label="Phone Number" value={user?.phoneNumber || 'N/A'} />
                )}
            </Card>

            {/* Qurbani Information Card */}
            <Card title="Qurbani Information" style={styles.card}>
                <InfoRow
                    label="Qurbani Type"
                    value={QURBANI_TYPE_LABELS[user?.qurbaniType] || user?.qurbaniType || 'N/A'}
                />
                <InfoRow
                    label="Account Type"
                    value={user?.accountType === ACCOUNT_TYPES.INDIVIDUAL ? 'Individual' : 'Group Representative'}
                />
                {user?.companyId?.companyName && (
                    <InfoRow
                        label="Company"
                        value={user.companyId.companyName}
                    />
                )}
            </Card>

            {/* Notification Preferences Card */}
            <Card title="Notification Preferences" style={styles.card}>
                <View style={styles.switchRow}>
                    <View style={styles.switchLabel}>
                        <Text style={styles.switchTitle}>Push Notifications</Text>
                        <Text style={styles.switchDescription}>
                            Receive notifications when your Qurbani status changes
                        </Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={handleNotificationToggle}
                        trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                        thumbColor={notificationsEnabled ? COLORS.primary : COLORS.textSecondary}
                    />
                </View>
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                {isEditing ? (
                    <>
                        <Button
                            title="Save Changes"
                            onPress={handleSaveProfile}
                            loading={isSaving}
                            style={styles.button}
                        />
                        <Button
                            title="Cancel"
                            onPress={handleCancelEdit}
                            variant="outline"
                            style={styles.button}
                        />
                    </>
                ) : (
                    <Button
                        title="Edit Phone Number"
                        onPress={() => setIsEditing(true)}
                        variant="secondary"
                        style={styles.button}
                    />
                )}
            </View>

            {/* Logout Button */}
            <Button
                title="Logout"
                onPress={() => {
                    if (Platform.OS === 'web') {
                        const confirmed = window.confirm('Are you sure you want to logout?');
                        if (confirmed) {
                            logout();
                        }
                    } else {
                        Alert.alert(
                            'Logout',
                            'Are you sure you want to logout?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Logout', onPress: logout, style: 'destructive' },
                            ]
                        );
                    }
                }}
                variant="danger"
                style={styles.logoutButton}
            />

            {/* App Version */}
            <Text style={styles.versionText}>Qurbani Mobile v1.0.0</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.md,
        paddingBottom: SPACING.xxl,
    },
    card: {
        marginBottom: SPACING.md,
    },
    editSection: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    switchLabel: {
        flex: 1,
        marginRight: SPACING.md,
    },
    switchTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    switchDescription: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    actionButtons: {
        marginTop: SPACING.md,
    },
    button: {
        marginBottom: SPACING.sm,
    },
    logoutButton: {
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
    },
    versionText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.md,
    },
});

export default ProfileScreen;
