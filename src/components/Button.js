import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../config/constants';

/**
 * Custom Button Component
 * @param {string} title - Button text
 * @param {function} onPress - Press handler
 * @param {string} variant - 'primary', 'secondary', 'outline', 'danger'
 * @param {boolean} disabled - Disabled state
 * @param {boolean} loading - Loading state
 * @param {object} style - Additional styles
 */
const Button = ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
    icon,
}) => {
    const getBackgroundColor = () => {
        if (disabled) return COLORS.border;

        switch (variant) {
            case 'primary':
                return COLORS.primary;
            case 'secondary':
                return COLORS.primaryLight;
            case 'outline':
                return 'transparent';
            case 'danger':
                return COLORS.error;
            default:
                return COLORS.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return COLORS.textSecondary;
        return variant === 'outline' ? COLORS.primary : COLORS.textLight;
    };

    const getBorderStyle = () => {
        if (variant === 'outline') {
            return {
                borderWidth: 2,
                borderColor: disabled ? COLORS.border : COLORS.primary,
            };
        }
        return {};
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: getBackgroundColor() },
                getBorderStyle(),
                pressed && !disabled && !loading && { opacity: 0.7 },
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <View style={styles.buttonContent}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[styles.buttonText, { color: getTextColor() }]}>
                        {title}
                    </Text>
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        cursor: 'pointer',
        userSelect: 'none',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
    iconContainer: {
        marginRight: SPACING.sm,
    },
});

export default Button;
