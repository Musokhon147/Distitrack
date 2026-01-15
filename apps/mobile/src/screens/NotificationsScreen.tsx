import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEntryContext } from '../context/EntryContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useMarkets } from '../context/MarketContext';
import { Check, X, Bell } from 'lucide-react-native';

export const NotificationsScreen = () => {
    const { pendingRequests, refreshEntries, approveRequest, rejectRequest, loading } = useEntryContext();
    const { user } = useAuth();
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
        // Only show requests that require MY attention
        // If I am Market, I want to see requests from 'seller' where market_id matches mine
        // If I am Seller, I want to see requests from 'market' regarding my entries

        if (!profile) return false;

        const isMyMarketRequest =
            profile.role === 'market' &&
            req.request_side === 'seller' &&
            req.market_id === profile.market_id;

        // For seller, we need to check if we own the entry (this is tricky without extensive joins in JS)
        // But RLS filters `change_requests` select.
        // The context `pendingRequests` are fetched via RLS.
        // If RLS is efficient, `pendingRequests` already contains ONLY what I can see.

        // HOWEVER, `pendingRequests` contains requests *I made* too (to see their status).
        // I only want to ACT on requests where I am the TARGET.

        // If I created the request, I shouldn't approve it.
        if (req.requested_by === user?.id) return false;

        return true;
    });

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>
                        {item.request_type === 'DELETE' ? "O'chirish" : "Holat"}
                    </Text>
                </View>
                <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>

            <Text style={styles.message}>
                {item.request_type === 'DELETE'
                    ? "Yozuvni o'chirish so'rovi"
                    : `Holatni "${item.new_status}" ga o'zgartirish so'rovi`}
            </Text>

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
                <Text style={styles.title}>Bildirishnomalar</Text>
                {relevantRequests.length > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{relevantRequests.length}</Text>
                    </View>
                )}
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
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
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
        marginBottom: 8,
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
    message: {
        fontSize: 16,
        fontWeight: '500',
        color: '#334155',
        marginBottom: 16,
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
