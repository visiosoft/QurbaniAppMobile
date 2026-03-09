import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS, SPACING, FONT_SIZES } from '../../config/constants';

/**
 * Login Screen
 * Handles user authentication
 */
const LoginScreen = () => {
    const { login } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [passportNumber, setPassportNumber] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Validate form inputs
     */
    const validateForm = () => {
        const newErrors = {};

        // Basic check - only require fields to be filled
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        }

        if (!passportNumber.trim()) {
            newErrors.passportNumber = 'Passport number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle login submission
     */
    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Call login API
            const result = await login({
                phoneNumber: phoneNumber.trim(),
                passportNumber: passportNumber.trim().toUpperCase(),
            });

            if (!result.success) {
                Alert.alert('Login Failed', result.error || 'Invalid credentials');
            }
            // If successful, navigation will happen automatically via AuthContext
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    {/* Logo or App Title */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Qurbani Mate</Text>
                        <Text style={styles.subtitle}>
                            Manage your Hajj Qurbani with ease
                        </Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.form}>
                        <Input
                            label="Phone Number"
                            value={phoneNumber}
                            onChangeText={(text) => {
                                setPhoneNumber(text);
                                if (errors.phoneNumber) {
                                    setErrors({ ...errors, phoneNumber: null });
                                }
                            }}
                            placeholder="+1234567890"
                            keyboardType="phone-pad"
                            error={errors.phoneNumber}
                        />

                        <Input
                            label="Passport Number"
                            value={passportNumber}
                            onChangeText={(text) => {
                                setPassportNumber(text);
                                if (errors.passportNumber) {
                                    setErrors({ ...errors, passportNumber: null });
                                }
                            }}
                            placeholder="Enter your passport number"
                            autoCapitalize="characters"
                            error={errors.passportNumber}
                        />

                        <Button
                            title="Login"
                            onPress={handleLogin}
                            loading={isLoading}
                            style={styles.loginButton}
                        />
                    </View>

                    {/* Help Text */}
                    <View style={styles.footer}>
                        <Text style={styles.helpText}>
                            Please enter your registered phone number and passport number to login.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    form: {
        marginBottom: SPACING.xl,
    },
    loginButton: {
        marginTop: SPACING.md,
    },
    footer: {
        alignItems: 'center',
    },
    helpText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default LoginScreen;
