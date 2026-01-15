import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Entry } from '@distitrack/common';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

interface ChangeRequest {
    id: string;
    entry_id: string;
    request_type: 'DELETE' | 'UPDATE_STATUS';
    new_status?: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface EntryContextType {
    entries: Entry[];
    loading: boolean;
    pendingRequests: ChangeRequest[];
    addEntry: (entry: Omit<Entry, 'id' | 'sana'>) => Promise<void>;
    updateEntry: (id: string, updatedEntry: Partial<Entry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    refreshEntries: () => Promise<void>;
    approveRequest: (requestId: string) => Promise<void>;
    rejectRequest: (requestId: string) => Promise<void>;
}

const EntryContext = createContext<EntryContextType | undefined>(undefined);

export const EntryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [pendingRequests, setPendingRequests] = useState<ChangeRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            refreshEntries();
        } else {
            setEntries([]);
            setPendingRequests([]);
        }
    }, [user]);

    const refreshEntries = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchEntries(), fetchPendingRequests()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEntries = async () => {
        const { data, error } = await supabase
            .from('entries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching entries:', error);
        } else if (data) {
            const mappedEntries: Entry[] = data.map((row: any) => ({
                id: row.id,
                marketNomi: row.client,
                marketRaqami: row.izoh || '',
                mahsulotTuri: row.mahsulot,
                miqdori: row.miqdor,
                narx: row.narx,
                tolovHolati: row.holat as any,
                sana: row.sana,
                summa: typeof row.summa === 'number' ? row.summa : parseFloat(row.summa) || 0,
            }));
            setEntries(mappedEntries);
        }
    };

    const fetchPendingRequests = async () => {
        const { data, error } = await supabase
            .from('change_requests')
            .select('*')
            .eq('status', 'pending');

        if (error) {
            console.error('Error fetching requests:', error);
        } else if (data) {
            setPendingRequests(data as ChangeRequest[]);
        }
    };

    const getProfileInfo = async () => {
        if (!user) throw new Error('User not logged in');
        const { data, error } = await supabase
            .from('profiles')
            .select('role, market_id')
            .eq('id', user.id)
            .single();
        if (error || !data) throw new Error('Could not fetch profile info');
        return data;
    };

    const requestChange = async (
        entryId: string,
        type: 'DELETE' | 'UPDATE_STATUS',
        newStatus?: string
    ) => {
        try {
            const profile = await getProfileInfo();
            const role = profile.role;
            let marketId = profile.market_id;

            // If Seller, we need to find the market_id for this entry
            if (role === 'seller') {
                const { data: entryData, error: entryError } = await supabase
                    .from('entries')
                    .select('client, market_id')
                    .eq('id', entryId)
                    .single();

                if (entryError || !entryData) throw new Error('Entry not found');

                marketId = entryData.market_id;

                // Fallback: try to find market by name if market_id is null on entry
                if (!marketId) {
                    const { data: marketData } = await supabase
                        .from('markets')
                        .select('id')
                        .eq('name', entryData.client)
                        .single();
                    if (marketData) marketId = marketData.id;
                }
            }

            if (!marketId) throw new Error('Market information missing for this entry');

            // Insert Request
            const { error } = await supabase
                .from('change_requests')
                .insert([{
                    entry_id: entryId,
                    market_id: marketId,
                    requested_by: user!.id,
                    request_side: role, // 'seller' or 'market'
                    request_type: type,
                    new_status: newStatus,
                    status: 'pending'
                }]);

            if (error) throw error;

            Alert.alert(
                'So\'rov yuborildi',
                type === 'DELETE'
                    ? 'O\'chirish so\'rovi yuborildi. Tasdiqlash kutilmoqda.'
                    : 'Holat o\'zgartirish so\'rovi yuborildi. Tasdiqlash kutilmoqda.'
            );

            await fetchPendingRequests();

        } catch (error: any) {
            console.error('Request change error:', error);
            Alert.alert('Xatolik', error.message || 'So\'rov yuborishda xatolik');
        }
    };

    const addEntry = async (entry: Omit<Entry, 'id' | 'sana'>) => {
        if (!user) return;
        setLoading(true);
        try {
            const summa = entry.narx.replace(/[^\d.]/g, '') || '0';
            const dbEntry = {
                user_id: user.id,
                client: entry.marketNomi,
                mahsulot: entry.mahsulotTuri,
                miqdor: entry.miqdori,
                narx: entry.narx,
                holat: entry.tolovHolati,
                izoh: entry.marketRaqami,
                summa: summa,
                sana: new Date().toISOString().split('T')[0]
            };

            const { data, error } = await supabase
                .from('entries')
                .insert([dbEntry])
                .select()
                .single();

            if (error) {
                console.error('Error adding entry:', error);
                Alert.alert('Xatolik', `Saqlashda xatolik: ${error.message}`);
            } else if (data) {
                await fetchEntries();
            }
        } finally {
            setLoading(false);
        }
    };

    const updateEntry = async (id: string, updatedEntry: Partial<Entry>) => {
        if (!user) return;

        // Check for specific sensitive changes that require approval
        // 1. Payment Status Change
        if (updatedEntry.tolovHolati) {
            const currentEntry = entries.find(e => e.id === id);
            // If status is actually changing
            if (currentEntry && currentEntry.tolovHolati !== updatedEntry.tolovHolati) {
                // Check if it's a sensitive change (Any change to Paid, or Unpaid, usually requires check)
                // User requirement: "markets can change unpaid to paid... send confirmation"
                // And "seller... delete... send notification"
                // Let's protect ALL status changes via workflow for consistency, or just the ones requested.
                // "market... change unpaid to paid... send confirmation to seller"

                // Let's default to Request for ANY status change to keep it safe and consistent bidirectional
                await requestChange(id, 'UPDATE_STATUS', updatedEntry.tolovHolati);
                return; // Stop here, don't do direct update
            }
        }

        // Standard update for non-sensitive fields (like notes, or editing typos if allowed)
        // Note: Adding a check to prevent editing other fields if "Paid" is usually good practice, but keeping simple for now.

        const dbUpdate: any = {};
        if (updatedEntry.marketNomi !== undefined) dbUpdate.client = updatedEntry.marketNomi;
        if (updatedEntry.mahsulotTuri !== undefined) dbUpdate.mahsulot = updatedEntry.mahsulotTuri;
        if (updatedEntry.miqdori !== undefined) dbUpdate.miqdor = updatedEntry.miqdori;
        if (updatedEntry.marketRaqami !== undefined) dbUpdate.izoh = updatedEntry.marketRaqami;
        if (updatedEntry.narx !== undefined) {
            dbUpdate.narx = updatedEntry.narx;
            dbUpdate.summa = updatedEntry.narx.replace(/[^\d.]/g, '') || '0';
        }

        if (Object.keys(dbUpdate).length === 0) return;

        const { error } = await supabase
            .from('entries')
            .update(dbUpdate)
            .eq('id', id);

        if (error) {
            Alert.alert('Xatolik', `Yangilashda xatolik: ${error.message}`);
        } else {
            await fetchEntries();
        }
    };

    const deleteEntry = async (id: string) => {
        // Instead of immediate delete, we request deletion
        Alert.alert(
            "O'chirishni so'rash",
            "Bu yozuvni o'chirish uchun tasdiq so'rovi yuborilsinmi?",
            [
                { text: "Bekor qilish", style: "cancel" },
                {
                    text: "So'rov yuborish",
                    style: 'destructive',
                    onPress: async () => {
                        await requestChange(id, 'DELETE');
                    }
                }
            ]
        );
    };

    const approveRequest = async (requestId: string) => {
        try {
            const { error } = await supabase.rpc('approve_change_request', { request_id: requestId });
            if (error) throw error;

            Alert.alert('Muvaffaqiyat', 'So\'rov tasdiqlandi');
            await refreshEntries();
        } catch (error: any) {
            Alert.alert('Xatolik', error.message || 'Tasdiqlashda xatolik');
        }
    };

    const rejectRequest = async (requestId: string) => {
        try {
            const { error } = await supabase
                .from('change_requests')
                .update({ status: 'rejected', reviewed_by: user?.id })
                .eq('id', requestId);

            if (error) throw error;

            Alert.alert('Muvaffaqiyat', 'So\'rov rad etildi');
            await refreshEntries();
        } catch (error: any) {
            Alert.alert('Xatolik', error.message || 'Rad etishda xatolik');
        }
    };

    return (
        <EntryContext.Provider value={{
            entries,
            loading,
            pendingRequests,
            addEntry,
            updateEntry,
            deleteEntry,
            refreshEntries,
            approveRequest,
            rejectRequest
        }}>
            {children}
        </EntryContext.Provider>
    );
};

export const useEntryContext = () => {
    const context = useContext(EntryContext);
    if (!context) {
        throw new Error('useEntryContext must be used within an EntryProvider');
    }
    return context;
};
