import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    useColorScheme,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface PaymentConfirmation {
    id: string;
    entry_id: string;
    seller_id: string;
    market_id: string;
    status: string;
    requested_at: string;
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

export default function MarketDashboardScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user, signOut } = useAuth();
    const [confirmations, setConfirmations] = useState<PaymentConfirmation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [marketId, setMarketId] = useState<string | null>(null);

    const theme = isDark ? darkStyles : lightStyles;

    useEffect(() => {
        fetchMarketId();
    }, [user]);

    const fetchMarketId = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('profiles')
            .select('market_id')
            .eq('id', user.id)
            .single();

        if (!error && data?.market_id) {
            setMarketId(data.market_id);
            fetchConfirmations(data.market_id);
        } else {
            setLoading(false);
        }
    };

    const fetchConfirmations = async (mId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('payment_confirmations')
                .select(`
                    id,
                    entry_id,
                    seller_id,
                    market_id,
                    status,
                    requested_at,
                    entries:entry_id (mahsulot, miqdor, narx, summa),
                    profiles:seller_id (full_name)
                `)
                .eq('market_id', mId)
                .eq('status', 'pending')
                .order('requested_at', { ascending: false });

            if (error) {
                console.error('Error fetching confirmations:', error);
            } else {
                const mapped = (data || []).map((item: any) => ({
                    ...item,
                    entry: item.entries,
                    seller: item.profiles
                }));
                setConfirmations(mapped);
            }
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (marketId) {
            fetchConfirmations(marketId).finally(() => setRefreshing(false));
        } else {
            setRefreshing(false);
        }
    }, [marketId]);

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
                .update({ status: 'approved', responded_at: new Date().toISOString() })
                .eq('id', confirmation.id);

            if (confirmError) {
                throw new Error('Tasdiqlashda xatolik: ' + confirmError.message);
            }

            Alert.alert('Muvaffaqiyat', "To'lov tasdiqlandi!");
            setConfirmations(prev => prev.filter(c => c.id !== confirmation.id));
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
                .update({ status: 'rejected', responded_at: new Date().toISOString() })
                .eq('id', confirmation.id);

            if (error) throw error;

            Alert.alert('Rad etildi', "To'lov so'rovi rad etildi");
            setConfirmations(prev => prev.filter(c => c.id !== confirmation.id));
        } catch (error: any) {
            Alert.alert('Xatolik', error.message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.topBar}>
                    <Text style={[styles.header, { color: theme.textColor }]}>Do'kon Paneli</Text>
                    <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Chiqish</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.subHeader, { color: theme.labelColor }]}>
                    To'lov so'rovlari ({confirmations.length})
                </Text>

                <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#10b981" style={{ padding: 40 }} />
                    ) : confirmations.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: theme.labelColor }}>Kutilayotgan so'rovlar yo'q</Text>
                        </View>
                    ) : (
                        confirmations.map(confirmation => (
                            <View
                                key={confirmation.id}
                                style={[styles.confirmationItem, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: theme.borderColor }]}
                            >
                                <View style={styles.confirmationHeader}>
                                    <Text style={[styles.sellerName, { color: theme.textColor }]}>
                                        {confirmation.seller?.full_name || 'Noma\'lum sotuvchi'}
                                    </Text>
                                    <Text style={styles.amount}>
                                        {confirmation.entry?.summa || '0'} so'm
                                    </Text>
                                </View>
                                <Text style={styles.details}>
                                    {confirmation.entry?.mahsulot} • {confirmation.entry?.miqdor}
                                </Text>

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.approveBtn]}
                                        onPress={() => handleApprove(confirmation)}
                                        disabled={processingId === confirmation.id}
                                    >
                                        {processingId === confirmation.id ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.actionBtnText}>Ha ✓</Text>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.rejectBtn]}
                                        onPress={() => handleReject(confirmation)}
                                        disabled={processingId === confirmation.id}
                                    >
                                        <Text style={styles.actionBtnText}>Yo'q ✗</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
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
        marginBottom: 10,
    },
    header: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
    },
    subHeader: {
        fontSize: 16,
        marginBottom: 20,
        fontWeight: '500',
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
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
});
