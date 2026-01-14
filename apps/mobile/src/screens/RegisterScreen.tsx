import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@distitrack/common';

type AuthRole = 'seller' | 'market';

interface Market {
    id: string;
    name: string;
}

export const RegisterScreen = () => {
    const [step, setStep] = useState<'register' | 'verify'>('register');
    const [selectedRole, setSelectedRole] = useState<AuthRole>('seller');
    const [markets, setMarkets] = useState<Market[]>([]);
    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [isMarketModalVisible, setIsMarketModalVisible] = useState(false);
    const [marketSearch, setMarketSearch] = useState('');
    const [isAddingNewMarket, setIsAddingNewMarket] = useState(false);
    const [newMarketName, setNewMarketName] = useState('');
    const [newMarketPhone, setNewMarketPhone] = useState('');

    const { control, handleSubmit, formState: { errors }, getValues } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation<any>();

    useEffect(() => {
        const fetchMarkets = async () => {
            const { data, error } = await supabase
                .from('markets')
                .select('id, name')
                .order('name');

            if (!error && data) {
                setMarkets(data);
            }
        };
        fetchMarkets();
    }, []);

    const onSubmit = async (data: RegisterInput) => {
        if (selectedRole === 'market' && !selectedMarket && !newMarketName.trim()) {
            Alert.alert('Xatolik', "Iltimos, do'koningizni tanlang yoki yangi do'kon nomini kiriting");
            return;
        }

        setLoading(true);
        try {
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.full_name,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // Create/update profile using RPC function to bypass RLS
            if (authData.user) {
                let finalMarketId = selectedMarket?.id || null;

                // If adding a new market, create it first
                if (selectedRole === 'market' && isAddingNewMarket && newMarketName.trim()) {
                    const { data: newMarketId, error: marketError } = await supabase
                        .rpc('create_market', {
                            market_name: newMarketName.trim(),
                            market_phone: newMarketPhone.trim()
                        });

                    if (marketError) {
                        console.error('Error creating market:', marketError);
                        throw new Error('Do\'kon yaratishda xatolik: ' + marketError.message);
                    }
                    finalMarketId = newMarketId;
                }

                const { error: profileError } = await supabase.rpc('create_profile_for_new_user', {
                    user_id: authData.user.id,
                    user_role: selectedRole,
                    user_market_id: selectedRole === 'market' ? finalMarketId : null,
                    user_full_name: data.full_name
                });

                if (profileError) throw profileError;
            }

            if (authData.session) {
                // Navigate based on role if session exists immediately
            } else {
                setStep('verify');
                Alert.alert('Tasdiqlash', 'Emailingizga yuborilgan 8 xonali kodni kiriting');
            }
        } catch (error: any) {
            Alert.alert('Xatolik', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!otpCode || otpCode.length !== 8) {
            Alert.alert('Xatolik', '8 xonali kodni kiriting');
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

    const filteredMarkets = markets.filter(m =>
        m.name.toLowerCase().includes(marketSearch.toLowerCase())
    );

    const themeColor = selectedRole === 'seller' ? '#4f46e5' : '#10b981';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Text style={[styles.backButtonText, { color: themeColor }]}>← Orqaga</Text>
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

                    {step === 'register' && (
                        <View style={styles.roleContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.roleButton,
                                    selectedRole === 'seller' && { backgroundColor: themeColor }
                                ]}
                                onPress={() => setSelectedRole('seller')}
                            >
                                <Text style={[styles.roleButtonText, selectedRole === 'seller' && styles.roleButtonTextActive]}>Sotuvchi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.roleButton,
                                    selectedRole === 'market' && { backgroundColor: themeColor }
                                ]}
                                onPress={() => setSelectedRole('market')}
                            >
                                <Text style={[styles.roleButtonText, selectedRole === 'market' && styles.roleButtonTextActive]}>Do'kon</Text>
                            </TouchableOpacity>
                        </View>
                    )}

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

                                {selectedRole === 'market' && (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Do'konni tanlang</Text>
                                        <TouchableOpacity
                                            style={[styles.input, !selectedMarket && { borderColor: '#f59e0b', borderWidth: 1 }]}
                                            onPress={() => setIsMarketModalVisible(true)}
                                        >
                                            <Text style={{ color: selectedMarket ? '#0f172a' : '#94a3b8' }}>
                                                {selectedMarket ? selectedMarket.name : "Do'konni tanlang..."}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: themeColor }, loading && styles.buttonDisabled]}
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
                                    <Text style={styles.label}>Tasdiqlash kodi (8 xonali)</Text>
                                    <TextInput
                                        style={[styles.input, styles.otpInput]}
                                        placeholder="12345678"
                                        placeholderTextColor="#94a3b8"
                                        value={otpCode}
                                        onChangeText={setOtpCode}
                                        keyboardType="number-pad"
                                        maxLength={8}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: themeColor }, loading && styles.buttonDisabled]}
                                    onPress={handleVerify}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Tasdiqlash</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setStep('register')}>
                                    <Text style={[styles.changeEmailText, { color: themeColor }]}>Emailni o'zgartirish</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={isMarketModalVisible}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {isAddingNewMarket ? "Yangi do'kon qo'shish" : "Do'konni tanlang"}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setIsMarketModalVisible(false);
                                setIsAddingNewMarket(false);
                            }}>
                                <Text style={styles.closeButton}>Yopish</Text>
                            </TouchableOpacity>
                        </View>

                        {isAddingNewMarket ? (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Do'kon nomi</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Do'kon nomini kiriting..."
                                        placeholderTextColor="#94a3b8"
                                        value={newMarketName}
                                        onChangeText={setNewMarketName}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Telefon raqami</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="+998 90 123 45 67"
                                        placeholderTextColor="#94a3b8"
                                        value={newMarketPhone}
                                        onChangeText={setNewMarketPhone}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: '#10b981' }]}
                                    onPress={() => {
                                        if (!newMarketName.trim()) {
                                            Alert.alert('Xatolik', "Do'kon nomini kiriting");
                                            return;
                                        }
                                        setSelectedMarket(null);
                                        setIsMarketModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Saqlash</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    setIsAddingNewMarket(false);
                                    setNewMarketName('');
                                    setNewMarketPhone('');
                                }}>
                                    <Text style={[styles.changeEmailText, { color: '#10b981' }]}>← Mavjud do'konlardan tanlash</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Qidirish..."
                                    value={marketSearch}
                                    onChangeText={setMarketSearch}
                                />

                                <FlatList
                                    data={filteredMarkets}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.marketItem}
                                            onPress={() => {
                                                setSelectedMarket(item);
                                                setIsAddingNewMarket(false);
                                                setNewMarketName('');
                                                setNewMarketPhone('');
                                                setIsMarketModalVisible(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.marketItemText,
                                                selectedMarket?.id === item.id && { color: themeColor, fontWeight: 'bold' }
                                            ]}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        <Text style={styles.emptyText}>Do'kon topilmadi</Text>
                                    }
                                    ListFooterComponent={
                                        <TouchableOpacity
                                            style={[styles.addNewMarketBtn, { borderColor: '#10b981' }]}
                                            onPress={() => setIsAddingNewMarket(true)}
                                        >
                                            <Text style={[styles.addNewMarketText, { color: '#10b981' }]}>+ Yangi do'kon qo'shish</Text>
                                        </TouchableOpacity>
                                    }
                                />
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        flexGrow: 1,
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
    roleContainer: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        padding: 4,
        borderRadius: 12,
        marginBottom: 24,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    roleButtonTextActive: {
        color: '#fff',
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
    inputWrapper: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    otpInput: {
        textAlign: 'center',
        letterSpacing: 2,
        fontSize: 22,
        fontWeight: 'bold',
    },
    button: {
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
    changeEmailText: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    closeButton: {
        color: '#ef4444',
        fontWeight: '600',
    },
    searchInput: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    marketItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    marketItemText: {
        fontSize: 16,
        color: '#334155',
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 20,
    },
    addNewMarketBtn: {
        marginTop: 16,
        paddingVertical: 16,
        borderWidth: 2,
        borderRadius: 12,
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    addNewMarketText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
