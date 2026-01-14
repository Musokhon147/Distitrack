import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ShoppingBag,
    DollarSign,
    User as UserIcon,
    Package as PackageIcon,
    Calendar as CalendarIcon,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    Clock,
    LogOut
} from 'lucide-react-native';

interface PaymentConfirmation {
    id: string;
    entry_id: string;
    requested_by: string;
    market_id: string;
    status: string;
    requested_status: string;
    current_status: string;
    created_at: string;
    entry: {
        mahsulot: string;
        miqdor: string;
        narx: string;
        summa: string;
    } | null;
    seller: {
        full_name: string;
    } | null;
}

const StatCard = ({ label, value, icon: Icon, color, subtitle, isDark }: any) => (
    <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
        <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Icon size={20} color={color} />
            </View>
            <ArrowUpRight size={14} color="#10b981" />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color: isDark ? '#f8fafc' : '#1e293b' }]}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
);

export default function MarketDashboardScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user, signOut } = useAuth();
    const [confirmations, setConfirmations] = useState<PaymentConfirmation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [marketId, setMarketId] = useState<string | null>(null);
    const [marketName, setMarketName] = useState<string | null>(null);
    const [recentEntries, setRecentEntries] = useState<any[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

    const theme = isDark ? darkStyles : lightStyles;

    const stats = useMemo(() => {
        const total = recentEntries.length;
        const paidCount = recentEntries.filter(e => e.holat === "to'langan").length;
        const totalAmount = recentEntries.reduce((sum, e) => sum + (parseFloat(e.summa) || 0), 0);

        return {
            total,
            paidCount,
            totalAmount: new Intl.NumberFormat('uz-UZ').format(totalAmount)
        };
    }, [recentEntries]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Bugun';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('uz-UZ', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    useEffect(() => {
        fetchMarketId();
    }, [user]);

    const fetchMarketId = async () => {
        if (!user) return;
        // Get market_id and market_name from profile or join
        const { data, error } = await supabase
            .from('profiles')
            .select('market_id, markets:market_id(name)')
            .eq('id', user.id)
            .single();

        if (!error && data?.market_id) {
            setMarketId(data.market_id);
            const mName = (data.markets as any)?.name;
            setMarketName(mName);

            // Fetch both confirmations and recent entries
            fetchConfirmations(data.market_id);
            if (mName) {
                fetchRecentEntries(mName);
            }
        } else {
            setLoading(false);
        }
    };

    const fetchRecentEntries = async (mName: string) => {
        try {
            const { data: entriesData, error: entriesError } = await supabase
                .from('entries')
                .select('*')
                .eq('client', mName)
                .order('created_at', { ascending: false })
                .limit(20);

            if (entriesError) throw entriesError;

            if (entriesData) {
                // Get seller names for these entries
                const sellerIds = [...new Set(entriesData.map(e => e.user_id))];
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', sellerIds);

                const sellerMap = new Map((profilesData || []).map(p => [p.id, p.full_name]));
                const mapped = entriesData.map(e => ({
                    ...e,
                    seller_name: sellerMap.get(e.user_id) || 'Noma\'lum'
                }));

                setRecentEntries(mapped);
            }
        } catch (err) {
            console.error('Error fetching recent entries:', err);
        }
    };

    const fetchConfirmations = async (mId: string) => {
        setLoading(true);
        try {
            // 1. Fetch pending confirmations for this market
            const { data: confirmationsData, error: confError } = await supabase
                .from('payment_confirmations')
                .select('*')
                .eq('market_id', mId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (confError) {
                console.error('Error fetching confirmations:', confError);
                return;
            }

            if (!confirmationsData || confirmationsData.length === 0) {
                setConfirmations([]);
                return;
            }

            // 2. Extract unique entry IDs and requester IDs
            const entryIds = confirmationsData.map(c => c.entry_id);
            const sellerIds = [...new Set(confirmationsData.map(c => c.requested_by))];

            // 3. Fetch entries details
            const { data: entriesData, error: entriesError } = await supabase
                .from('entries')
                .select('id, mahsulot, miqdor, narx, summa')
                .in('id', entryIds);

            // 4. Fetch seller profiles
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', sellerIds);

            // 5. Create maps for quick lookup
            const entryMap = new Map((entriesData || []).map(e => [e.id, e]));
            const sellerMap = new Map((profilesData || []).map(p => [p.id, p]));

            // 6. Map everything together
            const mapped = confirmationsData.map(conf => ({
                id: conf.id,
                entry_id: conf.entry_id,
                requested_by: conf.requested_by,
                market_id: conf.market_id,
                status: conf.status,
                requested_status: conf.requested_status,
                current_status: conf.current_status,
                created_at: conf.created_at,
                entry: entryMap.get(conf.entry_id) || { mahsulot: 'Noma\'lum', miqdor: '0', narx: '0', summa: '0' },
                seller: sellerMap.get(conf.requested_by) || { full_name: 'Noma\'lum' }
            }));

            setConfirmations(mapped as any);
        } catch (err) {
            console.error('Unexpected error in fetchConfirmations:', err);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        const promises = [];
        if (marketId) promises.push(fetchConfirmations(marketId));
        if (marketName) promises.push(fetchRecentEntries(marketName));

        Promise.all(promises).finally(() => setRefreshing(false));
    }, [marketId, marketName]);

    const handleApprove = async (confirmation: PaymentConfirmation) => {
        setProcessingId(confirmation.id);
        try {
            // Update the entry status to "to'langan"
            const { error: entryError } = await supabase
                .from('entries')
                .update({ holat: "to'langan" })
                .eq('id', confirmation.entry_id);

            if (entryError) {
                throw new Error('Yozuvni yangilashda xatolik: ' + entryError.message);
            }

            // Update the confirmation status
            const { error: confirmError } = await supabase
                .from('payment_confirmations')
                .update({ status: 'approved' })
                .eq('id', confirmation.id);

            if (confirmError) {
                throw new Error('Tasdiqlashda xatolik: ' + confirmError.message);
            }

            Alert.alert('Muvaffaqiyat', "To'lov tasdiqlandi!");
            setConfirmations(prev => prev.filter(c => c.id !== confirmation.id));
            if (marketName) fetchRecentEntries(marketName);
        } catch (error: any) {
            Alert.alert('Xatolik', error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (confirmation: PaymentConfirmation) => {
        setProcessingId(confirmation.id);
        try {
            const { error } = await supabase
                .from('payment_confirmations')
                .update({ status: 'rejected' })
                .eq('id', confirmation.id);

            if (error) throw error;

            Alert.alert('Rad etildi', "To'lov so'rovi rad etildi");
            setConfirmations(prev => prev.filter(c => c.id !== confirmation.id));
            if (marketName) fetchRecentEntries(marketName);
        } catch (error: any) {
            Alert.alert('Xatolik', error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const DetailsModal = () => (
        <Modal
            visible={!!selectedEntry}
            transparent
            animationType="slide"
            onRequestClose={() => setSelectedEntry(null)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderBar} />
                        <Text style={[styles.modalTitle, { color: theme.textColor }]}>Xarid Tafsilotlari</Text>
                        <TouchableOpacity
                            onPress={() => setSelectedEntry(null)}
                            style={styles.modalCloseBtn}
                        >
                            <XCircle size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    {selectedEntry && (
                        <View style={styles.modalBody}>
                            <View style={styles.modalSection}>
                                <Text style={styles.labelSmall}>Mahsulot</Text>
                                <View style={styles.detailRow}>
                                    <View style={[styles.itemIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                        <PackageIcon size={20} color="#10b981" />
                                    </View>
                                    <Text style={[styles.detailValue, { color: theme.textColor }]}>{selectedEntry.mahsulot}</Text>
                                </View>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.labelSmall}>Sotuvchi</Text>
                                <View style={styles.detailRow}>
                                    <View style={[styles.itemIconBox, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                                        <UserIcon size={20} color="#4f46e5" />
                                    </View>
                                    <Text style={[styles.detailValue, { color: theme.textColor }]}>{selectedEntry.seller_name}</Text>
                                </View>
                            </View>

                            <View style={styles.gridRow}>
                                <View style={styles.gridCol}>
                                    <Text style={styles.labelSmall}>Miqdori</Text>
                                    <Text style={[styles.gridValue, { color: theme.textColor }]}>{selectedEntry.miqdor}</Text>
                                </View>
                                <View style={styles.gridCol}>
                                    <Text style={styles.labelSmall}>Sana</Text>
                                    <Text style={[styles.gridValue, { color: theme.textColor }]}>{selectedEntry.sana || 'Bugun'}</Text>
                                </View>
                            </View>

                            <View style={[styles.modalSection, { marginTop: 12 }]}>
                                <Text style={styles.labelSmall}>Umumiy Summa</Text>
                                <View style={styles.amountBanner}>
                                    <DollarSign size={24} color="#10b981" />
                                    <Text style={styles.bannerText}>
                                        {new Intl.NumberFormat('uz-UZ').format(parseFloat(selectedEntry.summa || '0'))} so'm
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.labelSmall}>To'lov Holati</Text>
                                <View style={[
                                    styles.statusBanner,
                                    { backgroundColor: selectedEntry.holat === "to'langan" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
                                ]}>
                                    {selectedEntry.holat === "to'langan" ? (
                                        <CheckCircle2 size={18} color="#10b981" />
                                    ) : (
                                        <Clock size={18} color="#ef4444" />
                                    )}
                                    <Text style={[
                                        styles.statusBannerText,
                                        { color: selectedEntry.holat === "to'langan" ? '#10b981' : '#ef4444' }
                                    ]}>
                                        {selectedEntry.holat === "to'langan" ? "To'langan" : "Qarz (To'lanmagan)"}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.modalConfirmBtn}
                                onPress={() => setSelectedEntry(null)}
                            >
                                <Text style={styles.modalConfirmText}>Yopish</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topBar}>
                    <View>
                        <Text style={[styles.header, { color: theme.textColor }]}>Do'kon Paneli</Text>
                        <Text style={[styles.subtitle, { color: theme.labelColor }]}>Xush kelibsiz, {user?.email?.split('@')[0]}!</Text>
                    </View>
                    <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
                        <LogOut size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                {/* Stats Section */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsList}>
                    <StatCard
                        label="Jami xaridlar"
                        value={stats.total}
                        icon={ShoppingBag}
                        color="#10b981"
                        subtitle={`${stats.paidCount} ta to'langan`}
                        isDark={isDark}
                    />
                    <StatCard
                        label="Jami summa"
                        value={stats.totalAmount}
                        icon={DollarSign}
                        color="#4f46e5"
                        subtitle="So'm"
                        isDark={isDark}
                    />
                </ScrollView>

                {/* Confirmations Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.subHeader, { color: theme.labelColor, marginBottom: 0 }]}>
                        To'lov tasdiqnomalari ({confirmations.length})
                    </Text>
                    <TouchableOpacity onPress={() => marketId && fetchConfirmations(marketId)}>
                        <Text style={styles.refreshText}>Yangilash</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor, marginBottom: 24 }]}>
                    {loading && confirmations.length === 0 ? (
                        <ActivityIndicator size="large" color="#10b981" style={{ padding: 40 }} />
                    ) : confirmations.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Clock size={40} color={isDark ? '#334155' : '#e2e8f0'} style={{ marginBottom: 12 }} />
                            <Text style={{ color: theme.labelColor, textAlign: 'center' }}>Kutilayotgan so'rovlar yo'q</Text>
                        </View>
                    ) : (
                        confirmations.map(confirmation => (
                            <View
                                key={confirmation.id}
                                style={[styles.confirmationItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: theme.borderColor }]}
                            >
                                <View style={styles.itemRow}>
                                    <View style={[styles.itemIconBox, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                                        <UserIcon size={18} color="#4f46e5" />
                                    </View>
                                    <View style={styles.itemMain}>
                                        <Text style={styles.labelSmall}>Sotuvchi</Text>
                                        <Text style={[styles.valueSmall, { color: theme.textColor }]}>{confirmation.seller?.full_name}</Text>
                                    </View>
                                    <View style={styles.itemMain}>
                                        <Text style={styles.labelSmall}>Summa</Text>
                                        <Text style={[styles.valueSmall, { color: '#10b981' }]}>{new Intl.NumberFormat('uz-UZ').format(parseFloat(confirmation.entry?.summa || '0'))} so'm</Text>
                                    </View>
                                </View>

                                <View style={[styles.itemRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#f1f5f9' }]}>
                                    <View style={[styles.itemIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                        <PackageIcon size={18} color="#10b981" />
                                    </View>
                                    <View style={styles.itemMain}>
                                        <Text style={styles.labelSmall}>Mahsulot</Text>
                                        <Text style={[styles.valueSmall, { color: theme.textColor }]}>{confirmation.entry?.mahsulot}</Text>
                                        <Text style={styles.details}>{confirmation.entry?.miqdor}</Text>
                                    </View>
                                    <View style={styles.itemMain}>
                                        <Text style={styles.labelSmall}>O'zgarish</Text>
                                        <View style={styles.transitionBox}>
                                            <Text style={styles.oldStatus}>Qarz</Text>
                                            <Text style={styles.arrow}>→</Text>
                                            <Text style={styles.newStatus}>To'langan</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={[styles.buttonRow, { marginTop: 16 }]}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.approveBtn]}
                                        onPress={() => handleApprove(confirmation)}
                                        disabled={processingId === confirmation.id}
                                    >
                                        {processingId === confirmation.id ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.actionBtnText}>Tasdiqlash ✓</Text>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.rejectBtn]}
                                        onPress={() => handleReject(confirmation)}
                                        disabled={processingId === confirmation.id}
                                    >
                                        <Text style={styles.actionBtnText}>Rad etish ✗</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Recent Purchases Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.subHeader, { color: theme.labelColor, marginBottom: 0 }]}>
                        Oxirgi xaridlar ({recentEntries.length})
                    </Text>
                    <TouchableOpacity onPress={() => marketName && fetchRecentEntries(marketName)}>
                        <Text style={styles.refreshText}>Yangilash</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor, marginBottom: 40 }]}>
                    {loading && recentEntries.length === 0 ? (
                        <ActivityIndicator size="large" color="#4f46e5" style={{ padding: 40 }} />
                    ) : recentEntries.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <ShoppingBag size={40} color={isDark ? '#334155' : '#e2e8f0'} style={{ marginBottom: 12 }} />
                            <Text style={{ color: theme.labelColor }}>Hozircha xaridlar yo'q</Text>
                        </View>
                    ) : (
                        recentEntries.map(entry => (
                            <TouchableOpacity
                                key={entry.id}
                                style={[styles.confirmationItem, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: theme.borderColor }]}
                                onPress={() => setSelectedEntry(entry)}
                            >
                                <View style={styles.itemRow}>
                                    <View style={[styles.itemIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                        <PackageIcon size={18} color="#10b981" />
                                    </View>
                                    <View style={styles.itemMain}>
                                        <Text style={styles.labelSmall}>{formatDate(entry.created_at)}</Text>
                                        <Text style={[styles.valueSmall, { color: theme.textColor }]}>{entry.mahsulot}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.labelSmall}>Summa</Text>
                                        <Text style={[styles.amount, { color: entry.holat === "to'langan" ? '#10b981' : '#ef4444' }]}>
                                            {new Intl.NumberFormat('uz-UZ').format(parseFloat(entry.summa || '0'))} so'm
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <CalendarIcon size={12} color="#94a3b8" />
                                        <Text style={[styles.details, { marginBottom: 0 }]}>
                                            {entry.miqdor} • {entry.sana || 'Bugun'}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.statusSmallBadge,
                                        { backgroundColor: entry.holat === "to'langan" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
                                    ]}>
                                        <Text style={[
                                            styles.statusSmallText,
                                            { color: entry.holat === "to'langan" ? '#10b981' : '#ef4444' }
                                        ]}>
                                            {entry.holat === "to'langan" ? "To'langan" : "Qarz"}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
            <DetailsModal />
        </SafeAreaView>
    );
}

const lightStyles = {
    backgroundColor: '#f1f5f9',
    cardBackground: '#ffffff',
    textColor: '#1e293b',
    labelColor: '#334155',
    borderColor: '#e2e8f0',
};

const darkStyles = {
    backgroundColor: '#0f172a',
    cardBackground: '#1e293b',
    textColor: '#f8fafc',
    labelColor: '#94a3b8',
    borderColor: '#334155',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 24,
    },
    header: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    subHeader: {
        fontSize: 16,
        marginBottom: 20,
        fontWeight: '500',
    },
    logoutBtn: {
        padding: 12,
        backgroundColor: '#fee2e2',
        borderRadius: 14,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 12,
    },
    card: {
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        borderWidth: 1,
    },
    confirmationItem: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    confirmationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    amount: {
        fontSize: 16,
        fontWeight: '900',
        color: '#10b981',
    },
    details: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    approveBtn: {
        backgroundColor: '#10b981',
    },
    rejectBtn: {
        backgroundColor: '#ef4444',
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    statusSmallBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusSmallText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    statCard: {
        width: 160,
        padding: 16,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        justifyContent: 'center',
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
        color: '#64748b',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
    },
    statSubtitle: {
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 2,
    },
    statsList: {
        paddingBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    refreshText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4f46e5',
    },
    itemIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemMain: {
        flex: 1,
    },
    labelSmall: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    valueSmall: {
        fontSize: 14,
        fontWeight: '700',
    },
    transitionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    oldStatus: {
        fontSize: 11,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
    arrow: {
        fontSize: 12,
        color: '#94a3b8',
    },
    newStatus: {
        fontSize: 12,
        fontWeight: '800',
        color: '#10b981',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        height: '75%',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalHeaderBar: {
        width: 40,
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    modalCloseBtn: {
        position: 'absolute',
        right: 0,
        top: 20,
    },
    modalBody: {
        flex: 1,
    },
    modalSection: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 12,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    gridCol: {
        flex: 1,
        backgroundColor: 'rgba(226, 232, 240, 0.2)',
        padding: 16,
        borderRadius: 20,
    },
    gridValue: {
        fontSize: 16,
        fontWeight: '800',
        marginTop: 4,
    },
    amountBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 20,
        borderRadius: 24,
        marginTop: 8,
        gap: 12,
    },
    bannerText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#10b981',
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginTop: 8,
        gap: 10,
    },
    statusBannerText: {
        fontSize: 15,
        fontWeight: '800',
    },
    modalConfirmBtn: {
        backgroundColor: '#4f46e5',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 'auto',
    },
    modalConfirmText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
