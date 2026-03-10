import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import HajjDayCard from '../../components/HajjDayCard';

/**
 * HajjGuideScreen
 * Complete day-by-day Hajj procedure guide with timeline UI
 */
const HajjGuideScreen = ({ navigation }) => {
    // Hajj days data
    const hajjDays = [
        {
            dayNumber: 0,
            title: 'Preparation for Hajj',
            arabicDate: 'Before 8 Dhul-Hijjah',
            location: 'Miqat',
            icon: 'shirt-outline',
            description: 'Enter the state of Ihram and make your intention for Hajj.',
            steps: [
                'Perform Ghusl (ritual bath)',
                'Wear Ihram (two white unstitched cloths for men)',
                'Make intention (Niyyah) for Hajj',
                'Recite Talbiyah continuously',
            ],
            talbiyah: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ\nلَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ\nإِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْك\nلَا شَرِيكَ لَكَ',
        },
        {
            dayNumber: 1,
            title: 'Day of Tarwiyah',
            arabicDate: '8 Dhul-Hijjah',
            location: 'Mina',
            icon: 'home-outline',
            description: 'The first official day of Hajj. Pilgrims travel to Mina and spend the day in worship.',
            steps: [
                'Leave for Mina after sunrise',
                'Pray Dhuhr, Asr, Maghrib, and Isha in Mina',
                'Shorten prayers (Qasr) but do not combine',
                'Stay overnight in Mina',
                'Engage in dhikr and worship',
            ],
        },
        {
            dayNumber: 2,
            title: 'Day of Arafah',
            arabicDate: '9 Dhul-Hijjah',
            location: 'Arafat → Muzdalifah',
            icon: 'triangle-outline',
            description: 'The most important day of Hajj. Standing at Arafat is the pillar of Hajj.',
            steps: [
                'Leave Mina for Arafat after Fajr',
                'Stand in Arafat (Wuquf) from noon until sunset',
                'Pray Dhuhr and Asr combined at Arafat',
                'Make sincere dua and seek forgiveness',
                'After sunset, proceed to Muzdalifah',
                'Pray Maghrib and Isha combined in Muzdalifah',
                'Collect 49-70 pebbles for stoning',
                'Rest overnight under the open sky',
            ],
        },
        {
            dayNumber: 3,
            title: 'Eid al-Adha',
            arabicDate: '10 Dhul-Hijjah',
            location: 'Mina → Makkah',
            icon: 'sunny-outline',
            description: 'Day of sacrifice and major rituals. Most restrictions of Ihram are lifted.',
            steps: [
                'Pray Fajr in Muzdalifah',
                'Return to Mina before sunrise',
                'Stone Jamarat al-Aqaba (large pillar) with 7 pebbles',
                'Perform animal sacrifice (Qurbani)',
                'Shave head (men) or trim hair (women)',
                'Go to Makkah for Tawaf al-Ifadah (7 circuits)',
                'Perform Sa\'i between Safa and Marwah (7 laps)',
                'Return to Mina for the night',
            ],
        },
        {
            dayNumber: 4,
            title: 'First Day of Tashriq',
            arabicDate: '11 Dhul-Hijjah',
            location: 'Mina',
            icon: 'ellipse-outline',
            description: 'Days of eating, drinking, and remembering Allah. Continue stoning rituals.',
            steps: [
                'Stone all three Jamarat after Dhuhr',
                'Start with Jamarat al-Ula (small)',
                'Then Jamarat al-Wusta (middle)',
                'Finally Jamarat al-Aqaba (large)',
                'Throw 7 pebbles at each Jamarat',
                'Make dua after the first two Jamarat',
                'Stay overnight in Mina',
            ],
        },
        {
            dayNumber: 5,
            title: 'Second Day of Tashriq',
            arabicDate: '12 Dhul-Hijjah',
            location: 'Mina',
            icon: 'ellipse-outline',
            description: 'Continue the stoning ritual. You may leave Mina before sunset if you wish.',
            steps: [
                'Stone all three Jamarat after Dhuhr',
                'Throw 7 pebbles at each Jamarat',
                'Make dua after the first two Jamarat',
                'Option 1: Leave Mina before sunset (Hajj complete)',
                'Option 2: Stay for 13th Dhul-Hijjah',
            ],
        },
        {
            dayNumber: 6,
            title: 'Third Day of Tashriq (Optional)',
            arabicDate: '13 Dhul-Hijjah',
            location: 'Mina',
            icon: 'ellipse-outline',
            description: 'Final day of stoning for those who stayed. Complete your Hajj rituals.',
            steps: [
                'Stone all three Jamarat after Dhuhr',
                'Throw 7 pebbles at each Jamarat',
                'Leave Mina after stoning',
                'Prepare for Tawaf al-Wada',
            ],
        },
        {
            dayNumber: 7,
            title: 'Farewell Tawaf',
            arabicDate: 'Before Departure',
            location: 'Makkah',
            icon: 'reload-outline',
            description: 'The final obligatory act of Hajj before leaving Makkah.',
            steps: [
                'Perform Tawaf al-Wada (7 circuits around Kaaba)',
                'This is the last thing before leaving Makkah',
                'Make final dua at Multazam if possible',
                'Drink Zamzam water',
                'Depart with full heart and accepted Hajj insha\'Allah',
            ],
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

            {/* Header with Gradient */}
            <LinearGradient
                colors={['#2E7D32', '#1B5E20', '#0D3C15']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <Ionicons
                    name="arrow-back"
                    size={24}
                    color="#FFFFFF"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                />
                <View style={styles.headerContent}>
                    <Ionicons name="moon" size={32} color="#C9A961" />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Hajj Guide</Text>
                        <Text style={styles.headerSubtitle}>
                            Complete Hajj Procedure (Day by Day)
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Introduction */}
                <View style={styles.introCard}>
                    <Ionicons name="information-circle" size={24} color="#2E7D32" />
                    <Text style={styles.introText}>
                        This guide covers the complete Hajj procedure from preparation to
                        completion. Tap each card to view detailed steps.
                    </Text>
                </View>

                {/* Timeline of Hajj Days */}
                <View style={styles.timelineContainer}>
                    {hajjDays.map((day, index) => (
                        <HajjDayCard
                            key={index}
                            dayNumber={day.dayNumber}
                            title={day.title}
                            arabicDate={day.arabicDate}
                            location={day.location}
                            icon={day.icon}
                            steps={day.steps}
                            description={day.description}
                            talbiyah={day.talbiyah}
                        />
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Ionicons name="moon" size={28} color="#C9A961" />
                    <Text style={styles.footerText}>May Allah accept your Hajj</Text>
                    <Text style={styles.footerArabic}>تَقَبَّلَ اللهُ حَجَّكُمْ</Text>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    header: {
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    backButton: {
        marginBottom: 12,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
        fontWeight: '400',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 40,
        flexGrow: 1,
    },
    introCard: {
        backgroundColor: '#E8FFF0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderLeftWidth: 4,
        borderLeftColor: '#2E7D32',
    },
    introText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#1C1C1E',
        lineHeight: 22,
    },
    timelineContainer: {
        paddingLeft: 8,
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
        paddingVertical: 24,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
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
    footerText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E7D32',
        marginTop: 12,
        letterSpacing: -0.2,
    },
    footerArabic: {
        fontSize: 20,
        fontWeight: '500',
        color: '#C9A961',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default HajjGuideScreen;
