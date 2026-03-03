import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert,
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
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [markingMemberId, setMarkingMemberId] = useState(null);

    /**
     * Fetch group members from API
     */
    const fetchMembers = async (showLoader = true) => {
        try {
            if (showLoader) {
                setIsLoading(true);
            }

            // API call to get group members
            const data = await groupService.getMembers();
            setMembers(data.members || []);
        } catch (error) {
            console.error('Error fetching members:', error);
            const errorMessage = error.message || 'Failed to load group members. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    /**
     * Handle pull-to-refresh
     */
    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchMembers(false);
    }, []);

    /**
     * Calculate current ready count for validation
     */
    const getCurrentReadyCount = () => {
        return members.filter(
            (member) => member.status === STATUS_TYPES.READY || member.status === STATUS_TYPES.DONE
        ).length;
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

            Alert.alert(
                'Capacity Reached',
                `Maximum ${maxAllowed} member(s) allowed for ${QURBANI_TYPE_LABELS[qurbaniType]}. You have already marked the maximum number of members as ready.`
            );
            return;
        }

        // Find member details
        const member = members.find((m) => m._id === memberId);

        Alert.alert(
            'Confirm',
            `Mark ${member?.name}'s Qurbani as ready?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            setMarkingMemberId(memberId);

                            // API call to mark member as ready
                            await groupService.markMemberReady(memberId);

                            Alert.alert(
                                'Success',
                                `${member?.name}'s Qurbani has been marked as ready!`,
                                [{ text: 'OK', onPress: () => fetchMembers(false) }]
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
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    if (isLoading) {
        return <Loading message="Loading group members..." />;
    }

    if (members.length === 0) {
        return (
            <EmptyState
                icon="people-outline"
                title="No Members Found"
                message="Your group doesn't have any members yet."
            />
        );
    }

    const currentReady = getCurrentReadyCount();
    const maxAllowed = MAX_MEMBERS_PER_ANIMAL[user?.qurbaniType];
    const canMarkMore = canMarkMoreReady();

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
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <MemberCard
                        member={item}
                        onMarkReady={handleMarkMemberReady}
                        isDisabled={!canMarkMore && item.status === STATUS_TYPES.PENDING}
                    />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
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
