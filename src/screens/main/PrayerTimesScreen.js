import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Alert,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrayerTimeRow from '../../components/PrayerTimeRow';
import NextPrayerCard from '../../components/NextPrayerCard';
import {
    calculatePrayerTimes,
    getCurrentPrayer,
    getNextPrayer,
    formatTime,
    getIslamicDate,
    CALCULATION_METHODS,
    CALCULATION_METHOD_LABELS,
    MADHABS,
    PRAYER_NAMES,
} from '../../services/prayerService';

/**
 * Prayer Times Screen
 * Displays daily prayer times based on user location
 * Supports different Madhab and calculation methods
 */
const PrayerTimesScreen = () => {
    // Location state
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);

    // Prayer times state
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [currentPrayer, setCurrentPrayer] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);

    // Settings state
    const [madhab, setMadhab] = useState(MADHABS.SHAFI);
    const [calculationMethod, setCalculationMethod] = useState(CALCULATION_METHODS.MUSLIM_WORLD_LEAGUE);
    const [showMadhabMenu, setShowMadhabMenu] = useState(false);
    const [showMethodMenu, setShowMethodMenu] = useState(false);

    // UI state
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [islamicDate, setIslamicDate] = useState('');

    /**
     * Request location permission and get coordinates
     */
    const getLocation = async () => {
        try {
            setIsLoadingLocation(true);
            setLocationError(null);

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setLocationError('Location permission denied');

                // Try to load cached location
                const cachedLocation = await AsyncStorage.getItem('userLocation');
                if (cachedLocation) {
                    const parsed = JSON.parse(cachedLocation);
                    setLocation(parsed);
                    calculateAndSetPrayerTimes(parsed.latitude, parsed.longitude);
                } else {
                    // Default to Makkah coordinates
                    const makkahLocation = { latitude: 21.4225, longitude: 39.8262 };
                    setLocation(makkahLocation);
                    calculateAndSetPrayerTimes(makkahLocation.latitude, makkahLocation.longitude);
                }
                return;
            }

            // Get current location
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const coords = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };

            setLocation(coords);

            // Cache location
            await AsyncStorage.setItem('userLocation', JSON.stringify(coords));

            // Calculate prayer times
            calculateAndSetPrayerTimes(coords.latitude, coords.longitude);

        } catch (error) {
            console.error('Error getting location:', error);
            setLocationError(error.message);

            // Try cached location
            try {
                const cachedLocation = await AsyncStorage.getItem('userLocation');
                if (cachedLocation) {
                    const parsed = JSON.parse(cachedLocation);
                    setLocation(parsed);
                    calculateAndSetPrayerTimes(parsed.latitude, parsed.longitude);
                } else {
                    // Default to Makkah
                    const makkahLocation = { latitude: 21.4225, longitude: 39.8262 };
                    setLocation(makkahLocation);
                    calculateAndSetPrayerTimes(makkahLocation.latitude, makkahLocation.longitude);
                }
            } catch (cacheError) {
                console.error('Error loading cached location:', cacheError);
            }
        } finally {
            setIsLoadingLocation(false);
        }
    };

    /**
     * Calculate prayer times and update state
     */
    const calculateAndSetPrayerTimes = (latitude, longitude) => {
        try {
            const times = calculatePrayerTimes(
                latitude,
                longitude,
                new Date(),
                calculationMethod,
                madhab
            );

            setPrayerTimes(times);

            // Cache prayer times
            AsyncStorage.setItem('prayerTimes', JSON.stringify({
                times,
                calculatedAt: new Date().toISOString(),
            }));

            // Get current and next prayer
            const current = getCurrentPrayer(times);
            const next = getNextPrayer(times);

            setCurrentPrayer(current);
            setNextPrayer(next);

        } catch (error) {
            console.error('Error calculating prayer times:', error);
            if (Platform.OS === 'web') {
                window.alert('Error calculating prayer times. Please try again.');
            } else {
                Alert.alert('Error', 'Failed to calculate prayer times. Please try again.');
            }
        }
    };

    /**
     * Handle madhab change
     */
    const handleMadhabChange = (newMadhab) => {
        setMadhab(newMadhab);
        setShowMadhabMenu(false);

        // Save preference
        AsyncStorage.setItem('madhab', newMadhab);

        // Recalculate
        if (location) {
            calculateAndSetPrayerTimes(location.latitude, location.longitude);
        }
    };

    /**
     * Handle calculation method change
     */
    const handleMethodChange = (newMethod) => {
        setCalculationMethod(newMethod);
        setShowMethodMenu(false);

        // Save preference
        AsyncStorage.setItem('calculationMethod', newMethod);

        // Recalculate
        if (location) {
            calculateAndSetPrayerTimes(location.latitude, location.longitude);
        }
    };

    /**
     * Load saved preferences
     */
    const loadPreferences = async () => {
        try {
            const savedMadhab = await AsyncStorage.getItem('madhab');
            const savedMethod = await AsyncStorage.getItem('calculationMethod');

            if (savedMadhab) setMadhab(savedMadhab);
            if (savedMethod) setCalculationMethod(savedMethod);
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    /**
     * Pull to refresh
     */
    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await getLocation();
        setIsRefreshing(false);
    }, [madhab, calculationMethod]);

    /**
     * Initialize on mount
     */
    useEffect(() => {
        loadPreferences();
        getLocation();
        setIslamicDate(getIslamicDate());

        // Update current/next prayer every minute
        const interval = setInterval(() => {
            if (prayerTimes) {
                setCurrentPrayer(getCurrentPrayer(prayerTimes));
                setNextPrayer(getNextPrayer(prayerTimes));
            }
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    /**
     * Update Islamic date daily
     */
    useEffect(() => {
        const interval = setInterval(() => {
            setIslamicDate(getIslamicDate());
        }, 86400000); // 24 hours

        return () => clearInterval(interval);
    }, []);

    if (isLoadingLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1F7A4C" />
                <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={['#1F7A4C']}
                        tintColor="#1F7A4C"
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Ionicons name="moon" size={32} color="#1F7A4C" />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Prayer Times</Text>
                        <Text style={styles.headerSubtitle}>{islamicDate}</Text>
                    </View>
                </View>

                {/* Location Info */}
                {location && (
                    <View style={styles.locationCard}>
                        <Ionicons name="location" size={18} color="#666" />
                        <Text style={styles.locationText}>
                            {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                        </Text>
                    </View>
                )}

                {locationError && (
                    <View style={styles.warningCard}>
                        <Ionicons name="warning" size={18} color="#f39c12" />
                        <Text style={styles.warningText}>
                            Using default location (Makkah)
                        </Text>
                    </View>
                )}

                {/* Settings Row */}
                <View style={styles.settingsRow}>
                    {/* Madhab Selector */}
                    <View style={styles.selectorContainer}>
                        <Text style={styles.selectorLabel}>Madhab</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowMadhabMenu(!showMadhabMenu)}
                        >
                            <Text style={styles.selectorText}>{madhab}</Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

                        {/* Madhab Dropdown */}
                        {showMadhabMenu && (
                            <View style={styles.dropdown}>
                                {[MADHABS.HANAFI, MADHABS.SHAFI].map((m) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[
                                            styles.dropdownItem,
                                            madhab === m && styles.dropdownItemActive,
                                        ]}
                                        onPress={() => handleMadhabChange(m)}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            madhab === m && styles.dropdownItemTextActive,
                                        ]}>
                                            {m}
                                        </Text>
                                        {madhab === m && (
                                            <Ionicons name="checkmark" size={20} color="#1F7A4C" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Calculation Method Selector */}
                    <View style={styles.selectorContainer}>
                        <Text style={styles.selectorLabel}>Method</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowMethodMenu(!showMethodMenu)}
                        >
                            <Text style={styles.selectorText} numberOfLines={1}>
                                {CALCULATION_METHOD_LABELS[calculationMethod].split(' ')[0]}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>

                        {/* Method Dropdown */}
                        {showMethodMenu && (
                            <View style={styles.dropdown}>
                                {Object.entries(CALCULATION_METHOD_LABELS).map(([key, label]) => (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            styles.dropdownItem,
                                            calculationMethod === key && styles.dropdownItemActive,
                                        ]}
                                        onPress={() => handleMethodChange(key)}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            calculationMethod === key && styles.dropdownItemTextActive,
                                        ]}>
                                            {label}
                                        </Text>
                                        {calculationMethod === key && (
                                            <Ionicons name="checkmark" size={20} color="#1F7A4C" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Prayer Times List */}
                {prayerTimes && (
                    <View style={styles.prayerTimesContainer}>
                        <PrayerTimeRow
                            prayerName={PRAYER_NAMES.FAJR}
                            time={formatTime(prayerTimes.fajr)}
                            isCurrent={currentPrayer === PRAYER_NAMES.FAJR}
                            isNext={nextPrayer?.name === PRAYER_NAMES.FAJR}
                        />
                        <PrayerTimeRow
                            prayerName={PRAYER_NAMES.SUNRISE}
                            time={formatTime(prayerTimes.sunrise)}
                            isCurrent={currentPrayer === PRAYER_NAMES.SUNRISE}
                            isNext={nextPrayer?.name === PRAYER_NAMES.SUNRISE}
                        />
                        <PrayerTimeRow
                            prayerName={PRAYER_NAMES.DHUHR}
                            time={formatTime(prayerTimes.dhuhr)}
                            isCurrent={currentPrayer === PRAYER_NAMES.DHUHR}
                            isNext={nextPrayer?.name === PRAYER_NAMES.DHUHR}
                        />
                        <PrayerTimeRow
                            prayerName={PRAYER_NAMES.ASR}
                            time={formatTime(prayerTimes.asr)}
                            isCurrent={currentPrayer === PRAYER_NAMES.ASR}
                            isNext={nextPrayer?.name === PRAYER_NAMES.ASR}
                        />
                        <PrayerTimeRow
                            prayerName={PRAYER_NAMES.MAGHRIB}
                            time={formatTime(prayerTimes.maghrib)}
                            isCurrent={currentPrayer === PRAYER_NAMES.MAGHRIB}
                            isNext={nextPrayer?.name === PRAYER_NAMES.MAGHRIB}
                        />
                        <PrayerTimeRow
                            prayerName={PRAYER_NAMES.ISHA}
                            time={formatTime(prayerTimes.isha)}
                            isCurrent={currentPrayer === PRAYER_NAMES.ISHA}
                            isNext={nextPrayer?.name === PRAYER_NAMES.ISHA}
                        />
                    </View>
                )}

                {/* Next Prayer Card */}
                {nextPrayer && nextPrayer.time && (
                    <NextPrayerCard
                        prayerName={nextPrayer.name}
                        prayerTime={nextPrayer.time}
                    />
                )}

                {/* Info Footer */}
                <View style={styles.footer}>
                    <Ionicons name="information-circle-outline" size={16} color="#999" />
                    <Text style={styles.footerText}>
                        Pull to refresh • Times calculated using {CALCULATION_METHOD_LABELS[calculationMethod]}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6F7',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F6F7',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    scrollContent: {
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    locationText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
    },
    warningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#f39c12',
    },
    warningText: {
        fontSize: 13,
        color: '#f39c12',
        marginLeft: 8,
        fontWeight: '500',
    },
    settingsRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 20,
        gap: 12,
    },
    selectorContainer: {
        flex: 1,
        position: 'relative',
    },
    selectorLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
        fontWeight: '500',
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    selectorText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    dropdown: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
        maxHeight: 250,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownItemActive: {
        backgroundColor: '#F0F8F4',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#333',
    },
    dropdownItemTextActive: {
        color: '#1F7A4C',
        fontWeight: '600',
    },
    prayerTimesContainer: {
        paddingHorizontal: 16,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingHorizontal: 24,
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 6,
        textAlign: 'center',
    },
});

export default PrayerTimesScreen;
