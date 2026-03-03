import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../config/constants';

/**
 * Empty State Component
 * Displays when there's no data to show
 * @param {string} icon - Ionicon name
 * @param {string} title - Title text
 * @param {string} message - Message text
 * @param {string} actionText - Action button text (optional)
 * @param {function} onAction - Action button handler (optional)
 */
const EmptyState = ({ icon = 'alert-circle-outline', title, message, actionText, onAction }) => {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={64} color={COLORS.textSecondary} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {actionText && onAction && (
                <TouchableOpacity style={styles.actionButton} onPress={onAction}>
                    <Text style={styles.actionButtonText}>{actionText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: SPACING.md,
        textAlign: 'center',
    },
    message: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
        textAlign: 'center',
        lineHeight: 22,
    },
    actionButton: {
        marginTop: SPACING.lg,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: 8,
    },
    actionButtonText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
});

export default EmptyState;
