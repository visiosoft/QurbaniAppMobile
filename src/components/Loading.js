import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS, FONT_SIZES } from '../config/constants';

/**
 * Loading Component
 * Full screen loading indicator
 * @param {string} message - Loading message (optional)
 */
const Loading = ({ message }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    message: {
        marginTop: 16,
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
    },
});

export default Loading;
