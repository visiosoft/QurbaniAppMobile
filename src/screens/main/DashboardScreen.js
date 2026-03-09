import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import qurbaniService from '../../services/qurbaniService';
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
    const { user, logout } = useAuth();

    const [qurbaniData, setQurbaniData] = useState(null);
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
                console.log('Refreshed Qurbani Data:', response.qurbani);
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
        } catch (error) {
            console.error('Refresh error:', error);
            if (Platform.OS === 'web') {
                window.alert('Error: Failed to refresh status.');
            } else {
                Alert.alert('Error', 'Failed to refresh status.');
            }
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
        fetchQurbaniStatus();
    }, []);

    if (isLoading) {
        return <Loading message="Loading your Qurbani status..." />;
    }

    const isIndividual = user?.accountType === ACCOUNT_TYPES.INDIVIDUAL;
    const canMarkReady = qurbaniData?.status === STATUS_TYPES.PENDING;

    // Handler for ActionCard navigation
    const handleActionCardPress = (title) => {
        if (title === 'My Profile') {
            navigation.navigate('Profile');
        } else if (title === 'Family Group') {
            navigation.navigate('Members');
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
                <Card style={styles.statusCard}>
                    <Text style={styles.statusTitle}>Qurbani Status</Text>


                    <InfoRow
                        label={
                            <>
                                {qurbaniData?.status === 'done' ? (
                                    <View style={{ alignItems: 'center', width: '100%' }}>
                                        <Text style={{ fontWeight: 'bold', color: 'green', fontSize: 16, textAlign: 'center' }}>🎉 Congratulations!</Text>
                                        <Text style={{ fontWeight: 'bold', color: 'green', fontSize: 15, textAlign: 'center', marginTop: 2 }}>Qurbani Completed</Text>
                                    </View>
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                        <StatusBadge status={qurbaniData?.status === 'ready' ? 'Qurbani Requested' : (qurbaniData?.status || STATUS_TYPES.PENDING)} />
                                        {qurbaniData?.status === 'ready' && (
                                            <Text style={{ fontWeight: 'bold', color: 'red', marginLeft: 8 }}>
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </>
                        }
                    />
                    <InfoRow
                        label="Wait Time"
                        value={
                            <>
                                {qurbaniData?.status === 'ready' && countdown > 0 && (
                                    <Text style={{ marginLeft: 10, color: '#1e0104', fontWeight: 'bold' }}>
                                        {`${Math.floor(countdown / 3600)}:${String(Math.floor((countdown % 3600) / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`} left
                                    </Text>
                                )}
                            </>
                        }
                    />
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
                        value={isIndividual ? 'Individual' : 'Group Account'}
                    />
                </Card>

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

                    <HistoryItem
                        icon="alert-circle"
                        color="#f39c12"
                        title={`Qurbani: ${qurbaniData?.status === 'ready' ? 'Requested' : (qurbaniData?.status || STATUS_TYPES.PENDING)}`}
                        subtitle={`${qurbaniData?.status === 'ready' ? 'Requested' : (qurbaniData?.status || STATUS_TYPES.PENDING)}`}
                        time=""
                    />
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

const HistoryItem = ({ icon, color, title, subtitle, time }) => (
    <View style={styles.historyItem}>
        <Ionicons name={icon} size={26} color={color} />
        <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.historyMain}>{title}</Text>
            <Text style={styles.historySub}>{subtitle}</Text>
        </View>
        {time ? <Text style={styles.historyTime}>{time}</Text> : null}
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

    /* STATUS */
    statusCard: {
        backgroundColor: '#f7d774',
        margin: 16,
        borderRadius: 12,
        padding: 16,
    },

    statusTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 16,
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    statusText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
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

    historyMain: {
        fontWeight: '600',
    },

    historySub: {
        color: '#2e8b57',
        fontSize: 13,
    },

    historyTime: {
        color: '#888',
        fontSize: 12,
    },
});

export default DashboardScreen;