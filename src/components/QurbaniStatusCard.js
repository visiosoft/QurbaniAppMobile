import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Qurbani Status Card Component
 * Displays the current qurbani status with detailed information
 * 
 * @param {string} status - Status text (e.g., "Requested", "Pending", "Completed")
 * @param {string} waitTime - Estimated wait time (e.g., "5h 13m")
 * @param {string} qurbaniType - Type of qurbani (e.g., "Sheep", "Cow", "Camel")
 * @param {string} userName - User's name to display
 * @param {string} statusColor - Color for the status (default: #E67E22)
 * @param {string} description - Description text below status
 * @param {boolean} isTypeSelected - Whether qurbani type is selected/confirmed
 * @param {function} onTypeToggle - Callback when checkbox is toggled
 * @param {boolean} allowTypeSelection - Whether to show type selection checkbox
 */
const QurbaniStatusCard = ({
    status = 'Pending',
    waitTime = '0h 0m',
    qurbaniType = 'Sheep',
    userName = 'User',
    statusColor = '#E67E22',
    description = 'Your Qurbani request is received.',
    isTypeSelected = false,
    onTypeToggle = null,
    allowTypeSelection = false,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // Get icon and color based on status
    const getStatusIcon = () => {
        switch (status.toLowerCase()) {
            case 'requested for qurbani':
            case 'requested':
            case 'ready':
                return { icon: 'alert-circle', color: '#FFA726' };
            case 'qurbani completed':
            case 'completed':
            case 'done':
                return { icon: 'checkmark-circle', color: '#4CAF50' };
            case 'pending':
            default:
                return { icon: 'time-outline', color: '#FF9800' };
        }
    };

    const { icon, color } = getStatusIcon();

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Title */}
            <Text style={styles.title}>Qurbani Status</Text>

            {/* Status Section */}
            <View style={styles.statusRow}>
                <View style={[styles.iconContainer, { backgroundColor: color }]}>
                    <Ionicons name={icon} size={24} color="#fff" />
                </View>
                <Text style={[styles.statusText, { color: statusColor }]}>
                    {status}
                </Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>{description}</Text>

            {/* Wait Time */}
            {waitTime && waitTime !== '0h 0m' && (
                <Text style={styles.waitTime}>
                    Estimated wait before completion: {waitTime}
                </Text>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Bottom Info Section */}
            <View style={styles.bottomRow}>
                {/* Type Column with Checkbox */}
                <View style={styles.column}>
                    <Text style={styles.label}>{allowTypeSelection ? 'Action' : 'Type'}</Text>
                    {allowTypeSelection ? (
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={onTypeToggle}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, isTypeSelected && styles.checkboxSelected]}>
                                {isTypeSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
                            </View>
                            <Text style={styles.checkboxLabel}>Mark for Qurbani</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.value}>{qurbaniType}</Text>
                    )}
                </View>

                {/* Vertical Divider */}
                <View style={styles.verticalDivider} />

                {/* Name Column */}
                <View style={styles.column}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{userName}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        backgroundColor: '#F6E2A6',
        padding: 20,
        marginHorizontal: 16,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 15,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statusText: {
        fontSize: 22,
        fontWeight: 'bold',
        flex: 1,
    },
    description: {
        fontSize: 16,
        color: '#555',
        marginTop: 8,
        marginBottom: 4,
    },
    waitTime: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginTop: 6,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5D3A5',
        marginVertical: 16,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    column: {
        flex: 1,
        alignItems: 'center',
    },
    verticalDivider: {
        width: 1,
        height: 50,
        backgroundColor: '#E5D3A5',
        marginHorizontal: 10,
    },
    label: {
        fontSize: 14,
        color: '#777',
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#777',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    checkboxSelected: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        flexShrink: 1,
    },
});

export default QurbaniStatusCard;
