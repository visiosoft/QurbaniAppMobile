import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
        <Animated.View style={[{ opacity: fadeAnim }, styles.containerWrapper]}>
            <LinearGradient
                colors={['#FFF9E6', '#F3EDFF', '#E8FFF0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
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
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    containerWrapper: {
        marginHorizontal: 20,
        marginVertical: 8,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    container: {
        borderRadius: 16,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1C1C1E',
        letterSpacing: -0.3,
        textAlign: 'center',
        marginBottom: 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statusText: {
        fontSize: 20,
        fontWeight: '600',
        flex: 1,
        letterSpacing: -0.3,
    },
    description: {
        fontSize: 15,
        color: '#6E6E73',
        marginTop: 8,
        marginBottom: 8,
        lineHeight: 22,
    },
    waitTime: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1C1C1E',
        marginTop: 8,
    },
    divider: {
        height: 0.5,
        backgroundColor: '#E5E5EA',
        marginVertical: 14,
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
        width: 0.5,
        height: 50,
        backgroundColor: '#E5E5EA',
        marginHorizontal: 16,
    },
    label: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 6,
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1C1C1E',
        marginTop: 4,
        letterSpacing: -0.3,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#C9A961',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxSelected: {
        backgroundColor: '#C9A961',
        borderColor: '#C9A961',
    },
    checkboxLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1C1C1E',
        flexShrink: 1,
        letterSpacing: -0.2,
    },
});

export default QurbaniStatusCard;
