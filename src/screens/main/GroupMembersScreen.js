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
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import groupService from '../../services/groupService';
import { MemberCard } from '../../components/Card';
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
    const [markingMemberId, setMarkingMemberId] = useState(null);
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
                if (refreshError.message?.includes('Network') || refreshError.message?.includes('network')) {
                    const errorMessage = 'No Internet Connection\n\nPlease check your internet connection and try again.';
                    if (Platform.OS === 'web') {
                        window.alert(errorMessage);
                    } else {
                        Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
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

            // Check for network errors
            if (error.message?.includes('Network') || error.message?.includes('network')) {
                const errorMessage = 'No Internet Connection\n\nPlease check your internet connection and try again.';
                if (Platform.OS === 'web') {
                    window.alert(errorMessage);
                } else {
                    Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
                }
            } else {
                const errorMessage = error.message || 'Failed to load group members. Please try again.';
                if (Platform.OS === 'web') {
                    window.alert('Error: ' + errorMessage);
                } else {
                    Alert.alert('Error', errorMessage);
                }
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
     * Mark member as ready
     */
    const handleMarkMemberReady = async (memberId) => {
        // Validate capacity before marking
        if (!canMarkMoreReady()) {
            const qurbaniType = user?.qurbaniType;
            const maxAllowed = MAX_MEMBERS_PER_ANIMAL[qurbaniType];

            const message = `Maximum ${maxAllowed} member(s) allowed for ${QURBANI_TYPE_LABELS[qurbaniType]}. You have already marked the maximum number of members as ready.`;
            if (Platform.OS === 'web') {
                window.alert('Capacity Reached\n\n' + message);
            } else {
                Alert.alert('Capacity Reached', message);
            }
            return;
        }

        // Find member details
        const member = members.find((m) => m.id === memberId);

        const confirmMessage = `Mark ${member?.name}'s Qurbani as ready?`;

        if (Platform.OS === 'web') {
            const confirmed = window.confirm(confirmMessage);
            if (!confirmed) return;

            try {
                setMarkingMemberId(memberId);
                await groupService.markMemberReady(memberId);
                window.alert(`Success!\n\n${member?.name}'s Qurbani has been marked as ready!`);
                // Force refresh to get updated status
                await fetchMembers(false);
            } catch (error) {
                console.error('Error marking member ready:', error);
                window.alert('Error: ' + (error.message || 'Failed to mark member as ready.'));
            } finally {
                setMarkingMemberId(null);
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
                                setMarkingMemberId(memberId);
                                await groupService.markMemberReady(memberId);
                                // Force refresh to get updated status
                                await fetchMembers(false);
                                Alert.alert(
                                    'Success',
                                    `${member?.name}'s Qurbani has been marked as ready!`
                                );
                            } catch (error) {
                                console.error('Error marking member ready:', error);
                                Alert.alert('Error', error.message || 'Failed to mark member as ready.');
                            } finally {
                                setMarkingMemberId(null);
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
                    <Text style={styles.summaryLabel}>Qurbani Type:</Text>
                    <Text style={styles.summaryValue}>
                        {QURBANI_TYPE_LABELS[user?.qurbaniType]}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Members Ready:</Text>
                    <Text
                        style={[
                            styles.summaryValue,
                            { color: currentReady >= maxAllowed ? COLORS.done : COLORS.ready },
                        ]}
                    >
                        {currentReady} / {maxAllowed}
                    </Text>
                </View>

                {!canMarkMore && (
                    <View style={styles.warningBanner}>
                        <Text style={styles.warningText}>
                            ⚠️ Maximum capacity reached for {QURBANI_TYPE_LABELS[user?.qurbaniType]}
                        </Text>
                    </View>
                )}
            </View>

            {/* Members List */}
            <FlatList
                data={members}
                extraData={members} // Force re-render when members data changes
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    console.log(`🎴 Rendering member card: ${item.name}, qurbaniStatus: ${item.qurbaniStatus}, status: ${item.status}`);
                    return (
                        <MemberCard
                            member={item}
                            onMarkReady={handleMarkMemberReady}
                            isDisabled={!canMarkMore && (item.qurbaniStatus === STATUS_TYPES.PENDING || item.status === STATUS_TYPES.PENDING)}
                        />
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
                    <Text style={styles.listHeader}>
                        Total Members: {members.length}
                    </Text>
                }
            />
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
        paddingBottom: SPACING.lg,
    },
    listHeader: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
});

export default GroupMembersScreen;
