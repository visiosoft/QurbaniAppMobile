import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, STATUS_TYPES } from '../config/constants';

/**
 * Status Badge Component
 * Displays status with appropriate color coding
 * @param {string} status - 'pending', 'ready', or 'done'
 * @param {string} size - 'small' or 'medium'
 */
const StatusBadge = ({ status, size = 'medium' }) => {
    const getStatusColor = () => {
        switch (status) {
            case STATUS_TYPES.PENDING:
                return COLORS.pending;
            case STATUS_TYPES.READY:
                return COLORS.ready;
            case STATUS_TYPES.DONE:
                return COLORS.done;
            default:
                return COLORS.ready;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case STATUS_TYPES.PENDING:
                return 'Pending';
            case STATUS_TYPES.READY:
                return 'Requested for Qurbani';
            case STATUS_TYPES.DONE:
                return 'Qurbani Completed';
            default:
                return status;
        }
    };

    const isSmall = size === 'small';

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: `${getStatusColor()}20`,
                    borderColor: getStatusColor(),
                    paddingVertical: isSmall ? SPACING.xs : SPACING.sm,
                    paddingHorizontal: isSmall ? SPACING.sm : SPACING.md,
                },
            ]}
        >
            <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
            <Text
                style={[
                    styles.badgeText,
                    {
                        color: getStatusColor(),
                        fontSize: isSmall ? FONT_SIZES.xs : FONT_SIZES.lg,
                    },
                ]}
            >
                {getStatusText()}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.round,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: SPACING.xs,
    },
    badgeText: {
        fontWeight: '600',
    },
});

export default StatusBadge;
