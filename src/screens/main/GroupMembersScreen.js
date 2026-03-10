import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
    RefreshControl,
    Alert,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import groupService from '../../services/groupService';
import QurbaniStatusCard from '../../components/QurbaniStatusCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import {
    COLORS,
    SPACING,
    FONT_SIZES,
    MAX_MEMBERS_PER_ANIMAL,
    STATUS_TYPES,
    QURBANI_TYPE_LABELS,
} from '../../config/constants';

/**
 * Group Members Screen
 * Displays and manages group members for group representatives
 */
const GroupMembersScreen = () => {
    const { user, refreshUser } = useAuth();
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const hasMountedRef = useRef(false);

    /**
     * Fetch group members from API
     */
    const fetchMembers = async (showLoader = true) => {
        try {
            console.log('🔄 Starting fetchMembers...');
            if (showLoader) {
                setIsLoading(true);
            } else {
                setIsRefreshing(true);
            }

            // First, refresh user data to ensure we have latest groupId
            console.log('👤 Refreshing user data...');
            try {
                await refreshUser();
                console.log('✅ User refreshed, current user:', user?.name, 'accountType:', user?.accountType);
            } catch (refreshError) {
                console.log('⚠️ Could not refresh user:', refreshError);
                // Check for network errors
                if (refreshError.message?.includes('Network') || refreshError.message?.includes('network') ||
                    refreshError.message?.includes('timeout') || refreshError.message?.includes('ECONNREFUSED')) {
                    const errorMessage = 'Unable to Connect to Server\n\nThe app cannot reach the server. Please check:\n\n• Your internet connection is active\n• WiFi or mobile data is turned on\n• The server is running and accessible\n• Your network allows the connection';
                    if (Platform.OS === 'web') {
                        window.alert(errorMessage);
                    } else {
                        Alert.alert(
                            'Connection Failed',
                            'The app cannot reach the server. Please check:\n\n• Your internet connection is active\n• WiFi or mobile data is turned on\n• The server is running and accessible\n• Your network allows the connection'
                        );
                    }
                    return; // Stop execution if no internet
                }
            }

            // API call to get group members
            console.log('📡 Calling groupService.getMembers()...');
            const data = await groupService.getMembers();
            console.log('✅ Group members fetched:', data.members?.length || 0, 'members');
            console.log('📋 Full API response:', JSON.stringify(data, null, 2));
            console.log('⏰ Data fetched at:', new Date().toLocaleTimeString());
            setMembers(data.members || []);
        } catch (error) {
            console.error('❌ Error fetching members:', error);
            console.error('❌ Error details:', error.message, error.stack);

            let title = 'Error';
            let message = '';

            // Check for different types of errors
            if (error.message?.includes('Network') || error.message?.includes('network')) {
                title = 'Connection Failed';
                message = 'Cannot connect to the server. Please ensure:\n\n• You have an active internet connection\n• WiFi or mobile data is enabled\n• The server is online and reachable\n\nTry pulling down to refresh once connected.';
            } else if (error.message?.includes('timeout')) {
                title = 'Request Timeout';
                message = 'The server is taking too long to respond. This could be due to:\n\n• Slow internet connection\n• Server is busy or overloaded\n• Network congestion\n\nPlease try again in a moment.';
            } else if (error.message?.includes('ECONNREFUSED')) {
                title = 'Server Unavailable';
                message = 'Cannot reach the server. Please verify:\n\n• The server is running\n• You are connected to the correct network\n• The server address is correct\n• No firewall is blocking the connection';
            } else if (error.response?.status === 401) {
                title = 'Authentication Failed';
                message = 'Your session has expired. Please log out and log in again.';
            } else if (error.response?.status === 403) {
                title = 'Access Denied';
                message = 'You do not have permission to view group members. Please contact your administrator.';
            } else if (error.response?.status >= 500) {
                title = 'Server Error';
                message = 'The server encountered an error. Please try again later or contact support if the problem persists.';
            } else {
                message = error.message || 'Failed to load group members. Please pull down to refresh and try again.';
            }

            if (Platform.OS === 'web') {
                window.alert(title + '\n\n' + message);
            } else {
                Alert.alert(title, message);
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    /**
     * Handle pull-to-refresh
     */
    const onRefresh = () => {
        console.log('🔄 Pull-to-refresh triggered');
        setIsRefreshing(true);
        fetchMembers(false);
    };

    /**
     * Calculate current ready count for validation
     */
    const getCurrentReadyCount = () => {
        const readyMembers = members.filter(
            (member) => member.qurbaniStatus === STATUS_TYPES.READY || member.qurbaniStatus === STATUS_TYPES.DONE
        );
        console.log('📊 getCurrentReadyCount:', readyMembers.length, 'ready out of', members.length, 'total');
        return readyMembers.length;
    };

    /**
     * Check if can mark more members as ready based on animal type capacity
     */
    const canMarkMoreReady = () => {
        const qurbaniType = user?.qurbaniType;
        const maxAllowed = MAX_MEMBERS_PER_ANIMAL[qurbaniType];
        const currentReady = getCurrentReadyCount();

        return currentReady < maxAllowed;
    };

    /**
     * Toggle member selection
     */
    const toggleMemberSelection = (memberId) => {
        setSelectedMembers((prev) => {
            if (prev.includes(memberId)) {
                return prev.filter((id) => id !== memberId);
            } else {
                // Check if we can add more
                const currentReady = getCurrentReadyCount();
                const maxAllowed = MAX_MEMBERS_PER_ANIMAL[user?.qurbaniType];
                const wouldExceed = currentReady + prev.length + 1 > maxAllowed;

                if (wouldExceed) {
                    const message = `Maximum ${maxAllowed} member(s) allowed for ${QURBANI_TYPE_LABELS[user?.qurbaniType]}. You can only select ${maxAllowed - currentReady} more member(s).`;
                    if (Platform.OS === 'web') {
                        window.alert('Selection Limit Reached\n\n' + message);
                    } else {
                        Alert.alert('Selection Limit Reached', message);
                    }
                    return prev;
                }
                return [...prev, memberId];
            }
        });
    };

    /**
     * Process selected members (mark multiple as ready)
     */
    const handleProcessSelected = async () => {
        if (selectedMembers.length === 0) {
            const message = 'Please select at least one member to proceed.';
            if (Platform.OS === 'web') {
                window.alert('No Selection\n\n' + message);
            } else {
                Alert.alert('No Selection', message);
            }
            return;
        }

        const selectedNames = members
            .filter((m) => selectedMembers.includes(m.id))
            .map((m) => m.name)
            .join(', ');

        const confirmMessage = `Proceed with Qurbani for ${selectedMembers.length} member(s)?\n\n${selectedNames}`;

        if (Platform.OS === 'web') {
            const confirmed = window.confirm(confirmMessage);
            if (!confirmed) return;

            try {
                setIsProcessing(true);

                // Process each selected member
                for (const memberId of selectedMembers) {
                    await groupService.markMemberReady(memberId);
                }

                window.alert(`Success!\n\n${selectedMembers.length} member(s) marked as ready for Qurbani!`);
                setSelectedMembers([]);
                await fetchMembers(false);
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
                setIsProcessing(false);
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
                                setIsProcessing(true);

                                // Process each selected member
                                for (const memberId of selectedMembers) {
                                    await groupService.markMemberReady(memberId);
                                }

                                Alert.alert(
                                    'Success',
                                    `${selectedMembers.length} member(s) marked as ready for Qurbani!`
                                );
                                setSelectedMembers([]);
                                await fetchMembers(false);
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
                                setIsProcessing(false);
                            }
                        },
                    },
                ]
            );
        }
    };

    useEffect(() => {
        console.log('🎬 GroupMembersScreen mounted - fetching members');
        hasMountedRef.current = true;
        fetchMembers();
    }, []);

    // Refresh members when screen comes into focus (navigation from tabs or back button)
    useFocusEffect(
        useCallback(() => {
            // Only refresh on subsequent focuses (not initial mount)
            if (hasMountedRef.current) {
                console.log('👁️ GroupMembersScreen focused - refreshing members');
                fetchMembers(false);
            }
            return () => {
                console.log('👋 GroupMembersScreen unfocused');
            };
        }, []) // Empty dependency array - refresh on every focus
    );

    if (isLoading) {
        return <Loading message="Loading group members..." />;
    }

    if (members.length === 0) {
        return (
            <ScrollView
                contentContainerStyle={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                        title="Pull to refresh"
                    />
                }
            >
                <EmptyState
                    icon="people-outline"
                    title="No Members Found"
                    message="Your group doesn't have any members yet. Pull down to refresh."
                />
            </ScrollView>
        );
    }

    const currentReady = getCurrentReadyCount();
    const maxAllowed = MAX_MEMBERS_PER_ANIMAL[user?.qurbaniType];
    const canMarkMore = canMarkMoreReady();

    console.log('📊 Summary Stats:');
    console.log('   - User Qurbani Type:', user?.qurbaniType);
    console.log('   - Max Allowed:', maxAllowed);
    console.log('   - Current Ready:', currentReady);
    console.log('   - Can Mark More:', canMarkMore);
    console.log('   - Total Members:', members.length);

    return (
        <View style={styles.container}>
            {/* Summary Header */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { textAlign: 'center', width: '100%', fontSize: 17, fontWeight: 'bold', lineHeight: 28 }]}>
                        لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ
                    </Text>
                </View>

            </View>

            {/* Members List */}
            <FlatList
                data={members}
                extraData={[members, selectedMembers]} // Force re-render when members or selections change
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const memberStatus = item.qurbaniStatus || item.status;
                    const isPending = memberStatus === STATUS_TYPES.PENDING;
                    const isSelected = selectedMembers.includes(item.id);

                    console.log(`🎴 Rendering member: ${item.name}, status: ${memberStatus}, selected: ${isSelected}`);

                    return (
                        <View style={styles.cardWrapper}>
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
                                    QURBANI_TYPE_LABELS[item.qurbaniType] ||
                                    item.qurbaniType ||
                                    'Not Set'
                                }
                                userName={item.name}
                                allowTypeSelection={isPending}
                                isTypeSelected={isSelected}
                                onTypeToggle={() => toggleMemberSelection(item.id)}
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
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                        title="Pull to refresh members"
                        titleColor={COLORS.textSecondary}
                    />
                }
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <Text style={styles.listHeader}>
                            Total Members: {members.length}
                        </Text>
                        {selectedMembers.length > 0 && (
                            <Text style={styles.selectedCount}>
                                {selectedMembers.length} Selected
                            </Text>
                        )}
                    </View>
                }
            />

            {/* Floating Action Button */}
            {selectedMembers.length > 0 && (
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={handleProcessSelected}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                >
                    <View style={styles.fabContent}>
                        {isProcessing ? (
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    summaryCard: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        marginHorizontal: SPACING.md,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    summaryLabel: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
    warningBanner: {
        backgroundColor: `${COLORS.warning}20`,
        borderColor: COLORS.warning,
        borderWidth: 1,
        borderRadius: 8,
        padding: SPACING.sm,
        marginTop: SPACING.sm,
    },
    warningText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.warning,
        fontWeight: '600',
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 100, // Extra padding for floating button
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    listHeader: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    selectedCount: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.primary,
        backgroundColor: `${COLORS.primary}20`,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    cardWrapper: {
        marginBottom: SPACING.sm,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: COLORS.primary,
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

export default GroupMembersScreen;
