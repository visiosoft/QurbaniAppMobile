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
 */
const DashboardScreen = () => {
    const { user, logout } = useAuth();

    const [qurbaniData, setQurbaniData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMarkingReady, setIsMarkingReady] = useState(false);

    /**
     * Fetch stored data
     */
    const fetchQurbaniStatus = async (showLoader = true) => {
        try {
            if (showLoader) setIsLoading(true);

            const qurbaniDataStr = await AsyncStorage.getItem('qurbaniData');
            const userDataStr = await AsyncStorage.getItem('userData');

            if (qurbaniDataStr) {
                const qurbani = JSON.parse(qurbaniDataStr);
                const userData = userDataStr ? JSON.parse(userDataStr) : user;

                const displayStatus =
                    userData?.accountType === 'Group'
                        ? userData.status
                        : qurbani.status;

                setQurbaniData({
                    _id: qurbani.id,
                    status: displayStatus,
                    qurbaniType: qurbani.qurbaniType,
                    accountType: qurbani.accountType,
                    groupId: qurbani.groupId || null,
                    createdAt: qurbani.createdAt,
                    completedAt: qurbani.completedAt,
                    notes: qurbani.notes,
                });
            }
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    /**
     * Refresh API data
     */
    const refreshQurbaniData = async () => {
        try {
            setIsRefreshing(true);

            const response = await qurbaniService.getStatus();

            if (response.qurbani) {
                await AsyncStorage.setItem(
                    'qurbaniData',
                    JSON.stringify(response.qurbani)
                );

                const userDataStr = await AsyncStorage.getItem('userData');
                const userData = userDataStr ? JSON.parse(userDataStr) : user;

                const displayStatus =
                    userData?.accountType === 'Group'
                        ? userData.status
                        : response.qurbani.status;

                setQurbaniData({
                    _id: response.qurbani.id,
                    status: displayStatus,
                    qurbaniType: response.qurbani.qurbaniType,
                    accountType: response.qurbani.accountType,
                    groupId: response.qurbani.groupId || null,
                    createdAt: response.qurbani.createdAt,
                    completedAt: response.qurbani.completedAt,
                    notes: response.qurbani.notes,
                });
            }
        } catch (error) {
            console.error('Refresh error:', error);
            Alert.alert('Error', 'Failed to refresh status.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        refreshQurbaniData();
    }, []);

    /**
     * Mark Ready
     */
    const handleMarkReady = async () => {
        Alert.alert(
            'Mark as Ready',
            'Have you completed throwing 7 pebbles at Jamrat al-Aqabah?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Mark Ready',
                    onPress: async () => {
                        try {
                            setIsMarkingReady(true);

                            const result = await qurbaniService.markReady();

                            if (result.qurbani) {
                                await AsyncStorage.setItem(
                                    'qurbaniData',
                                    JSON.stringify(result.qurbani)
                                );
                            }

                            Alert.alert('Success', 'You are marked as ready!', [
                                { text: 'OK', onPress: () => fetchQurbaniStatus(false) },
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to mark ready.');
                        } finally {
                            setIsMarkingReady(false);
                        }
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: logout, style: 'destructive' },
        ]);
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
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Assalamu Alaikum,</Text>
                        <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
                    </View>

                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                </View>

                {/* Banner */}
                <View style={styles.bannerContainer}>
                    <Image
                        source={require('../../../assets/hajj.png')}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Status Overview */}
                <Card title="Qurbani Status" style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.statusLabel}>Current Status:</Text>
                        <StatusBadge status={qurbaniData?.status || STATUS_TYPES.PENDING} />
                    </View>

                    <View style={styles.divider} />

                    <InfoRow
                        label="Qurbani Type"
                        value={
                            QURBANI_TYPE_LABELS[qurbaniData?.qurbaniType] ||
                            qurbaniData?.qurbaniType
                        }
                    />

                    <InfoRow
                        label="Account Type"
                        value={isIndividual ? 'Individual' : 'Group'}
                    />
                </Card>

                {/* Action */}
                {canMarkReady && (
                    <Button
                        title="Mark as Ready"
                        onPress={handleMarkReady}
                        loading={isMarkingReady}
                        style={styles.actionButton}
                    />
                )}
            </ScrollView>
        </View>
    );
};

/* =======================
   STYLES
======================= */

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
    },

    bannerContainer: {
        marginHorizontal: SPACING.sm,
        marginBottom: SPACING.md,
        borderRadius: 12,
        overflow: 'hidden',
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

    actionButton: {
        marginHorizontal: SPACING.sm,
        marginBottom: SPACING.md,
    },
});

export default DashboardScreen;