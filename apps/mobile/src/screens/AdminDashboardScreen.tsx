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

import { supabase } from '../lib/supabase';
import { RefreshControl, ActivityIndicator } from 'react-native';

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
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [stats, setStats] = React.useState({
        sellers: '0',
        markets: '0',
        transactions: '0',
        requests: '0'
    });
    const [recentActivity, setRecentActivity] = React.useState<any[]>([]);

    const fetchDashboardData = async () => {
        try {
            const [
                { count: sellerCount },
                { count: marketCount },
                { count: entryCount, data: entryData },
                { count: requestCount }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
                supabase.from('markets').select('*', { count: 'exact', head: true }),
                supabase.from('entries').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
                supabase.from('change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ]);

            setStats({
                sellers: (sellerCount || 0).toString(),
                markets: (marketCount || 0).toString(),
                transactions: (entryCount || 0).toString(),
                requests: (requestCount || 0).toString()
            });

            if (entryData) {
                setRecentActivity(entryData);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const sections = [
        { title: 'Sotuvchilar', count: stats.sellers, icon: Users, color: '#4f46e5' },
        { title: 'Do\'konlar', count: stats.markets, icon: Store, color: '#10b981' },
        { title: 'Xaridlar', count: stats.transactions, icon: TrendingUp, color: '#f59e0b' },
        { title: 'So\'rovlar', count: stats.requests, icon: AlertCircle, color: '#ef4444' },
    ];

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />
                }
            >
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

                <View style={[styles.section, { marginBottom: vs(24) }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Boshqaruv</Text>
                    </View>
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

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Oxirgi harakatlar</Text>
                    </View>
                    {recentActivity.length === 0 ? (
                        <View style={styles.emptyActivity}>
                            <Text style={styles.emptyText}>Hozircha harakatlar yo'q</Text>
                        </View>
                    ) : (
                        recentActivity.map((item) => (
                            <View key={item.id} style={styles.activityItem}>
                                <View style={styles.activityDot} />
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityMain}>
                                        <Text style={{ fontWeight: '800' }}>{item.client}</Text>
                                        <Text> uchun </Text>
                                        <Text style={{ color: '#4f46e5', fontWeight: '700' }}>{item.mahsulot}</Text>
                                    </Text>
                                    <Text style={styles.activityTime}>
                                        {new Date(item.created_at).toLocaleDateString('uz-UZ')}
                                    </Text>
                                </View>
                                <Text style={styles.activityAmount}>
                                    {new Intl.NumberFormat('uz-UZ').format(item.summa)}
                                </Text>
                            </View>
                        ))
                    )}
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
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(16),
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: s(16),
        borderRadius: s(20),
        marginBottom: vs(12),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    activityDot: {
        width: s(8),
        height: s(8),
        borderRadius: s(4),
        backgroundColor: '#4f46e5',
        marginRight: s(12),
    },
    activityInfo: {
        flex: 1,
    },
    activityMain: {
        fontSize: normalize(14),
        color: '#1e293b',
    },
    activityTime: {
        fontSize: normalize(12),
        color: '#94a3b8',
        marginTop: vs(2),
    },
    activityAmount: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1e293b',
    },
    emptyActivity: {
        padding: vs(32),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: s(24),
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: normalize(14),
        fontWeight: '500',
    }
});
