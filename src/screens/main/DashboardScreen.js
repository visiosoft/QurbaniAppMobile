import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
// Helper to get remaining seconds from a timestamp
function getRemainingSeconds(startTime, durationSeconds) {
    if (!startTime) return 0;
    const end = new Date(new Date(startTime).getTime() + durationSeconds * 1000);
    const now = new Date();
    return Math.max(0, Math.floor((end - now) / 1000));
}

import {
    View,
    Text,
    RefreshControl,
    Alert,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Pressable,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card, { InfoRow } from '../../components/Card';
import QurbaniStatusCard from '../../components/QurbaniStatusCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import qurbaniService from '../../services/qurbaniService';
import groupService from '../../services/groupService';
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

const DashboardScreen = ({ navigation }) => {
    const { user, logout, refreshUser } = useAuth();

    const [qurbaniData, setQurbaniData] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMarkingReady, setIsMarkingReady] = useState(false);
    const [readyTimestamp, setReadyTimestamp] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef(null);

    // Countdown timer effect (must be in component body, not inside any function)
    useEffect(() => {
        if (qurbaniData?.status === 'ready' && readyTimestamp) {
            setCountdown(getRemainingSeconds(readyTimestamp, 21600));
            timerRef.current = setInterval(() => {
                setCountdown(getRemainingSeconds(readyTimestamp, 21600));
            }, 1000);
            return () => clearInterval(timerRef.current);
        } else {
            setCountdown(0);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [qurbaniData?.status, readyTimestamp]);
    const fetchQurbaniStatus = async (showLoader = true) => {
        try {
            console.log('📊 fetchQurbaniStatus called, showLoader:', showLoader);
            if (showLoader) setIsLoading(true);

            const qurbaniDataStr = await AsyncStorage.getItem('qurbaniData');
            const userDataStr = await AsyncStorage.getItem('userData');

            if (qurbaniDataStr) {
                const qurbani = JSON.parse(qurbaniDataStr);
                const userData = userDataStr ? JSON.parse(userDataStr) : user;

                const displayStatus =
                    userData?.accountType === 'group'
                        ? userData.status
                        : qurbani.status;

                setQurbaniData({
                    _id: qurbani.id,
                    status: displayStatus,
                    qurbaniType: qurbani.qurbaniType,
                    accountType: qurbani.accountType,
                    groupId: qurbani.groupId || null,
                    createdAt: qurbani.createdAt,
                    readyAt: qurbani.readyAt,
                    completedAt: qurbani.completedAt,
                    notes: qurbani.notes,
                });

                // If status is ready, set timer using readyAt timestamp
                if (displayStatus === 'ready') {
                    const readyTime = qurbani.readyAt || qurbani.updatedAt || qurbani.createdAt;
                    setReadyTimestamp(readyTime);
                } else {
                    setReadyTimestamp(null);
                }
            }
            // (Timer effect moved outside fetchQurbaniStatus)
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    /**
     * Refresh API data from server
     */
    const refreshQurbaniData = async () => {
        try {
            setIsRefreshing(true);

            // First refresh user profile to get latest data
            try {
                await refreshUser();
                console.log('✅ User profile refreshed');
            } catch (refreshError) {
                console.log('⚠️ Could not refresh user profile:', refreshError);
                // Check if it's a network error
                if (refreshError.message?.includes('Network') || refreshError.message?.includes('network')) {
                    if (Platform.OS === 'web') {
                        window.alert('No Internet Connection\n\nPlease check your internet connection and try again.');
                    } else {
                        Alert.alert(
                            'No Internet Connection',
                            'Please check your internet connection and try again.',
                            [{ text: 'OK' }]
                        );
                    }
                    return; // Stop execution if no internet
                }
            }

            const response = await qurbaniService.getStatus();

            if (response.qurbani) {
                await AsyncStorage.setItem(
                    'qurbaniData',
                    JSON.stringify(response.qurbani)
                );

                const userDataStr = await AsyncStorage.getItem('userData');
                const userData = userDataStr ? JSON.parse(userDataStr) : user;
                console.log('Refreshed Qurbani Data:', response.qurbani);
                const displayStatus =
                    userData?.accountType === 'group'
                        ? userData.status
                        : response.qurbani.status;

                setQurbaniData({
                    _id: response.qurbani.id,
                    status: displayStatus,
                    qurbaniType: response.qurbani.qurbaniType,
                    accountType: response.qurbani.accountType,
                    groupId: response.qurbani.groupId || null,
                    createdAt: response.qurbani.createdAt,
                    readyAt: response.qurbani.readyAt,
                    completedAt: response.qurbani.completedAt,
                    notes: response.qurbani.notes,
                });

                // Update timer if status is ready
                if (displayStatus === 'ready') {
                    const readyTime = response.qurbani.readyAt || response.qurbani.updatedAt || response.qurbani.createdAt;
                    setReadyTimestamp(readyTime);
                } else {
                    setReadyTimestamp(null);
                }
            }

            // Also refresh group members if in a group
            await fetchGroupMembers();
        } catch (error) {
            console.error('Refresh error:', error);
            // Check for network errors
            if (error.message?.includes('Network') || error.message?.includes('network')) {
                if (Platform.OS === 'web') {
                    window.alert('No Internet Connection\n\nPlease check your internet connection and try again.');
                } else {
                    Alert.alert(
                        'No Internet Connection',
                        'Please check your internet connection and try again.',
                        [{ text: 'OK' }]
                    );
                }
            } else {
                if (Platform.OS === 'web') {
                    window.alert('Error: Failed to refresh status.');
                } else {
                    Alert.alert('Error', 'Failed to refresh status.');
                }
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        refreshQurbaniData();
        fetchGroupMembers(); // Also refresh group members
    }, []);

    /**
     * Fetch group members if user is in a group
     */
    const fetchGroupMembers = async () => {
        try {
            // Only fetch if user is in a group
            if (user?.accountType === 'group' && user?.groupId) {
                console.log('📋 Fetching group members for history...');
                const data = await groupService.getMembers();
                console.log('✅ Fetched group members for history:', data.members?.length || 0);
                setGroupMembers(data.members || []);
            } else {
                console.log('ℹ️ User is not in a group, skipping member fetch');
                setGroupMembers([]);
            }
        } catch (error) {
            console.error('❌ Error fetching group members for history:', error);
            setGroupMembers([]);
        }
    };

    /**
     * Mark Ready
     */
    const handleMarkReady = async () => {
        // Web-compatible confirmation
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(
                'Have you completed throwing 7 pebbles at Jamrat al-Aqabah?\n\nClick OK to request for Qurbani.'
            );

            if (confirmed) {
                try {
                    setIsMarkingReady(true);

                    const result = await qurbaniService.markReady();

                    if (result.qurbani) {
                        await AsyncStorage.setItem(
                            'qurbaniData',
                            JSON.stringify(result.qurbani)
                        );
                    }

                    window.alert('Success! You have requested for Qurbani!');
                    fetchQurbaniStatus(false);
                } catch (error) {
                    window.alert('Error: Failed to request for Qurbani.');
                    console.error('Mark ready error:', error);
                } finally {
                    setIsMarkingReady(false);
                }
            }
        } else {
            // Native mobile Alert
            Alert.alert(
                'Request for Qurbani',
                'Have you completed throwing 7 pebbles at Jamrat al-Aqabah?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Yes, Request for Qurbani',
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

                                Alert.alert('Success', 'You have requested for Qurbani!', [
                                    { text: 'OK', onPress: () => fetchQurbaniStatus(false) },
                                ]);
                            } catch (error) {
                                Alert.alert('Error', 'Failed to request for Qurbani.');
                            } finally {
                                setIsMarkingReady(false);
                            }
                        },
                    },
                ]
            );
        }
    };

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('Are you sure you want to logout?');
            if (confirmed) {
                logout();
            }
        } else {
            Alert.alert('Logout', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: logout, style: 'destructive' },
            ]);
        }
    };

    useEffect(() => {
        console.log('🎬 Dashboard mounted - fetching initial data');
        fetchQurbaniStatus();
        fetchGroupMembers();
    }, []); // Run once on mount - avoid infinite loops

    // Refresh data when screen comes into focus (e.g., after navigating back)
    useFocusEffect(
        useCallback(() => {
            console.log('👁️ Dashboard focused - refreshing data');
            // Only refresh if not already loading
            if (!isLoading && !isRefreshing) {
                fetchQurbaniStatus(false);
                fetchGroupMembers();
            }
        }, [isLoading, isRefreshing])
    );

    if (isLoading) {
        return <Loading message="Loading your Qurbani status..." />;
    }

    const isIndividual = user?.accountType === ACCOUNT_TYPES.INDIVIDUAL;
    const canMarkReady = qurbaniData?.status === STATUS_TYPES.PENDING;

    // Handler for ActionCard navigation
    const handleActionCardPress = async (title) => {
        if (title === 'My Profile') {
            navigation.navigate('Profile');
        } else if (title === 'Family Group') {
            // Refresh user data to ensure we have the latest accountType
            try {
                console.log('🔄 Refreshing user data before navigating to Family Group...');
                await refreshUser();
                console.log('✅ User data refreshed successfully');
                navigation.navigate('Members');
            } catch (error) {
                console.log('❌ Could not refresh user before navigation:', error);
                // Check for network errors
                if (error.message?.includes('Network') || error.message?.includes('network')) {
                    if (Platform.OS === 'web') {
                        window.alert('No Internet Connection\n\nPlease check your internet connection and try again.');
                    } else {
                        Alert.alert(
                            'No Internet Connection',
                            'Please check your internet connection and try again.',
                            [{ text: 'OK' }]
                        );
                    }
                } else {
                    // Navigate anyway with cached data
                    navigation.navigate('Members');
                }
            }
        } else if (title === 'Help & Info') {
            navigation.navigate('HelpInfo');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                        showsVerticalScrollIndicator={false}
                    />
                }>

                {/* ================= BANNER ================= */}
                <Image
                    source={require('../../../assets/hajj.png')}
                    style={styles.banner}
                />

                {/* ================= WELCOME ================= */}
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>
                        Welcome, {user?.name || 'Haji Family'}
                    </Text>
                    <Text style={styles.hajjYear}>Hajj {new Date().getFullYear()}</Text>
                </View>

                {/* ================= ACTION BUTTONS ================= */}
                <View style={styles.actionsRow}>
                    <ActionCard icon="person" title="My Profile" onPress={handleActionCardPress} />
                    <ActionCard
                        icon="people"
                        title="Family Group"
                        onPress={isIndividual ? undefined : handleActionCardPress}
                        disabled={isIndividual}
                    />
                    <ActionCard icon="information-circle" title="Help & Info" onPress={handleActionCardPress} />
                </View>

                {/* ================= QURBANI STATUS CARD ================= */}
                <QurbaniStatusCard
                    status={
                        qurbaniData?.status === 'done'
                            ? 'Qurbani Completed'
                            : qurbaniData?.status === 'ready'
                                ? 'Requested for Qurbani'
                                : 'Pending'
                    }
                    waitTime={
                        qurbaniData?.status === 'ready' && countdown > 0
                            ? `${Math.floor(countdown / 3600)}h ${Math.floor((countdown % 3600) / 60)}m`
                            : '0h 0m'
                    }
                    qurbaniType={
                        QURBANI_TYPE_LABELS[qurbaniData?.qurbaniType] ||
                        qurbaniData?.qurbaniType ||
                        'Not Set'
                    }
                    accountType={isIndividual ? 'Individual' : 'Group Account'}
                    statusColor={
                        qurbaniData?.status === 'done'
                            ? '#4CAF50'
                            : qurbaniData?.status === 'ready'
                                ? '#E67E22'
                                : '#FF9800'
                    }
                    description={
                        qurbaniData?.status === 'done'
                            ? '🎉 Congratulations! Your Qurbani has been completed.'
                            : qurbaniData?.status === 'ready'
                                ? 'Your Qurbani request is received.'
                                : 'Complete Jamarat to request for Qurbani.'
                    }
                />

                {/* Action */}
                {canMarkReady && (
                    <Pressable
                        onPress={handleMarkReady}
                        style={({ pressed }) => [
                            styles.proceedButton,
                            pressed && { opacity: 0.7 }
                        ]}
                    >
                        <Text style={styles.proceedText}>Proceed for Qurbani</Text>
                        <Ionicons name="chevron-forward" size={22} color="#fff" />
                    </Pressable>
                )}




                {/* ================= HISTORY ================= */}
                <View style={styles.historyCard}>
                    <Text style={styles.historyTitle}>Status History</Text>

                    <HistoryItem
                        icon="checkmark-circle"
                        color="#2ecc71"
                        title="Jamarat Completed"
                        subtitle="Ready for Qurbani"
                        time="Just now"
                    />

                    {/* Show group members' qurbani status if user is in a group */}
                    {user?.accountType === 'group' && groupMembers.length > 0 ? (
                        <>
                            <View style={styles.historySeparator}>
                                <Text style={styles.historySeparatorText}>Family Members Qurbani Status</Text>
                            </View>
                            {groupMembers.map((member) => (
                                <HistoryItem
                                    key={member.id}
                                    icon={
                                        member.qurbaniStatus === 'ready' || member.qurbaniStatus === 'done'
                                            ? 'checkmark-circle'
                                            : member.qurbaniStatus === 'pending'
                                                ? 'time-outline'
                                                : 'alert-circle'
                                    }
                                    color={
                                        member.qurbaniStatus === 'ready' || member.qurbaniStatus === 'done'
                                            ? '#2ecc71'
                                            : member.qurbaniStatus === 'pending'
                                                ? '#f39c12'
                                                : '#e74c3c'
                                    }
                                    title={`${member.name}${member.isRepresentative ? ' (You)' : ''}`}
                                    subtitle={`Qurbani: ${member.qurbaniStatus === 'ready'
                                        ? 'Requested'
                                        : member.qurbaniStatus === 'done'
                                            ? 'Completed'
                                            : member.qurbaniStatus === 'pending'
                                                ? 'Pending'
                                                : member.qurbaniStatus
                                        }`}
                                    time={member.qurbaniType || ''}
                                    highlight={member.qurbaniStatus === 'ready'}
                                />
                            ))}
                        </>
                    ) : (
                        /* Show individual user's qurbani status */
                        <HistoryItem
                            icon="alert-circle"
                            color="#f39c12"
                            title={`Qurbani: ${qurbaniData?.status === 'ready' ? 'Requested' : (qurbaniData?.status || STATUS_TYPES.PENDING)}`}
                            subtitle={`${qurbaniData?.status === 'ready' ? 'Requested' : (qurbaniData?.status || STATUS_TYPES.PENDING)}`}
                            time=""
                            highlight={qurbaniData?.status === 'ready'}
                        />
                    )}
                </View>

            </ScrollView>
        </View>
    );
};

