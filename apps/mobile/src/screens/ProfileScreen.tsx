import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
    StatusBar
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
    Camera,
    ChevronRight,
    LogOut,
    Eye,
    EyeOff,
} from 'lucide-react-native';
import { s, vs, normalize } from '../utils/scaling';

export const ProfileScreen = () => {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<ProfileInput>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchAvatar();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();
            if (error) throw error;
            if (data) {
                reset({
                    full_name: data.full_name,
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchAvatar = async () => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user?.id)
                .single();
            if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        } catch (err) {
            console.log('No avatar found');
        }
    };

    const pickImage = async () => {
        const { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync, MediaTypeOptions } = await import('expo-image-picker');
        const { status } = await requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Ruxsat kerak', 'Rasm tanlash uchun ruxsat bering');
            return;
        }
        const result = await launchImageLibraryAsync({
            mediaTypes: MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets[0]) {
            uploadAvatar(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri: string) => {
        setUploading(true);
        try {
            const ext = uri.split('.').pop() || 'jpg';
            const fileName = `${user?.id}.${ext}`;
            const response = await fetch(uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, arrayBuffer, { contentType: `image/${ext}`, upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user?.id);
            setAvatarUrl(publicUrl + '?t=' + Date.now());
            Alert.alert('Muvaffaqiyat', 'Rasm yuklandi!');
        } catch (err: any) {
            Alert.alert('Xatolik', err.message);
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: ProfileInput) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: data.full_name,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user?.id);

            if (error) throw error;
            Alert.alert('Muvaffaqiyat', 'Profil muvaffaqiyatli yangilandi');
        } catch (error: any) {
            Alert.alert('Xatolik', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: vs(160) }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Profil</Text>
                        <Text style={styles.subtitle}>Shaxsiy ma'lumotlaringizni boshqaring</Text>
                    </View>

                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrapper}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                            ) : (
                                <LinearGradient
                                    colors={['#4f46e5', '#3730a3']}
                                    style={styles.avatarPlaceholder}
                                >
                                    <User size={normalize(48)} color="#fff" />
                                </LinearGradient>
                            )}
                            <TouchableOpacity style={styles.cameraBtn} onPress={pickImage} disabled={uploading}>
                                {uploading ? (
                                    <ActivityIndicator size="small" color="#4f46e5" />
                                ) : (
                                    <Camera size={normalize(18)} color="#4f46e5" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.sectionLabel}>Shaxsiy ma'lumotlar</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>To'liq ism</Text>
                            <View style={styles.inputWrapper}>
                                <User size={normalize(20)} color="#94a3b8" style={styles.inputIcon} />
                                <Controller
                                    control={control}
                                    name="full_name"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="To'liq ismingiz"
                                            placeholderTextColor="#94a3b8"
                                        />
                                    )}
                                />
                            </View>
                            {errors.full_name && <Text style={styles.errorText}>{errors.full_name.message}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={[styles.inputWrapper, styles.inputDisabled]}>
                                <Mail size={normalize(20)} color="#cbd5e1" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: '#94a3b8' }]}
                                    value={user?.email}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#4f46e5', '#3730a3']}
                                style={styles.submitGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitText}>O'zgarishlarni saqlash</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={[styles.sectionLabel, { marginTop: vs(32) }]}>Hisob</Text>

                        <TouchableOpacity style={styles.menuItem} onPress={signOut}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#fef2f2' }]}>
                                    <LogOut size={normalize(20)} color="#ef4444" />
                                </View>
                                <Text style={[styles.menuText, { color: '#ef4444' }]}>Chiqish</Text>
                            </View>
                            <ChevronRight size={normalize(20)} color="#cbd5e1" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingHorizontal: s(24),
        paddingTop: vs(20),
        marginBottom: vs(32),
    },
    title: {
        fontSize: normalize(32),
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: normalize(14),
        color: '#64748b',
        fontWeight: '500',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: vs(32),
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarImage: {
        width: s(120),
        height: s(120),
        borderRadius: s(40),
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarPlaceholder: {
        width: s(120),
        height: s(120),
        borderRadius: s(40),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    cameraBtn: {
        position: 'absolute',
        bottom: -s(4),
        right: -s(4),
        width: s(40),
        height: s(40),
        borderRadius: s(14),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 3,
        borderColor: '#f8fafc',
    },
    formContainer: {
        paddingHorizontal: s(24),
    },
    sectionLabel: {
        fontSize: normalize(12),
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: vs(16),
        marginLeft: s(4),
    },
    inputGroup: {
        marginBottom: vs(20),
    },
    label: {
        fontSize: normalize(13),
        fontWeight: '700',
        color: '#64748b',
        marginBottom: vs(8),
        marginLeft: s(4),
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: s(16),
        paddingHorizontal: s(16),
        height: vs(54),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    inputIcon: {
        marginRight: s(12),
    },
    input: {
        flex: 1,
        fontSize: normalize(15),
        fontWeight: '600',
        color: '#1e293b',
    },
    inputDisabled: {
        backgroundColor: '#f1f5f9',
        borderColor: '#f1f5f9',
    },
    errorText: {
        color: '#ef4444',
        fontSize: normalize(11),
        marginTop: vs(4),
        marginLeft: s(4),
    },
    submitBtn: {
        marginTop: vs(12),
        borderRadius: s(16),
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    submitGradient: {
        paddingVertical: vs(18),
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: normalize(16),
        fontWeight: '800',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: s(16),
        borderRadius: s(20),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(12),
    },
    menuIconBox: {
        width: s(40),
        height: s(40),
        borderRadius: s(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontSize: normalize(15),
        fontWeight: '700',
    }
});
