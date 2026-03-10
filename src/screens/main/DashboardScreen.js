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
    const [isTypeConfirmed, setIsTypeConfirmed] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isProcessingMembers, setIsProcessingMembers] = useState(false);
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
                if (refreshError.message?.includes('Network') || refreshError.message?.includes('network') ||
                    refreshError.message?.includes('timeout') || refreshError.message?.includes('ECONNREFUSED')) {
                    if (Platform.OS === 'web') {
                        window.alert('Unable to Connect to Server\n\nThe app cannot reach the server. Please check:\n\n• Your internet connection is active\n• WiFi or mobile data is turned on\n• The server is running and accessible');
                    } else {
                        Alert.alert(
                            'Connection Failed',
                            'The app cannot reach the server. Please check:\n\n• Your internet connection is active\n• WiFi or mobile data is turned on\n• The server is running and accessible',
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
            let title = 'Error';
            let message = 'Failed to refresh status.';

            // Check for different types of errors
            if (error.message?.includes('Network') || error.message?.includes('network')) {
                title = 'Connection Failed';
                message = 'Cannot connect to the server. Please ensure:\n\n• You have an active internet connection\n• WiFi or mobile data is enabled\n• The server is online and reachable';
            } else if (error.message?.includes('timeout')) {
                title = 'Request Timeout';
                message = 'The server is taking too long to respond. Please try again in a moment.';
            } else if (error.message?.includes('ECONNREFUSED')) {
                title = 'Server Unavailable';
                message = 'Cannot reach the server. Please verify the server is running and accessible.';
            } else if (error.response?.status >= 500) {
                title = 'Server Error';
                message = 'The server encountered an error. Please try again later.';
            }

            if (Platform.OS === 'web') {
                window.alert(title + '\n\n' + message);
            } else {
                Alert.alert(title, message, [{ text: 'OK' }]);
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
     * Handle qurbani type checkbox toggle
     */
    const handleTypeToggle = () => {
        setIsTypeConfirmed(!isTypeConfirmed);
    };

    /**
     * Toggle member selection for group members
     */
    const toggleMemberSelection = (memberId) => {
        setSelectedMembers((prev) => {
            if (prev.includes(memberId)) {
                return prev.filter((id) => id !== memberId);
            } else {
                // No capacity check here - just allow selection
                return [...prev, memberId];
            }
        });
    };

    /**
     * Process selected members (mark multiple as ready)
     */
    const handleProcessSelectedMembers = async () => {
        if (selectedMembers.length === 0) {
            const message = 'Please select at least one member to proceed.';
            if (Platform.OS === 'web') {
                window.alert('No Selection\n\n' + message);
            } else {
                Alert.alert('No Selection', message);
            }
            return;
        }

        const selectedNames = groupMembers
            .filter((m) => selectedMembers.includes(m.id))
            .map((m) => m.name)
            .join(', ');

        const confirmMessage = `Proceed with Qurbani for ${selectedMembers.length} member(s)?\n\n${selectedNames}`;

        if (Platform.OS === 'web') {
            const confirmed = window.confirm(confirmMessage);
            if (!confirmed) return;

            try {
                setIsProcessingMembers(true);

                // Process each selected member
                for (const memberId of selectedMembers) {
                    await groupService.markMemberReady(memberId);
                }

                window.alert(`Success!\n\n${selectedMembers.length} member(s) marked as ready for Qurbani!`);
                setSelectedMembers([]);
                await fetchGroupMembers();
            } catch (error) {
                console.error('Error processing members:', error);
                let errorMsg = 'Failed to process some members.';

                if (error.message?.includes('Network') || error.message?.includes('network') ||
                    error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
                    errorMsg = 'Cannot connect to server. Please check your internet connection and try again.';
                } else if (error.message) {
                    errorMsg = error.message;
                }

                window.alert('Error\n\n' + errorMsg);
            } finally {
                setIsProcessingMembers(false);
            }
        } else {
            Alert.alert(
                'Confirm',
                confirmMessage,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Confirm',
                        onPress: async () => {
                            try {
                                setIsProcessingMembers(true);

                                // Process each selected member
                                for (const memberId of selectedMembers) {
                                    await groupService.markMemberReady(memberId);
                                }

                                Alert.alert(
                                    'Success',
                                    `${selectedMembers.length} member(s) marked as ready for Qurbani!`
                                );
                                setSelectedMembers([]);
                                await fetchGroupMembers();
                            } catch (error) {
                                console.error('Error processing members:', error);
                                let errorTitle = 'Error';
                                let errorMsg = 'Failed to process some members.';

                                if (error.message?.includes('Network') || error.message?.includes('network') ||
                                    error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
                                    errorTitle = 'Connection Failed';
                                    errorMsg = 'Cannot connect to server. Please check your internet connection and try again.';
                                } else if (error.response?.status >= 500) {
                                    errorTitle = 'Server Error';
                                    errorMsg = 'The server encountered an error. Please try again later.';
                                } else if (error.message) {
                                    errorMsg = error.message;
                                }

                                Alert.alert(errorTitle, errorMsg);
                            } finally {
                                setIsProcessingMembers(false);
                            }
                        },
                    },
                ]
            );
        }
    };

    /**
     * Mark Ready
     */
    const handleMarkReady = async () => {
        // Check if type is confirmed when status is pending
        if (qurbaniData?.status === STATUS_TYPES.PENDING && !isTypeConfirmed) {
            const message = 'Please confirm your Qurbani type by checking the box before proceeding.';
            if (Platform.OS === 'web') {
                window.alert('Type Confirmation Required\n\n' + message);
            } else {
                Alert.alert('Type Confirmation Required', message);
            }
            return;
        }
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

    // Set up header refresh button
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => {
                        console.log('🔄 Header refresh button pressed');
                        refreshQurbaniData();
                    }}
                    style={{ paddingRight: 16 }}
                >
                    <Ionicons name="refresh" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

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
                let title = 'Connection Issue';
                let message = 'Could not refresh data. Navigating with cached information.';

                // Check for network errors
                if (error.message?.includes('Network') || error.message?.includes('network') ||
                    error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
                    title = 'Connection Failed';
                    message = 'Cannot connect to server. Please check your internet connection and try again.';

                    if (Platform.OS === 'web') {
                        window.alert(title + '\n\n' + message);
                    } else {
                        Alert.alert(title, message, [{ text: 'OK' }]);
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
                {/* Only show for individual users - group representatives manage from family members section */}
                {isIndividual && (
                    <>
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
                            userName={user?.name || 'User'}
                            allowTypeSelection={qurbaniData?.status === STATUS_TYPES.PENDING}
                            isTypeSelected={isTypeConfirmed}
                            onTypeToggle={handleTypeToggle}
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
                                        : 'Tick the checkbox to confirm your Qurbani type. Proceed for qurbani once you are ready.\n\nجب آپ تیار ہوں تو قربانی کے عمل کے لیے آگے بڑھیں'
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
                    </>
                )}




                {/* ================= HISTORY / FAMILY MEMBERS ================= */}
                {user?.accountType === 'group' && groupMembers.length > 0 ? (
                    <View style={styles.membersSection}>
                        <View style={styles.membersSectionHeader}>
                            <Text style={styles.membersSectionTitle}>Family Members</Text>
                            {selectedMembers.length > 0 && (
                                <Text style={styles.selectedCount}>
                                    {selectedMembers.length} Selected
                                </Text>
                            )}
                        </View>

                        {groupMembers.map((member) => {
                            const memberStatus = member.qurbaniStatus || member.status;
                            const isPending = memberStatus === STATUS_TYPES.PENDING || memberStatus === 'pending';
                            const isSelected = selectedMembers.includes(member.id);
                            const isRepresentative = member.isRepresentative;

                            return (
                                <View key={member.id} style={styles.memberCardWrapper}>
                                    <QurbaniStatusCard
                                        status={
                                            memberStatus === 'done'
                                                ? 'Qurbani Completed'
                                                : memberStatus === 'ready'
                                                    ? 'Requested for Qurbani'
                                                    : 'Pending'
                                        }
                                        waitTime="0h 0m"
                                        qurbaniType={
                                            QURBANI_TYPE_LABELS[member.qurbaniType] ||
                                            member.qurbaniType ||
                                            'Not Set'
                                        }
                                        userName={`${member.name}${isRepresentative ? ' (You)' : ''}`}
                                        allowTypeSelection={isPending}
                                        isTypeSelected={isSelected}
                                        onTypeToggle={() => toggleMemberSelection(member.id)}
                                        statusColor={
                                            memberStatus === 'done'
                                                ? '#4CAF50'
                                                : memberStatus === 'ready'
                                                    ? '#E67E22'
                                                    : '#FF9800'
                                        }
                                        description={
                                            memberStatus === 'done'
                                                ? '🎉 Qurbani has been completed.'
                                                : memberStatus === 'ready'
                                                    ? 'Qurbani request is received.'
                                                    : isPending
                                                        ? 'Tick to select for Qurbani. Proceed for qurbani once you are ready.\n\nجب آپ تیار ہوں تو قربانی کے عمل کے لیے آگے بڑھیں'
                                                        : 'Status pending.'
                                        }
                                    />
                                </View>
                            );
                        })}
                    </View>
                ) : (
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
                            highlight={qurbaniData?.status === 'ready'}
                        />
                    </View>
                )}

                {/* Floating Action Button for Group Members */}
                {user?.accountType === 'group' && selectedMembers.length > 0 && (
                    <TouchableOpacity
                        style={styles.floatingButton}
                        onPress={handleProcessSelectedMembers}
                        disabled={isProcessingMembers}
                        activeOpacity={0.8}
                    >
                        <View style={styles.fabContent}>
                            {isProcessingMembers ? (
                                <>
                                    <Text style={styles.fabText}>Processing...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="checkmark-done" size={24} color="#fff" />
                                    <Text style={styles.fabText}>
                                        Procced for Qurbani ({selectedMembers.length})
                                    </Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                )}

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

    /* MEMBERS SECTION */
    membersSection: {
        marginTop: 10,
        paddingBottom: 100, // Extra padding for floating button
    },

    membersSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    membersSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },

    selectedCount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2e8b57',
        backgroundColor: '#2e8b5720',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },

    memberCardWrapper: {
        marginBottom: 10,
    },

    /* FLOATING BUTTON */
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#2e8b57',
        borderRadius: 30,
        paddingVertical: 16,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
    },

    fabContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },

    fabText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default DashboardScreen;