/* ================= COMPONENTS ================= */

const ActionCard = ({ icon, title, onPress, disabled }) => (
    <Pressable
        style={({ pressed }) => [
            styles.actionCard,
            disabled && { backgroundColor: '#ccc' },
            pressed && !disabled && { opacity: 0.7 }
        ]}
        onPress={onPress ? () => onPress(title) : undefined}
        disabled={disabled}
    >
        <Ionicons name={icon} size={32} color={disabled ? '#888' : '#fff'} />
        <Text style={[styles.actionText, disabled && { color: '#888' }]}>{title}</Text>
    </Pressable>
);

const HistoryItem = ({ icon, color, title, subtitle, time, highlight }) => (
    <View style={[
        styles.historyItem,
        highlight && styles.historyItemHighlight,
    ]}>
        <Ionicons name={icon} size={26} color={color} />
        <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[
                styles.historyMain,
                highlight && styles.historyMainHighlight,
            ]}>
                {title}
            </Text>
            <Text style={[
                styles.historySub,
                highlight && styles.historySubHighlight,
            ]}>
                {subtitle}
            </Text>
        </View>
        {highlight && (
            <View style={styles.pendingBadge}>
                <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                <Text style={styles.pendingBadgeText}>PENDING</Text>
            </View>
        )}
        {time && !highlight ? <Text style={styles.historyTime}>{time}</Text> : null}
    </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },

    /* HEADER */
    header: {
        backgroundColor: '#2e8b57',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    appTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
    },

    profileBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff30',
        padding: 6,
        borderRadius: 20,
    },

    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 8,
    },

    profileName: {
        color: '#fff',
        fontWeight: '600',
    },

    profileId: {
        color: '#eee',
        fontSize: 12,
    },

    /* BANNER */
    banner: {
        width: '100%',
        height: 180,
    },

    /* WELCOME */
    welcomeContainer: {
        alignItems: 'center',
        marginVertical: 15,
    },

    welcomeText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },

    hajjYear: {
        color: '#2e8b57',
        marginTop: 4,
        fontWeight: '600',
    },

    /* ACTIONS */
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },

    actionCard: {
        flex: 1,
        backgroundColor: '#2e8b57',
        marginHorizontal: 6,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 3,
        cursor: 'pointer',
        userSelect: 'none',
    },

    actionText: {
        color: '#fff',
        marginTop: 8,
        fontWeight: '600',
    },

    /* BUTTON */
    proceedButton: {
        backgroundColor: '#2e8b57',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
    },

    proceedText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 6,
    },

    /* HISTORY */
    historyCard: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        padding: 16,
    },

    historyTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },

    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: '#eee',
    },

    historyItemHighlight: {
        backgroundColor: '#FFF4E6',
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
        paddingLeft: 12,
        marginHorizontal: -16,
        paddingHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#FF6B6B',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    historyMain: {
        fontWeight: '600',
    },

    historyMainHighlight: {
        fontWeight: 'bold',
        color: '#D63031',
        fontSize: 15,
    },

    historySub: {
        color: '#2e8b57',
        fontSize: 13,
    },

    historySubHighlight: {
        color: '#FF6B6B',
        fontWeight: '600',
        fontSize: 14,
    },

    historyTime: {
        color: '#888',
        fontSize: 12,
    },

    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE5E5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },

    pendingBadgeText: {
        color: '#D63031',
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 4,
    },

    historySeparator: {
        marginTop: 12,
        marginBottom: 8,
        paddingTop: 12,
        borderTopWidth: 2,
        borderTopColor: '#e0e0e0',
    },

    historySeparatorText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        textAlign: 'center',
    },
});

export default DashboardScreen;