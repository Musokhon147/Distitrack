import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@distitrack/common';

export const RegisterScreen = () => {
    const [step, setStep] = useState<'register' | 'verify'>('register');
    const { control, handleSubmit, formState: { errors }, getValues } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation<any>();

    const onSubmit = async (data: RegisterInput) => {
        setLoading(true);
        try {
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.full_name,
                    },
                },
            });

            if (error) throw error;

            if (authData.session) {
                // Already verified?
            } else {
                setStep('verify');
                Alert.alert('Tasdiqlash', 'Emailingizga yuborilgan kodni kiriting');
            }
        } catch (error: any) {
            Alert.alert('Xatolik', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!otpCode) {
            Alert.alert('Xatolik', 'Kodni kiriting');
            return;
        }

        setLoading(true);
        try {
            const email = getValues('email');
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otpCode,
                type: 'signup',
            });

            if (error) throw error;
        } catch (error: any) {
            Alert.alert('Xatolik', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Orqaga</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {step === 'register' ? "Ro'yxatdan o'tish" : "Emailni tasdiqlash"}
                    </Text>
                    <Text style={styles.subtitle}>
                        {step === 'register'
                            ? "Yangi hisob yaratish uchun ma'lumotlarni kiriting"
                            : `${getValues('email')} ga yuborilgan kodni kiriting`}
                    </Text>
                </View>

                <View style={styles.form}>
                    {step === 'register' ? (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>To'liq ism</Text>
                                <Controller
                                    control={control}
                                    name="full_name"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[styles.input, errors.full_name && styles.inputError]}
                                            placeholder="Azizbek Rahimov"
                                            placeholderTextColor="#94a3b8"
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                    )}
                                />
                                {errors.full_name && <Text style={styles.errorText}>{errors.full_name.message}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[styles.input, errors.email && styles.inputError]}
                                            placeholder="example@mail.com"
                                            placeholderTextColor="#94a3b8"
                                            value={value}
                                            onChangeText={onChange}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                        />
                                    )}
                                />
                                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Parol</Text>
                                <Controller
                                    control={control}
                                    name="password"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[styles.input, errors.password && styles.inputError]}
                                            placeholder="••••••••"
                                            placeholderTextColor="#94a3b8"
                                            secureTextEntry={true}
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                    )}
                                />
                                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                            </View>

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Davom etish</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tasdiqlash kodi</Text>
                                <TextInput
                                    style={[styles.input, styles.otpInput]}
                                    placeholder="123456"
                                    placeholderTextColor="#94a3b8"
                                    value={otpCode}
                                    onChangeText={setOtpCode}
                                    keyboardType="number-pad"
                                    maxLength={10}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleVerify}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Tasdiqlash</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 32,
    },
    backButton: {
        marginBottom: 16,
    },
    backButtonText: {
        color: '#4f46e5',
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
    },
    form: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#0f172a',
    },
    otpInput: {
        textAlign: 'center',
        letterSpacing: 4,
        fontSize: 24,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#4f46e5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputError: {
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
});
