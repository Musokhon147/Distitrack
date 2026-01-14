import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import {
    TrendingUp,
    CheckCircle2,
    XCircle,
    Package as PackageIcon,
    DollarSign,
    Calendar,
    ChevronRight,
    Search
} from 'lucide-react-native';

const StatCard = ({ label, value, icon: Icon, color, isDark }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
                <Icon size={20} color={color} />
            </View>
            <TrendingUp size={14} color="#10b981" />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

export const ReportsScreen = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | "to'langan" | "to'lanmagan">('all');

    const fetchEntries = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('entries')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEntries(data || []);
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [user]);

    const stats = useMemo(() => {
        const total = entries.reduce((sum, e) => sum + (parseFloat(e.summa) || 0), 0);
        const paid = entries.filter(e => e.holat === "to'langan").reduce((sum, e) => sum + (parseFloat(e.summa) || 0), 0);
        const unpaid = entries.filter(e => e.holat === "to'lanmagan").reduce((sum, e) => sum + (parseFloat(e.summa) || 0), 0);

        const formatter = new Intl.NumberFormat('uz-UZ');
        return {
            total: formatter.format(total),
            paid: formatter.format(paid),
            unpaid: formatter.format(unpaid)
        };
    }, [entries]);

    const filteredEntries = useMemo(() => {
        if (filter === 'all') return entries;
        return entries.filter(e => e.holat === filter);
    }, [entries, filter]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchEntries} />}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Hisobotlar</Text>
                    <Text style={styles.subtitle}>Moliyaviy ko'rsatkichlar tahlili</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard label="Jami summa" value={stats.total} icon={DollarSign} color="#4f46e5" />
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <StatCard label="To'langan" value={stats.paid} icon={CheckCircle2} color="#10b981" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <StatCard label="To'lanmagan" value={stats.unpaid} icon={XCircle} color="#ef4444" />
                        </View>
                    </View>
                </View>

                {/* Filters */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Barchasi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterBtn, filter === "to'langan" && styles.filterBtnActivePaid]}
                        onPress={() => setFilter("to'langan")}
                    >
                        <Text style={[styles.filterText, filter === "to'langan" && styles.filterTextActive]}>To'langan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterBtn, filter === "to'lanmagan" && styles.filterBtnActiveUnpaid]}
                        onPress={() => setFilter("to'lanmagan")}
                    >
                        <Text style={[styles.filterText, filter === "to'lanmagan" && styles.filterTextActive]}>Qarz</Text>
                    </TouchableOpacity>
                </View>

                {/* List */}
                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>Xaridlar tafsiloti ({filteredEntries.length})</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
                    ) : (
                        filteredEntries.map(entry => (
                            <View key={entry.id} style={styles.entryCard}>
                                <View style={styles.entryHeader}>
                                    <View style={[styles.iconBox, { backgroundColor: entry.holat === "to'langan" ? '#f0fdf4' : '#fef2f2' }]}>
                                        <PackageIcon size={18} color={entry.holat === "to'langan" ? '#10b981' : '#ef4444'} />
                                    </View>
                                    <View style={styles.entryMain}>
                                        <Text style={styles.entryProduct}>{entry.mahsulot}</Text>
                                        <Text style={styles.entryMarket}>{entry.client}</Text>
                                    </View>
                                    <View style={styles.entryAmountBox}>
                                        <Text style={[styles.entryAmount, { color: entry.holat === "to'langan" ? '#10b981' : '#ef4444' }]}>
                                            {new Intl.NumberFormat('uz-UZ').format(entry.summa)}
                                        </Text>
                                        <Text style={styles.entryUnit}>so'm</Text>
                                    </View>
                                </View>
                                <View style={styles.entryFooter}>
                                    <View style={styles.footerItem}>
                                        <Calendar size={12} color="#94a3b8" />
                                        <Text style={styles.footerText}>{entry.sana || 'Bugun'}</Text>
                                    </View>
                                    <View style={styles.footerItem}>
                                        <Text style={styles.footerText}>{entry.miqdor}</Text>
                                    </View>
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
    scrollContent: {
        padding: 24,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 4,
    },
    statsGrid: {
        gap: 16,
        marginBottom: 32,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
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
        marginBottom: 12,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: '#8e9aaf',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1e293b',
    },
    row: {
        flexDirection: 'row',
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        padding: 4,
        borderRadius: 14,
        marginBottom: 24,
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 11,
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
        fontSize: 13,
        fontWeight: '700',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#1e293b',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
    },
    listSection: {
        flex: 1,
    },
    entryCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    entryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    entryMain: {
        flex: 1,
    },
    entryProduct: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    entryMarket: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    entryAmountBox: {
        alignItems: 'flex-end',
    },
    entryAmount: {
        fontSize: 16,
        fontWeight: '900',
    },
    entryUnit: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    entryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
    }
});
