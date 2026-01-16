import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Users,
    Store,
    TrendingUp,
    AlertCircle,
    Settings as SettingsIcon,
    ArrowRight
} from 'lucide-react-native';
import { s, vs, normalize } from '../utils/scaling';
import { useAuth } from '../context/AuthContext';

const AdminStatCard = ({ title, value, icon: Icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={styles.statHeader}>
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                <Icon size={24} color={color} />
            </View>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
    </View>
);

export const AdminDashboardScreen = ({ navigation }: any) => {
    const { user, signOut } = useAuth();

    const sections = [
        { title: 'Sotuvchilar', count: '12', icon: Users, color: '#4f46e5' },
        { title: 'Do\'konlar', count: '45', icon: Store, color: '#10b981' },
        { title: 'Xaridlar', count: '1.2k', icon: TrendingUp, color: '#f59e0b' },
        { title: 'So\'rovlar', count: '8', icon: AlertCircle, color: '#ef4444' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Admin Paneli</Text>
                        <Text style={styles.headerSubtitle}>Tizim nazorati</Text>
                    </View>
                    <TouchableOpacity onPress={signOut} style={styles.settingsBtn}>
                        <SettingsIcon size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsGrid}>
                    {sections.map((item, idx) => (
                        <AdminStatCard
                            key={idx}
                            title={item.title}
                            value={item.count}
                            icon={item.icon}
                            color={item.color}
                        />
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Boshqaruv</Text>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => navigation.navigate('Foydalanuvchilar')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#4f46e5' }]}>
                            <Users size={20} color="#fff" />
                        </View>
                        <View style={styles.actionText}>
                            <Text style={styles.actionTitle}>Foydalanuvchilar</Text>
                            <Text style={styles.actionDesc}>Sotuvchilar va rollarni boshqarish</Text>
                        </View>
                        <ArrowRight size={20} color="#cbd5e1" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => navigation.navigate("Do'konlar")}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}>
                            <Store size={20} color="#fff" />
                        </View>
                        <View style={styles.actionText}>
                            <Text style={styles.actionTitle}>Do'konlar</Text>
                            <Text style={styles.actionDesc}>Marketlarni tasdiqlash va tahrirlash</Text>
                        </View>
                        <ArrowRight size={20} color="#cbd5e1" />
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
        padding: s(24),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(32),
    },
    headerTitle: {
        fontSize: normalize(28),
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: normalize(14),
        color: '#64748b',
        fontWeight: '500',
    },
    settingsBtn: {
        padding: s(8),
        backgroundColor: '#fff',
        borderRadius: s(12),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: s(16),
        marginBottom: vs(32),
    },
    statCard: {
        width: '47%',
        backgroundColor: '#fff',
        padding: s(20),
        borderRadius: s(24),
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    statHeader: {
        marginBottom: vs(12),
    },
    iconContainer: {
        width: s(44),
        height: s(44),
        borderRadius: s(14),
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: normalize(24),
        fontWeight: '900',
        color: '#1e293b',
    },
    statTitle: {
        fontSize: normalize(12),
        color: '#64748b',
        fontWeight: '600',
        marginTop: vs(2),
    },
    section: {
        marginTop: vs(8),
    },
    sectionTitle: {
        fontSize: normalize(18),
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: vs(16),
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: s(16),
        borderRadius: s(20),
        marginBottom: vs(12),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    actionIcon: {
        width: s(44),
        height: s(44),
        borderRadius: s(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        flex: 1,
        marginLeft: s(16),
    },
    actionTitle: {
        fontSize: normalize(16),
        fontWeight: '700',
        color: '#1e293b',
    },
    actionDesc: {
        fontSize: normalize(12),
        color: '#94a3b8',
        marginTop: vs(2),
    }
});
