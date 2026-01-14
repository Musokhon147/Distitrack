import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileInput } from '@distitrack/common';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import {
    User,
    Mail,
    Lock,
    Shield,
    Camera,
    ChevronRight,
    LogOut,
    Eye,
    EyeOff,
    Package
} from 'lucide-react-native';
// Reanimated disabled for stability
/*
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
*/

const { width } = Dimensions.get('window');

export const ProfileScreen = (props: any) => {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    const handleSignOut = () => {
        Alert.alert(
            "Chiqish",
            "Tizimdan chiqmoqchimisiz?",
            [
                { text: "Bekor qilish", style: "cancel" },
                { text: "Chiqish", style: "destructive", onPress: signOut }
            ]
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <LinearGradient
                    colors={['#4f46e5', '#3730a3']}
                    style={styles.headerGradient}
                >
                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerContent}>
                            <View style={styles.avatarContainer}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                                    style={styles.avatarBackground}
                                >
                                    <Text style={styles.avatarText}>
                                        {getInitials(user?.user_metadata?.full_name || user?.email || 'U')}
                                    </Text>
                                </LinearGradient>
                                <TouchableOpacity style={styles.cameraBtn}>
                                    <Camera size={14} color="#4f46e5" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.userName}>{user?.user_metadata?.full_name || 'Foydalanuvchi'}</Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                <View style={styles.content}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        {/* Personal Info Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <User size={20} color="#4f46e5" />
                                <Text style={styles.cardTitle}>Shaxsiy ma'lumotlar</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>To'liq ism</Text>
                                <View style={[styles.inputWrapper, errors.full_name && styles.inputError]}>
                                    <Controller
                                        control={control}
                                        name="full_name"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Ism Familiya"
                                                placeholderTextColor="#94a3b8"
                                                value={value}
                                                onChangeText={onChange}
                                            />
                                        )}
                                    />
                                </View>
                                {errors.full_name && <Text style={styles.errorText}>{errors.full_name.message}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <View style={[styles.inputWrapper, styles.inputDisabled]}>
                                    <TextInput
                                        style={styles.input}
                                        value={user?.email}
                                        editable={false}
                                    />
                                    <Mail size={18} color="#94a3b8" />
                                </View>
                            </View>
                        </View>

                        {/* Security Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Shield size={20} color="#4f46e5" />
                                <Text style={styles.cardTitle}>Xavfsizlik</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Yangi parol</Text>
                                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                                    <Controller
                                        control={control}
                                        name="password"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                style={styles.input}
                                                placeholder="••••••••"
                                                placeholderTextColor="#94a3b8"
                                                secureTextEntry={!showPassword}
                                                value={value}
                                                onChangeText={onChange}
                                            />
                                        )}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                                    </TouchableOpacity>
                                </View>
                                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Parolni tasdiqlash</Text>
                                <View style={[styles.inputWrapper, errors.confirm_password && styles.inputError]}>
                                    <Controller
                                        control={control}
                                        name="confirm_password"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                style={styles.input}
                                                placeholder="••••••••"
                                                placeholderTextColor="#94a3b8"
                                                secureTextEntry={!showPassword}
                                                value={value}
                                                onChangeText={onChange}
                                            />
                                        )}
                                    />
                                </View>
                                {errors.confirm_password && <Text style={styles.errorText}>{errors.confirm_password.message}</Text>}
                            </View>
                        </View>

                        {/* Management Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Package size={20} color="#4f46e5" />
                                <Text style={styles.cardTitle}>Boshqaruv</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => (props as any).navigation.navigate('Products')}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={[styles.menuIconBox, { backgroundColor: '#eef2ff' }]}>
                                        <Package size={18} color="#4f46e5" />
                                    </View>
                                    <Text style={styles.menuItemText}>Mahsulotlar katalogi</Text>
                                </View>
                                <ChevronRight size={18} color="#cbd5e1" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#4f46e5', '#3730a3']}
                                style={styles.saveGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Lock size={18} color="#fff" />
                                        <Text style={styles.saveBtnText}>Saqlash</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.signOutBtn}
                            onPress={handleSignOut}
                        >
                            <LogOut size={18} color="#ef4444" />
                            <Text style={styles.signOutText}>Tizimdan chiqish</Text>
                            <ChevronRight size={18} color="#ef4444" />
                        </TouchableOpacity>

                        <Text style={styles.versionText}>Versiya 1.2.0 • Distitrack</Text>
                    </KeyboardAvoidingView>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerGradient: {
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        alignItems: 'center',
        paddingTop: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarBackground: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        marginTop: -30,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
        height: 52,
    },
    inputDisabled: {
        backgroundColor: '#f1f5f9',
        borderColor: '#f1f5f9',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 11,
        marginTop: 4,
        marginLeft: 4,
    },
    saveBtn: {
        borderRadius: 18,
        overflow: 'hidden',
        marginTop: 8,
        elevation: 8,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    saveGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff1f2',
        padding: 18,
        borderRadius: 18,
        marginTop: 24,
        gap: 12,
        borderWidth: 1,
        borderColor: '#ffe4e6',
    },
    signOutText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '800',
        color: '#ef4444',
    },
    versionText: {
        textAlign: 'center',
        marginTop: 32,
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
});
