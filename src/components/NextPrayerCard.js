import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTimeRemaining } from '../services/prayerService';

/**
 * Next Prayer Card Component
 * Displays countdown to next prayer with live timer
 * 
 * @param {string} prayerName - Name of the next prayer
 * @param {Date} prayerTime - Time of the next prayer
 */
const NextPrayerCard = ({ prayerName, prayerTime }) => {
    const [timeRemaining, setTimeRemaining] = useState('00:00:00');

    useEffect(() => {
        // Update countdown immediately
        if (prayerTime) {
            setTimeRemaining(getTimeRemaining(prayerTime));
        }

        // Update every second
        const interval = setInterval(() => {
            if (prayerTime) {
                setTimeRemaining(getTimeRemaining(prayerTime));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [prayerTime]);

    if (!prayerName || !prayerTime) {
        return null;
    }

    // Capitalize prayer name
    const displayName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="time-outline" size={24} color="#1F7A4C" />
                <Text style={styles.headerText}>Next Prayer</Text>
            </View>

            {/* Prayer Name */}
            <Text style={styles.prayerName}>{displayName}</Text>

            {/* Countdown */}
            <View style={styles.countdownContainer}>
                <Text style={styles.countdown}>{timeRemaining}</Text>
                <Text style={styles.remainingLabel}>remaining</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Info */}
            <View style={styles.infoRow}>
                <Ionicons name="notifications-outline" size={18} color="#666" />
                <Text style={styles.infoText}>
                    Stay prepared for the next prayer
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 16,
        marginVertical: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderLeftWidth: 5,
        borderLeftColor: '#1F7A4C',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginLeft: 8,
    },
    prayerName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F7A4C',
        marginBottom: 16,
    },
    countdownContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 16,
    },
    countdown: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#333',
        fontVariant: ['tabular-nums'],
    },
    remainingLabel: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        fontStyle: 'italic',
    },
});

export default NextPrayerCard;
