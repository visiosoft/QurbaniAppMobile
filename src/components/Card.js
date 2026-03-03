import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/constants';
import StatusBadge from './StatusBadge';

/**
 * Card Component
 * Reusable card container for displaying information
 * @param {ReactNode} children - Card content
 * @param {string} title - Card title (optional)
 * @param {function} onPress - Press handler (makes card touchable)
 * @param {object} style - Additional styles
 */
const Card = ({ children, title, onPress, style }) => {
    const CardContainer = onPress ? TouchableOpacity : View;

    return (
        <CardContainer
            style={[styles.card, style]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {title && <Text style={styles.cardTitle}>{title}</Text>}
            {children}
        </CardContainer>
    );
};

/**
 * Info Row Component
 * Displays label-value pairs
 */
export const InfoRow = ({ label, value, valueColor }) => (
    <View style={styles.infoRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, valueColor && { color: valueColor }]}>
            {value}
        </Text>
    </View>
);

/**
 * Member Card Component
 * Displays member information with status
 */
export const MemberCard = ({ member, onPress, onMarkReady, isDisabled }) => (
    <Card style={styles.memberCard} onPress={onPress}>
        <View style={styles.memberHeader}>
            <Text style={styles.memberName}>{member.name}</Text>
            <StatusBadge status={member.status} size="small" />
        </View>

        <InfoRow label="Passport No." value={member.passportNumber} />
        <InfoRow label="Phone" value={member.phoneNumber} />
        <InfoRow label="Qurbani Type" value={member.qurbaniType} />

        {member.status === 'pending' && onMarkReady && (
            <TouchableOpacity
                style={[
                    styles.markReadyButton,
                    isDisabled && styles.markReadyButtonDisabled,
                ]}
                onPress={() => onMarkReady(member._id)}
                disabled={isDisabled}
            >
                <Text
                    style={[
                        styles.markReadyButtonText,
                        isDisabled && styles.markReadyButtonTextDisabled,
                    ]}
                >
                    Mark as Ready
                </Text>
            </TouchableOpacity>
        )}
    </Card>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    cardTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    value: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    memberCard: {
        marginHorizontal: SPACING.md,
    },
    memberHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    memberName: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        flex: 1,
    },
    markReadyButton: {
        marginTop: SPACING.md,
        backgroundColor: COLORS.ready,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    markReadyButtonDisabled: {
        backgroundColor: COLORS.border,
    },
    markReadyButtonText: {
        color: COLORS.textLight,
        fontWeight: '600',
        fontSize: FONT_SIZES.sm,
    },
    markReadyButtonTextDisabled: {
        color: COLORS.textSecondary,
    },
});

export default Card;
