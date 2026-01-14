import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Image,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useEntryContext } from '../context/EntryContext';
import {
    TrendingUp,
    CheckCircle2,
    XCircle,
    Package as PackageIcon,
    DollarSign,
    Calendar,
    ChevronRight,
} from 'lucide-react-native';
import { s, vs, normalize } from '../utils/scaling';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
                <Icon size={normalize(20)} color={color} />
            </View>
            <TrendingUp size={normalize(14)} color="#10b981" />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

export const ReportsScreen = () => {
    const { user } = useAuth();
    const { entries: allEntries, loading, refreshEntries } = useEntryContext();
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | "to'langan" | "to'lanmagan">('all');
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', user.id)
                .single();
            setProfile(data);
        };
        fetchProfile();
    }, [user]);

    // Role-based filtering
    const entries = useMemo(() => {
        if (!profile) return allEntries;
        if (profile.role === 'market') {
            return allEntries.filter(e => e.marketNomi === profile.full_name);
        }
        return allEntries; // For sellers, context already filters if RLS is on, else we show all (current behavior)
    }, [allEntries, profile]);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshEntries();
        setRefreshing(false);
    };

    const stats = useMemo(() => {
        const total = entries.reduce((acc, e) => acc + (Number(e.summa) || 0), 0);
        const paid = entries.filter(e => e.tolovHolati === "to'langan").reduce((acc, e) => acc + (Number(e.summa) || 0), 0);
        const unpaid = total - paid;
        return { total, paid, unpaid };
    }, [entries]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('uz-UZ').format(price);
    };

    const filteredEntries = entries.filter(e => {
        if (filter === 'all') return true;
        if (filter === "to'lanmagan") return e.tolovHolati === "to'lanmagan" || e.tolovHolati === "kutilmoqda";
        return e.tolovHolati === filter;
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Hisobotlar</Text>
                        <Text style={styles.subtitle}>Sizning moliyaviy natijalaringiz</Text>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <StatCard
                        label="Umumiy"
                        value={formatPrice(stats.total)}
                        icon={DollarSign}
                        color="#4f46e5"
                    />
                    <StatCard
                        label="To'langan"
                        value={formatPrice(stats.paid)}
                        icon={CheckCircle2}
                        color="#10b981"
                    />
                    <StatCard
                        label="To'lanmagan"
                        value={formatPrice(stats.unpaid)}
                        icon={XCircle}
                        color="#ef4444"
                    />
                </View>

                <View style={styles.content}>
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
                            onPress={() => setFilter('all')}
                        >
                            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Barchasi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterBtn, filter === "to'langan" && [styles.filterBtnActive, styles.filterBtnActivePaid]]}
                            onPress={() => setFilter("to'langan")}
                        >
                            <Text style={[styles.filterText, filter === "to'langan" && styles.filterTextActiveWhite]}>To'langan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterBtn, filter === "to'lanmagan" && [styles.filterBtnActive, styles.filterBtnActiveUnpaid]]}
                            onPress={() => setFilter("to'lanmagan")}
                        >
                            <Text style={[styles.filterText, filter === "to'lanmagan" && styles.filterTextActiveWhite]}>To'lanmagan</Text>
                        </TouchableOpacity>
                    </View>


                    {loading && !refreshing ? (
                        <ActivityIndicator color="#4f46e5" style={{ marginTop: vs(20) }} />
                    ) : filteredEntries.length === 0 ? (
                        <View style={styles.emptyState}>
                            <PackageIcon size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>Ma'lumotlar mavjud emas</Text>
                        </View>
                    ) : (
                        filteredEntries.map((e, i) => (
                            <View key={e.id || i} style={styles.entryCard}>
                                <View style={styles.entryHeader}>
                                    <View style={styles.entryMain}>
                                        <Text style={styles.entryProduct}>
                                            {e.mahsulotTuri}
                                            <Text style={[styles.productStatusLabel, {
                                                color: e.tolovHolati === "to'langan" ? '#10b981' : (e.tolovHolati === 'kutilmoqda' ? '#f59e0b' : '#ef4444')
                                            }]}> ({e.tolovHolati === "to'langan" ? "To'langan" : (e.tolovHolati === 'kutilmoqda' ? "Kutilmoqda" : "To'lanmagan")})</Text>
                                        </Text>
                                        <Text style={styles.entryMarket}>{e.marketNomi}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, {
                                        backgroundColor: e.tolovHolati === "to'langan" ? '#f0fdf4' : (e.tolovHolati === 'kutilmoqda' ? '#fffbeb' : '#fef2f2')
                                    }]}>
                                        <Text style={[styles.statusText, {
                                            color: e.tolovHolati === "to'langan" ? '#10b981' : (e.tolovHolati === 'kutilmoqda' ? '#f59e0b' : '#ef4444')
                                        }]}>{e.tolovHolati}</Text>
                                    </View>
                                </View>

                                <View style={styles.entryFooter}>
                                    <View style={styles.footerInfo}>
                                        <Calendar size={14} color="#94a3b8" />
                                        <Text style={styles.footerText}>{e.sana || (e.created_at ? new Date(e.created_at).toLocaleDateString() : '')}</Text>
                                    </View>
                                    <Text style={[styles.entryAmount, {
                                        color: e.tolovHolati === "to'langan" ? '#10b981' : (e.tolovHolati === 'kutilmoqda' ? '#f59e0b' : '#ef4444')
                                    }]}>
                                        {formatPrice(Number(e.summa) || 0)} <Text style={styles.entryCurrency}>UZS</Text>
                                    </Text>
                                </View>
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
    header: {
        paddingHorizontal: s(24),
        paddingTop: vs(20),
        marginBottom: vs(24),
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
        marginTop: vs(4),
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: s(24),
        gap: s(12),
        marginBottom: vs(24),
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: s(20),
        padding: s(12),
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: vs(12),
    },
    statIconContainer: {
        width: s(36),
        height: s(36),
        borderRadius: s(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: normalize(10),
        color: '#8e9aaf',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: vs(4),
    },
    statValue: {
        fontSize: normalize(15),
        fontWeight: '900',
        color: '#1e293b',
    },
    content: {
        paddingHorizontal: s(24),
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        padding: s(4),
        borderRadius: s(14),
        marginBottom: vs(24),
    },
    filterBtn: {
        flex: 1,
        paddingVertical: vs(10),
        borderRadius: s(11),
        alignItems: 'center',
    },
    filterBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    filterBtnActivePaid: {
        backgroundColor: '#10b981',
    },
    filterBtnActiveUnpaid: {
        backgroundColor: '#ef4444',
    },
    filterText: {
        fontSize: normalize(13),
        fontWeight: '700',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#1e293b',
    },
    filterTextActiveWhite: {
        color: '#fff',
    },
    sectionTitle: {
        fontSize: normalize(18),
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: vs(16),
    },
    entryCard: {
        backgroundColor: '#fff',
        borderRadius: s(20),
        padding: s(16),
        marginBottom: vs(16),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: vs(12),
    },
    entryMain: {
        flex: 1,
    },
    entryProduct: {
        fontSize: normalize(16),
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: vs(2),
    },
    productStatusLabel: {
        fontSize: normalize(12),
        fontWeight: '700',
    },
    entryMarket: {
        fontSize: normalize(13),
        color: '#94a3b8',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: s(10),
        paddingVertical: vs(4),
        borderRadius: s(8),
    },
    statusText: {
        fontSize: normalize(10),
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    entryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: vs(12),
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(6),
    },
    footerText: {
        fontSize: normalize(12),
        color: '#94a3b8',
        fontWeight: '600',
    },
    entryAmount: {
        fontSize: normalize(16),
        fontWeight: '900',
    },
    entryCurrency: {
        fontSize: normalize(10),
        fontWeight: '700',
        color: '#94a3b8',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: vs(40),
        opacity: 0.5,
    },
    emptyText: {
        marginTop: vs(12),
        fontSize: normalize(14),
        color: '#94a3b8',
        fontWeight: '600',
    }
});
