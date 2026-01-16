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
    LogOut,
    Bell
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useEntryContext } from '../context/EntryContext';


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
    const navigation = useNavigation<any>();
    const { pendingRequests, requestChange } = useEntryContext();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [marketId, setMarketId] = useState<string | null>(null);
    const [marketName, setMarketName] = useState<string | null>(null);
    const [recentEntries, setRecentEntries] = useState<any[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'requests'>('dashboard');
    const [allEntries, setAllEntries] = useState<any[]>([]);

    const theme = isDark ? darkStyles : lightStyles;

    useEffect(() => {
        if (activeTab === 'requests' && marketName) {
            fetchAllMarketEntries();
        }
    }, [activeTab, marketName]);

    const fetchAllMarketEntries = async () => {
        if (!marketId) return;
        setLoading(true);
        try {
            const { data: entriesData, error } = await supabase
                .from('entries')
                .select('*')
                .eq('market_id', marketId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (entriesData) {
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
                setAllEntries(mapped);
            }
        } catch (err) {
            console.error('Error fetching all entries:', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = recentEntries.length;
        const paidCount = recentEntries.filter(e => e.holat === "to'langan").length;
        const totalAmount = recentEntries.reduce((sum, e) => sum + (Number(e.summa) || 0), 0);

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
        if (user) {
            fetchMarketInfo();
        }
    }, [user]);

    const fetchMarketInfo = async () => {
        setLoading(true);
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('market_id')
                .eq('id', user!.id)
                .single();

            if (profile?.market_id) {
                setMarketId(profile.market_id);
                // Fetch market details
                const { data: market } = await supabase
                    .from('markets')
                    .select('name')
                    .eq('id', profile.market_id)
                    .single();

                if (market) {
                    setMarketName(market.name);
                    fetchRecentEntries(profile.market_id);
                }
            }
        } catch (error) {
            console.error('Error fetching market info:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentEntries = async (mId: string) => {
        try {
            const { data: entriesData, error: entriesError } = await supabase
                .from('entries')
                .select('*')
                .eq('market_id', mId)
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

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (marketName) fetchRecentEntries(marketName);
        setRefreshing(false);
    }, [marketName]);


    const DetailsModal = () => {
        // We can't use hooks directly inside this nested component if it's defined inside the main component body 
        // effectively capturing the parent scope. 
        // But since we need `selectedEntry` which is state, let's keep it here.
        // We need to use `requestChange` from the parent scope.

        const pendingUpdate = selectedEntry ? pendingRequests.find(req =>
            req.entry_id === selectedEntry.id &&
            req.request_type === 'UPDATE_STATUS' &&
            req.status === 'pending'
        ) : null;

        const pendingDelete = selectedEntry ? pendingRequests.find(req =>
            req.entry_id === selectedEntry.id &&
            req.request_type === 'DELETE' &&
            req.status === 'pending'
        ) : null;

        const handleChangeStatus = async () => {
            if (!selectedEntry) return;
            const newStatus = selectedEntry.holat === "to'langan" ? "to'lanmagan" : "to'langan";

            Alert.alert(
                "Holatni o'zgartirish",
                `Ushbu xarid holatini "${newStatus === "to'langan" ? "To'langan" : "Qarz"}" ga o'zgartirish uchun so'rov yuborilsinmi?`,
                [
                    { text: "Bekor qilish", style: "cancel" },
                    {
                        text: "So'rov yuborish",
                        onPress: async () => {
                            await requestChange(selectedEntry.id, 'UPDATE_STATUS', newStatus);
                            // We don't close the modal, so user can see the status update to "Waiting"
                            // But we might want to refresh entries/requests
                            // triggerRefresh(); // The context should auto-update pendingRequests
                        }
                    }
                ]
            );
        };

        const handleDeleteRequest = async () => {
            if (!selectedEntry) return;

            Alert.alert(
                "O'chirish so'rovi",
                "Ushbu xaridni o'chirish uchun so'rov yuborilsinmi?",
                [
                    { text: "Bekor qilish", style: "cancel" },
                    {
                        text: "So'rov yuborish",
                        style: 'destructive',
                        onPress: async () => {
                            await requestChange(selectedEntry.id, 'DELETE');
                        }
                    }
                ]
            );
        };

        return (
            <Modal
                visible={!!selectedEntry}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedEntry(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, height: '85%' }]}>
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
                            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
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
                                            {new Intl.NumberFormat('uz-UZ').format(Number(selectedEntry.summa || '0'))} so'm
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

                                {/* Request Actions */}
                                <View style={styles.modalSection}>
                                    <Text style={[styles.labelSmall, { marginBottom: 12 }]}>So'rovlar</Text>
                                    <View style={{ gap: 12 }}>
                                        {pendingUpdate ? (
                                            <View style={[styles.actionRequestBtn, { opacity: 0.7 }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Clock size={16} color="#f59e0b" />
                                                    <Text style={[styles.actionRequestText, { color: '#f59e0b' }]}>
                                                        Holat o'zgarishi kutilmoqda...
                                                    </Text>
                                                </View>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.actionRequestBtn}
                                                onPress={handleChangeStatus}
                                            >
                                                <Text style={styles.actionRequestText}>
                                                    {selectedEntry.holat === "to'langan"
                                                        ? "Qarz deb belgilash (So'rov)"
                                                        : "To'langan deb belgilash (So'rov)"}
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {pendingDelete ? (
                                            <View style={[styles.actionRequestBtn, { backgroundColor: '#fee2e2', opacity: 0.7 }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Clock size={16} color="#f59e0b" />
                                                    <Text style={[styles.actionRequestText, { color: '#f59e0b' }]}>
                                                        O'chirish kutilmoqda...
                                                    </Text>
                                                </View>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.actionRequestBtn, { backgroundColor: '#fee2e2' }]}
                                                onPress={handleDeleteRequest}
                                            >
                                                <Text style={[styles.actionRequestText, { color: '#ef4444' }]}>
                                                    O'chirish so'rovi
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                <View style={{ height: 20 }} />
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={styles.modalConfirmBtn}
                            onPress={() => setSelectedEntry(null)}
                        >
                            <Text style={styles.modalConfirmText}>Yopish</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity
                            style={{ position: 'relative', padding: 4 }}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <Bell size={24} color={theme.textColor} />
                            {pendingRequests.length > 0 && (
                                <View style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: '#ef4444',
                                    borderWidth: 1,
                                    borderColor: theme.backgroundColor
                                }} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
                            <LogOut size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'dashboard' && styles.activeTabBtn]}
                        onPress={() => setActiveTab('dashboard')}
                    >
                        <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>Panel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'requests' && styles.activeTabBtn]}
                        onPress={() => {
                            setActiveTab('requests');
                            fetchAllMarketEntries();
                        }}
                    >
                        <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>So'rovlar</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'dashboard' ? (
                    <>
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
                                                    {new Intl.NumberFormat('uz-UZ').format(Number(entry.summa || '0'))} so'm
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
                    </>
                ) : (
                    <View style={{ paddingBottom: 100 }}>
                        <Text style={[styles.subHeader, { color: theme.labelColor }]}>Barcha Haridlar va So'rovlar</Text>

                        {allEntries.length === 0 && loading ? (
                            <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
                        ) : (
                            allEntries.map(entry => {
                                const pendingUpdate = pendingRequests.find(req =>
                                    req.entry_id === entry.id &&
                                    req.request_type === 'UPDATE_STATUS' &&
                                    req.status === 'pending'
                                );
                                const pendingDelete = pendingRequests.find(req =>
                                    req.entry_id === entry.id &&
                                    req.request_type === 'DELETE' &&
                                    req.status === 'pending'
                                );

                                return (
                                    <View key={entry.id} style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor, marginBottom: 16 }]}>
                                        <View style={styles.itemRow}>
                                            <View style={[styles.itemIconBox, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                                                <UserIcon size={20} color="#4f46e5" />
                                            </View>
                                            <View style={styles.itemMain}>
                                                <Text style={[styles.valueSmall, { color: theme.textColor }]}>{entry.seller_name}</Text>
                                                <Text style={styles.labelSmall}>{entry.mahsulot} • {entry.miqdor}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[styles.amount, { color: entry.holat === "to'langan" ? '#10b981' : '#ef4444' }]}>
                                                    {new Intl.NumberFormat('uz-UZ').format(Number(entry.summa || '0'))}
                                                </Text>
                                                {entry.holat !== "to'langan" && (
                                                    <View style={[
                                                        styles.statusSmallBadge,
                                                        { marginTop: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                                                    ]}>
                                                        <Text style={[
                                                            styles.statusSmallText,
                                                            { color: '#ef4444' }
                                                        ]}>
                                                            Qarz
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        <View style={{ height: 1, backgroundColor: theme.borderColor, marginVertical: 12 }} />

                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }, pendingUpdate && { opacity: 0.5 }]}
                                                disabled={!!pendingUpdate}
                                                onPress={() => {
                                                    const newStatus = entry.holat === "to'langan" ? "to'lanmagan" : "to'langan";
                                                    Alert.alert(
                                                        "Holatni o'zgartirish",
                                                        `"${newStatus === "to'langan" ? "To'langan" : "Qarz"}" holatiga o'tkazish so'rovini yuborasizmi?`,
                                                        [
                                                            { text: "Bekor qilish", style: "cancel" },
                                                            { text: "Yuborish", onPress: () => requestChange(entry.id, 'UPDATE_STATUS', newStatus) }
                                                        ]
                                                    );
                                                }}
                                            >
                                                <Text style={[styles.actionBtnText, { color: '#4f46e5', fontSize: 12 }]}>
                                                    {pendingUpdate ? "Kutilmoqda..." : entry.holat === "to'langan" ? "Qarzga o'tkazish" : "To'langanga o'tkazish"}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }, pendingDelete && { opacity: 0.5 }]}
                                                disabled={!!pendingDelete}
                                                onPress={() => {
                                                    Alert.alert(
                                                        "O'chirish",
                                                        "Ushbu yozuvni o'chirish so'rovini yuborasizmi?",
                                                        [
                                                            { text: "Bekor qilish", style: "cancel" },
                                                            { text: "Yuborish", style: 'destructive', onPress: () => requestChange(entry.id, 'DELETE') }
                                                        ]
                                                    );
                                                }}
                                            >
                                                <Text style={[styles.actionBtnText, { color: '#ef4444', fontSize: 12 }]}>
                                                    {pendingDelete ? "Kutilmoqda..." : "O'chirish"}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}
            </ScrollView>
            <DetailsModal />
        </SafeAreaView >
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
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        backgroundColor: '#e2e8f0',
        borderRadius: 16,
        padding: 4,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTabBtn: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    activeTabText: {
        color: '#4f46e5',
        fontWeight: '700',
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
    actionRequestBtn: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    actionRequestText: {
        color: '#475569',
        fontWeight: '700',
        fontSize: 14,
    },
});
