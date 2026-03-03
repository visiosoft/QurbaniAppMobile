import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Alert,
    TouchableOpacity,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import qurbaniService from '../../services/qurbaniService';
import Card, { InfoRow } from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import {
    COLORS,
    SPACING,
    FONT_SIZES,
    ACCOUNT_TYPES,
    STATUS_TYPES,
    QURBANI_TYPE_LABELS,
} from '../../config/constants';

/**
 * Dashboard Screen
 * Displays Qurbani status and allows marking as ready
 */
const DashboardScreen = () => {
    const { user, logout } = useAuth();
    const [qurbaniData, setQurbaniData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMarkingReady, setIsMarkingReady] = useState(false);

    /**
     * Fetch Qurbani status from stored data
     */
    const fetchQurbaniStatus = async (showLoader = true) => {
        try {
            if (showLoader) {
                setIsLoading(true);
            }

            // Get qurbani data from AsyncStorage (stored during login)
            const qurbaniDataStr = await AsyncStorage.getItem('qurbaniData');
            const userDataStr = await AsyncStorage.getItem('userData');
            
            if (qurbaniDataStr) {
                const qurbani = JSON.parse(qurbaniDataStr);
                const userData = userDataStr ? JSON.parse(userDataStr) : user;
                
                // For group accounts, use user status instead of qurbani status
                const displayStatus = userData?.accountType === 'group' ? userData.status : qurbani.status;
                
                setQurbaniData({
                    _id: qurbani.id,
                    status: displayStatus,
                    qurbaniType: qurbani.qurbaniType,
                    accountType: qurbani.accountType,
                    groupId: qurbani.groupId || null,
                    createdAt: qurbani.createdAt,
                    completedAt: qurbani.completedAt,
                    notes: qurbani.notes
                });
            }
        } catch (error) {
            console.error('Error fetching Qurbani status:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    /**
     * Refresh Qurbani data from API
     */
    const refreshQurbaniData = async () => {
        try {
            setIsRefreshing(true);
            
            // Call API to get latest qurbani data
            const response = await qurbaniService.getStatus();
            
            if (response.qurbani) {
                // Update AsyncStorage
                await AsyncStorage.setItem('qurbaniData', JSON.stringify(response.qurbani));
                
                // For group accounts, use user status
                const userDataStr = await AsyncStorage.getItem('userData');
                const userData = userDataStr ? JSON.parse(userDataStr) : user;
                const displayStatus = userData?.accountType === 'group' ? userData.status : response.qurbani.status;
                
                // Update state
                setQurbaniData({
                    _id: response.qurbani.id,
                    status: displayStatus,
                    qurbaniType: response.qurbani.qurbaniType,
                    accountType: response.qurbani.accountType,
                    groupId: response.qurbani.groupId || null,
                    createdAt: response.qurbani.createdAt,
                    completedAt: response.qurbani.completedAt,
                    notes: response.qurbani.notes
                });
            }
        } catch (error) {
            console.error('Error refreshing Qurbani data:', error);
            Alert.alert('Error', 'Failed to refresh qurbani status.');
        } finally {
            setIsRefreshing(false);
        }
    };

    /**
     * Handle pull-to-refresh
     */
    const onRefresh = useCallback(() => {
        refreshQurbaniData();
    }, []);

    /**
     * Mark Qurbani as ready
     */
    const handleMarkReady = async () => {
        Alert.alert(
            'Mark as Ready',
            'Have you completed throwing 7 pebbles at Jamrat al-Aqabah?\n\nMark yourself as ready to proceed to Qurbani.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Mark Ready',
                    onPress: async () => {
                        try {
                            setIsMarkingReady(true);

                            // API call to mark yourself as ready
                            const result = await qurbaniService.markReady();

                            // Update stored data
                            if (result.qurbani) {
                                await AsyncStorage.setItem('qurbaniData', JSON.stringify(result.qurbani));
                            }
                            
                            // Update user data with new status
                            if (result.user) {
                                const userDataStr = await AsyncStorage.getItem('userData');
                                if (userDataStr) {
                                    const userData = JSON.parse(userDataStr);
                                    userData.status = result.user.status;
                                    await AsyncStorage.setItem('userData', JSON.stringify(userData));
                                }
                            }

                            Alert.alert(
                                'Success',
                                'You have been marked as ready! You may now proceed to Qurbani.',
                                [{ text: 'OK', onPress: () => fetchQurbaniStatus(false) }]
                            );
                        } catch (error) {
                            console.error('Error marking ready:', error);
                            Alert.alert('Error', error.message || 'Failed to mark as ready.');
                        } finally {
                            setIsMarkingReady(false);
                        }
                    },
                },
            ]
        );
    };

    /**
     * Handle logout
     */
    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: logout, style: 'destructive' },
            ]
        );
    };

    useEffect(() => {
        fetchQurbaniStatus();
    }, []);

    if (isLoading) {
        return <Loading message="Loading your Qurbani status..." />;
    }

    const isIndividual = user?.accountType === ACCOUNT_TYPES.INDIVIDUAL;
    const canMarkReady = qurbaniData?.status === STATUS_TYPES.PENDING;

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* Welcome Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Assalamu Alaikum,</Text>
                        <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                </View>

                {/* Banner Image */}
                <View style={styles.bannerContainer}>
                    <Image
                        source={require('../../../assets/hajj.png')}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Status Overview */
                <Card title={'Qurbani Status'} style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.statusLabel}>{'Current Status:'}</Text>
                        <StatusBadge status={qurbaniData?.status || STATUS_TYPES.PENDING} />
                    </View>

                    <View style={styles.divider} />

                    <InfoRow
                        label={'Qurbani Type'}
                        value={QURBANI_TYPE_LABELS[qurbaniData?.qurbaniType] || qurbaniData?.qurbaniType}
                    />
                    <InfoRow 
                        label={'Account Type'} 
                        value={isIndividual ? 'Individual' : 'Group'} 
                    />

                    {!isIndividual && qurbaniData?.memberCount && (
                        <InfoRow
                            label={'Total Members'}
                            value={qurbaniData.memberCount.toString()}
                        />
                    )}
                </Card>

                {/* Status Information */}
                <Card style={styles.infoCard}>
                    <View style={styles.statusIconContainer}>
                        <Ionicons
                            name={
                                qurbaniData?.status === STATUS_TYPES.DONE
                                    ? 'checkmark-circle'
                                    : qurbaniData?.status === STATUS_TYPES.READY
                                        ? 'time'
                                        : 'alert-circle'
                            }
                            size={48}
                            color={
                                qurbaniData?.status === STATUS_TYPES.DONE
                                    ? COLORS.done
                                    : qurbaniData?.status === STATUS_TYPES.READY
                                        ? COLORS.ready
                                        : COLORS.pending
                            }
                        />
                    </View>

                    <Text style={styles.statusTitle}>
                        {qurbaniData?.status === STATUS_TYPES.DONE && 'Qurbani Completed'}
                        {qurbaniData?.status === STATUS_TYPES.READY && 'Ready for Qurbani'}
                        {qurbaniData?.status === STATUS_TYPES.PENDING && 'Pending Confirmation'}
                    </Text>

                    <Text style={styles.statusDescription}>
                        {qurbaniData?.status === STATUS_TYPES.DONE &&
                            'Your Qurbani has been successfully completed. May Allah accept it.'}
                        {qurbaniData?.status === STATUS_TYPES.READY &&
                            'Your Qurbani is marked as ready. You will be notified when it is completed.'}
                        {qurbaniData?.status === STATUS_TYPES.PENDING &&
                            'Please complete the ritual before proceeding to Qurbani.'}
                    </Text>
                </Card>

                {/* Jamrat al-Aqabah Instruction - For both individual and group accounts with pending status */}
                {canMarkReady && (
                    <Card style={styles.ritualCard}>
                        <View style={styles.ritualHeader}>
                            <Ionicons name="location" size={28} color={COLORS.primary} />
                            <Text style={styles.ritualTitle}>Before Qurbani</Text>
                        </View>
                        <View style={styles.ritualContent}>
                            <Text style={styles.ritualInstruction}>
                                🕋 Throw 7 pebbles at Jamrat al-Aqabah
                            </Text>
                            <Text style={styles.ritualDescription}>
                                This is an essential ritual that must be completed before proceeding to Qurbani.
                            </Text>
                        </View>
                        <View style={styles.ritualFooter}>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                            <Text style={styles.ritualFooterText}>
                                Once completed, click below to mark yourself as ready
                            </Text>
                        </View>
                    </Card>
                )}

                {/* Action Button - For both individual and group accounts with pending status */}
                {canMarkReady && (
                    <Button
                        title="Mark as Ready"
                        onPress={handleMarkReady}
                        loading={isMarkingReady}
                        style={styles.actionButton}
                        icon={<Ionicons name="arrow-forward-circle-outline" size={20} color={COLORS.textLight} />}
                    />
                )}

                {/* Instructions for Group Accounts */}
                {!isIndividual && (
                    <Card style={styles.instructionCard}>
                        <View style={styles.instructionHeader}>
                            <Ionicons name="information-circle" size={24} color={COLORS.info} />
                            <Text style={styles.instructionTitle}>Group Representative</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            As a group representative, please go to the "Members" tab to view and manage your group members.
                            Mark each member as ready when they are prepared for Qurbani.
                        </Text>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        paddingHorizontal: SPACING.sm,
    },
    greeting: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
    },
    userName: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: SPACING.xs,
    },
    logoutButton: {
        padding: SPACING.sm,
    },
    bannerContainer: {
        marginHorizontal: SPACING.sm,
        marginBottom: SPACING.md,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bannerImage: {
        width: '100%',
        height: 180,
    },
    statusCard: {
        marginBottom: SPACING.md,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    statusLabel: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md,
    },
    infoCard: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        marginBottom: SPACING.md,
    },
    statusIconContainer: {
        marginBottom: SPACING.md,
    },
    statusTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    statusDescription: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: SPACING.md,
    },
    actionButton: {
        marginHorizontal: SPACING.sm,
        marginBottom: SPACING.md,
    },
    ritualCard: {
        backgroundColor: `${COLORS.primary}08`,
        borderColor: COLORS.primary,
        borderWidth: 1.5,
        marginBottom: SPACING.md,
        marginHorizontal: SPACING.sm,
    },
    ritualHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    ritualTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginLeft: SPACING.sm,
    },
    ritualContent: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 8,
        marginBottom: SPACING.md,
    },
    ritualInstruction: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    ritualDescription: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    ritualFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    ritualFooterText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.success,
        marginLeft: SPACING.xs,
        fontWeight: '500',
    },
    instructionCard: {
        backgroundColor: `${COLORS.info}10`,
        borderColor: COLORS.info,
        borderWidth: 1,
    },
    instructionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    instructionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginLeft: SPACING.sm,
    },
    instructionText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
});

export default DashboardScreen;
