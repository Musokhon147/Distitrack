import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEntryContext } from '../context/EntryContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useMarkets } from '../context/MarketContext';
import { Check, X, Bell, ArrowLeft, Package, DollarSign } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const NotificationsScreen = () => {
    const { pendingRequests, refreshEntries, approveRequest, rejectRequest, loading } = useEntryContext();
    const { user } = useAuth();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState<{ role: string, market_id: string } | null>(null);

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('profiles')
            .select('role, market_id')
            .eq('id', user.id)
            .single();
        if (data) setProfile(data);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshEntries();
        setRefreshing(false);
    };

    const relevantRequests = pendingRequests.filter(req => {
        if (!profile) return false;

        // If I am Market, I want to see requests from 'seller' where market_id matches mine
        const isMyMarketRequest =
            profile.role === 'market' &&
            req.request_side === 'seller' &&
            req.market_id === profile.market_id;

        // If I am Seller, RLS handles visibility, but I only want to see requests *from market*
        // Or if I am Market, requests *from seller*

        // Simpler logic: 
        // If I am Seller, show requests where request_side == 'market'
        // If I am Market, show requests where request_side == 'seller' AND market_id == my market_id

        if (profile.role === 'seller') {
            return req.request_side === 'market';
        }

        if (profile.role === 'market') {
            return req.request_side === 'seller' && req.market_id === profile.market_id;
        }

        return false;
    });

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>
                        {item.request_type === 'DELETE' ? "O'chirish" : "Holat O'zgarishi"}
                    </Text>
                </View>
                <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>

            <View style={styles.contentContainer}>
                {item.entry ? (
                    <View style={styles.entryDetails}>
                        <View style={styles.detailRow}>
                            <Package size={16} color="#64748b" />
                            <Text style={styles.productName}>{item.entry.mahsulotTuri || 'Mahsulot'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.qtyText}>{item.entry.miqdori} dona</Text>
                            <View style={styles.dot} />
                            <Text style={styles.priceText}>
                                {new Intl.NumberFormat('uz-UZ').format(item.entry.summa || 0)} so'm
                            </Text>
                        </View>

                        <View style={styles.changeInfo}>
                            {item.request_type === 'DELETE' ? (
                                <Text style={styles.deleteWarning}>Ushbu yozuvni o'chirish so'ralmoqda</Text>
                            ) : (
                                <View style={styles.statusChange}>
                                    <Text style={styles.oldStatus}>Holat o'zgarishi:</Text>
                                    <Text style={styles.newStatusValue}>
                                        {item.new_status === "to'langan" ? "To'langan" : "Qarz"}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                ) : (
                    <Text style={styles.message}>
                        {item.request_type === 'DELETE'
                            ? "Yozuvni o'chirish so'rovi"
                            : `Holatni "${item.new_status}" ga o'zgartirish so'rovi`}
                    </Text>
                )}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => rejectRequest(item.id)}
                >
                    <X size={20} color="#ef4444" />
                    <Text style={styles.rejectText}>Rad etish</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={() => approveRequest(item.id)}
                >
                    <Check size={20} color="#ffffff" />
                    <Text style={styles.approveText}>Tasdiqlash</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screenHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.title}>Bildirishnomalar</Text>
                {relevantRequests.length > 0 ? (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{relevantRequests.length}</Text>
                    </View>
                ) : <View style={{ width: 24 }} />}
            </View>

            <FlatList
                data={relevantRequests}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Bell size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Yangi bildirishnomalar yo'q</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    screenHeader: {
        padding: 16,
        paddingTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between', // Changed structure
        gap: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
    },
    list: {
        padding: 16,
        gap: 12,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    date: {
        fontSize: 12,
        color: '#94a3b8',
    },
    contentContainer: {
        marginBottom: 16,
    },
    entryDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    qtyText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#cbd5e1',
    },
    priceText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10b981',
    },
    changeInfo: {
        marginTop: 8,
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
    },
    deleteWarning: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 13,
    },
    statusChange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    oldStatus: {
        fontSize: 13,
        color: '#64748b',
    },
    newStatusValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4f46e5',
    },
    message: {
        fontSize: 15,
        color: '#334155',
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    approveButton: {
        backgroundColor: '#10b981',
    },
    rejectButton: {
        backgroundColor: '#fee2e2',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    approveText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    rejectText: {
        color: '#ef4444',
        fontWeight: '600',
    },
    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        gap: 12,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },
    badge: {
        backgroundColor: '#ef4444',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    }
});
