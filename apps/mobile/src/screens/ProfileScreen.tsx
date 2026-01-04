import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileInput } from '@distitrack/common';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<ProfileInput>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.user_metadata?.full_name || '',
            password: '',
            confirm_password: ''
        }
    });

    const onSubmit = async (data: ProfileInput) => {
        setLoading(true);
        try {
            const updates: any = {
                data: { full_name: data.full_name }
            };

            if (data.password && data.password.length > 0) {
                updates.password = data.password;
            }

            const { error } = await supabase.auth.updateUser(updates);

            if (error) throw error;

            Alert.alert('Muvaffaqiyat', 'Profil muvaffaqiyatli yangilandi');
        } catch (error: any) {
            Alert.alert('Xatolik', error.message || 'Xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Orqaga</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Profil Sozlamalari</Text>
                    <Text style={styles.subtitle}>Ma'lumotlaringizni yangilang</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>To'liq ism</Text>
                        <Controller
                            control={control}
                            name="full_name"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={[styles.input, errors.full_name && styles.inputError]}
                                    placeholder="Ism Familiya"
                                    placeholderTextColor="#94a3b8"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {errors.full_name && <Text style={styles.errorText}>{errors.full_name.message}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email (O'zgartirib bo'lmaydi)</Text>
                        <TextInput
                            style={[styles.input, { opacity: 0.6 }]}
                            value={user?.email}
                            editable={false}
                        />
                    </View>

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Parolni o'zgartirish</Text>
                    <Text style={styles.sectionSubtitle}>Yangi parol o'rnatish uchun quyidagilarni to'ldiring (ixtiyoriy)</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Yangi parol</Text>
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

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Parolni tasdiqlash</Text>
                        <Controller
                            control={control}
                            name="confirm_password"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={[styles.input, errors.confirm_password && styles.inputError]}
                                    placeholder="••••••••"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={true}
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {errors.confirm_password && <Text style={styles.errorText}>{errors.confirm_password.message}</Text>}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Saqlash</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        padding: 24,
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
    inputError: {
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 20,
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
});
