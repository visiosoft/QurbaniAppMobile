import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../config/constants';

const COMPANY_NAME = 'Qurbani Services Ltd.';
const COMPANY_PHONE = '+92 300 1234567';
const COMPANY_EMAIL = 'info@qurbaniservices.com';
const COMPANY_ADDRESS = 'Office #12, 2nd Floor, Haji Plaza, Karachi, Pakistan';

const HelpInfoScreen = () => {
    const showAlert = () => {
        Alert.alert(
            "Important Notice",
            "Don't call. If you have marked 'Proceed for Qurbani', please wait. We will update you shortly via the app or SMS."
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Ionicons name="information-circle" size={60} color={COLORS.primary} style={styles.icon} />
            <Text style={styles.title}>Help & Information</Text>
            <Text style={styles.sectionTitle}>Company Details</Text>
            <View style={styles.infoBox}>
                <Text style={styles.label}>Company:</Text>
                <Text style={styles.value}>{COMPANY_NAME}</Text>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{COMPANY_PHONE}</Text>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{COMPANY_EMAIL}</Text>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{COMPANY_ADDRESS}</Text>
            </View>
            <TouchableOpacity style={styles.alertButton} onPress={showAlert}>
                <Ionicons name="alert-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.alertButtonText}>Important: Please Read</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>FAQs</Text>
            <View style={styles.faqBox}>
                <Text style={styles.faqQ}>Q: What should I do after marking 'Proceed for Qurbani'?</Text>
                <Text style={styles.faqA}>A: Please wait patiently. Our team will update your status in the app and notify you via SMS when your Qurbani is completed.</Text>
                <Text style={styles.faqQ}>Q: Should I call the company after marking ready?</Text>
                <Text style={styles.faqA}>A: No, please do not call. All updates will be provided through the app or SMS.</Text>
                <Text style={styles.faqQ}>Q: How will I know when my Qurbani is done?</Text>
                <Text style={styles.faqA}>A: You will receive a notification in the app and an SMS once your Qurbani is completed.</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.lg,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    icon: {
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
        alignSelf: 'flex-start',
    },
    infoBox: {
        backgroundColor: '#f7f7f7',
        borderRadius: 10,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        width: '100%',
    },
    label: {
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 6,
    },
    value: {
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    alertButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.error,
        padding: SPACING.md,
        borderRadius: 8,
        marginVertical: SPACING.md,
        alignSelf: 'stretch',
        justifyContent: 'center',
    },
    alertButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    faqBox: {
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        padding: SPACING.md,
        width: '100%',
        marginBottom: SPACING.lg,
    },
    faqQ: {
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 8,
    },
    faqA: {
        color: COLORS.textSecondary,
        marginBottom: 8,
        marginLeft: 8,
    },
});

export default HelpInfoScreen;
