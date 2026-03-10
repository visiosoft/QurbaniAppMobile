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
                if (Platform.OS === 'web') {
                    window.alert('Login Failed: ' + (result.error || 'Invalid credentials'));
                } else {
                    Alert.alert('Login Failed', result.error || 'Invalid credentials');
                }
            }
            // If successful, navigation will happen automatically via AuthContext
        } catch (error) {
            console.error('Login error:', error);

            let title = 'Login Error';
            let message = 'An unexpected error occurred. Please try again.';

            // Check for different types of errors
            if (error.message?.includes('Network') || error.message?.includes('network')) {
                title = 'Connection Failed';
                message = 'Cannot connect to the server. Please check:\\n\\n• Your internet connection is active\\n• WiFi or mobile data is turned on\\n• The server is online and reachable';
            } else if (error.message?.includes('timeout')) {
                title = 'Request Timeout';
                message = 'The server is taking too long to respond. Please try again.';
            } else if (error.message?.includes('ECONNREFUSED')) {
                title = 'Server Unavailable';
                message = 'Cannot reach the server. Please ensure the server is running and accessible.';
            } else if (error.response?.status >= 500) {
                title = 'Server Error';
                message = 'The server encountered an error. Please try again later.';
            }

            if (Platform.OS === 'web') {
                window.alert(title + ': ' + message);
            } else {
                Alert.alert(title, message);
            }
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
