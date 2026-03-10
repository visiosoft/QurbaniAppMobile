import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * HajjDayCard Component
 * Displays a single day of Hajj with expandable details
 * 
 * @param {number} dayNumber - Day number (0-6)
 * @param {string} title - Day title
 * @param {string} arabicDate - Arabic date (e.g., "8 Dhul-Hijjah")
 * @param {string} location - Location name
 * @param {string} icon - Ionicons name
 * @param {array} steps - Array of step strings
 * @param {string} description - Additional description
 * @param {string} talbiyah - Talbiyah text for Day 0
 */
const HajjDayCard = ({
    dayNumber,
    title,
    arabicDate,
    location,
    icon = 'location',
    steps = [],
    description,
    talbiyah,
}) => {
    const [expanded, setExpanded] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current;

    const toggleExpand = () => {
        const toValue = expanded ? 0 : 1;
        Animated.spring(animatedHeight, {
            toValue,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
        }).start();
        setExpanded(!expanded);
    };

    const contentHeight = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 600], // Max height for content
    });

    return (
        <View style={styles.cardContainer}>
            {/* Timeline Dot */}
            <View style={styles.timelineContainer}>
                <View style={styles.timelineDot}>
                    <Text style={styles.dayNumberText}>{dayNumber}</Text>
                </View>
                <View style={styles.timelineLine} />
            </View>

            {/* Card Content */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={toggleExpand}
                style={styles.cardWrapper}
            >
                <LinearGradient
                    colors={['#FFF9E6', '#F3EDFF', '#E8FFF0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                        <View style={styles.iconCircle}>
                            <Ionicons name={icon} size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.cardTitle}>{title}</Text>
                            {arabicDate && (
                                <Text style={styles.arabicDate}>{arabicDate}</Text>
                            )}
                            {location && (
                                <View style={styles.locationRow}>
                                    <Ionicons name="location-outline" size={14} color="#C9A961" />
                                    <Text style={styles.locationText}>{location}</Text>
                                </View>
                            )}
                        </View>
                        <Ionicons
                            name={expanded ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color="#2E7D32"
                        />
                    </View>

                    {/* Expandable Content */}
                    <Animated.View
                        style={[
                            styles.expandableContent,
                            { maxHeight: contentHeight, opacity: animatedHeight },
                        ]}
                    >
                        {description && (
                            <Text style={styles.description}>{description}</Text>
                        )}

                        {/* Talbiyah for Day 0 */}
                        {talbiyah && (
                            <View style={styles.talbiyahContainer}>
                                <Text style={styles.talbiyahTitle}>Talbiyah:</Text>
                                <Text style={styles.talbiyahText}>{talbiyah}</Text>
                            </View>
                        )}

                        {/* Steps */}
                        {steps.length > 0 && (
                            <View style={styles.stepsContainer}>
                                <Text style={styles.stepsTitle}>Steps:</Text>
                                {steps.map((step, index) => (
                                    <View key={index} style={styles.stepRow}>
                                        <View style={styles.stepBullet} />
                                        <Text style={styles.stepText}>{step}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Animated.View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timelineContainer: {
        width: 60,
        alignItems: 'center',
    },
    timelineDot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#C9A961',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    dayNumberText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    timelineLine: {
        width: 3,
        flex: 1,
        backgroundColor: '#C9A961',
        marginTop: 8,
        opacity: 0.4,
    },
    cardWrapper: {
        flex: 1,
        marginLeft: 12,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    arabicDate: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 4,
        fontWeight: '500',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    locationText: {
        fontSize: 12,
        color: '#C9A961',
        marginLeft: 4,
        fontWeight: '600',
    },
    expandableContent: {
        overflow: 'hidden',
        marginTop: 16,
    },
    description: {
        fontSize: 14,
        color: '#6E6E73',
        lineHeight: 22,
        marginBottom: 12,
    },
    talbiyahContainer: {
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#C9A961',
        marginBottom: 16,
    },
    talbiyahTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2E7D32',
        marginBottom: 8,
    },
    talbiyahText: {
        fontSize: 16,
        color: '#1C1C1E',
        lineHeight: 28,
        textAlign: 'right',
        fontWeight: '500',
    },
    stepsContainer: {
        marginTop: 8,
    },
    stepsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2E7D32',
        marginBottom: 12,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    stepBullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#C9A961',
        marginTop: 6,
        marginRight: 12,
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        color: '#1C1C1E',
        lineHeight: 22,
    },
});

export default HajjDayCard;
