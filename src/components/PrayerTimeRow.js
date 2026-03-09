import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Prayer Time Row Component
 * Displays a single prayer time with icon, name, and time
 * 
 * @param {string} prayerName - Name of the prayer
 * @param {string} time - Formatted time string
 * @param {boolean} isCurrent - Whether this is the current prayer
 * @param {boolean} isNext - Whether this is the next prayer
 */
const PrayerTimeRow = ({ prayerName, time, isCurrent, isNext }) => {
    // Get icon and emoji based on prayer name
    const getPrayerIcon = () => {
        switch (prayerName.toLowerCase()) {
            case 'fajr':
                return { name: 'moon', emoji: '🌙' };
            case 'sunrise':
                return { name: 'sunny', emoji: '🌅' };
            case 'dhuhr':
                return { name: 'sunny-outline', emoji: '☀️' };
            case 'asr':
                return { name: 'partly-sunny', emoji: '🌤' };
            case 'maghrib':
                return { name: 'sunset', emoji: '🌇' };
            case 'isha':
                return { name: 'moon-outline', emoji: '🌙' };
            default:
                return { name: 'time', emoji: '🕌' };
        }
    };

    const { name: iconName, emoji } = getPrayerIcon();
    
    // Capitalize prayer name
    const displayName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);

    return (
        <View style={[
            styles.container,
            isCurrent && styles.currentContainer,
            isNext && styles.nextContainer,
        ]}>
            <View style={styles.leftSection}>
                {/* Icon */}
                <View style={[
                    styles.iconContainer,
                    isCurrent && styles.currentIconContainer,
                    isNext && styles.nextIconContainer,
                ]}>
                    <Ionicons 
                        name={iconName} 
                        size={24} 
                        color={isCurrent ? '#1F7A4C' : isNext ? '#2ecc71' : '#666'} 
                    />
                </View>
                
                {/* Prayer Name */}
                <Text style={[
                    styles.prayerName,
                    isCurrent && styles.currentText,
                    isNext && styles.nextText,
                ]}>
                    {displayName}
                </Text>
            </View>

            {/* Time */}
            <Text style={[
                styles.time,
                isCurrent && styles.currentText,
                isNext && styles.nextText,
            ]}>
                {time}
            </Text>

            {/* Current/Next Badge */}
            {isCurrent && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Now</Text>
                </View>
            )}
            {isNext && !isCurrent && (
                <View style={[styles.badge, styles.nextBadge]}>
                    <Text style={styles.badgeText}>Next</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    currentContainer: {
        backgroundColor: '#E8F5E9',
        borderLeftWidth: 4,
        borderLeftColor: '#1F7A4C',
        shadowOpacity: 0.1,
        elevation: 4,
    },
    nextContainer: {
        backgroundColor: '#F1F8F4',
        borderLeftWidth: 3,
        borderLeftColor: '#2ecc71',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F6F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    currentIconContainer: {
        backgroundColor: '#C8E6C9',
    },
    nextIconContainer: {
        backgroundColor: '#E8F5E9',
    },
    prayerName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    time: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        marginLeft: 12,
    },
    currentText: {
        fontWeight: 'bold',
        color: '#1F7A4C',
    },
    nextText: {
        fontWeight: '600',
        color: '#2ecc71',
    },
    badge: {
        backgroundColor: '#1F7A4C',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    nextBadge: {
        backgroundColor: '#2ecc71',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
});

export default PrayerTimeRow;
