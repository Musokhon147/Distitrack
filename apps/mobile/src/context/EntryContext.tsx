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
    created_at: string;
    entry: Entry;
    market_id: string;
    requested_by: string;
    request_side: string;
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
    requestChange: (entryId: string, type: 'DELETE' | 'UPDATE_STATUS', newStatus?: string) => Promise<void>;
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

    const fetchEntries = async () => {
        if (!user) return;
        try {
            const profile = await getProfileInfo();
            let query = supabase.from('entries').select('*');

            if (profile.role === 'seller') {
                query = query.eq('user_id', user.id);
            } else if (profile.role === 'market') {
                query = query.eq('market_id', profile.market_id);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

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
        } catch (error) {
            console.error('fetchEntries error:', error);
        }
    };

    const fetchPendingRequests = async () => {
        if (!user) return;
        try {
            const profile = await getProfileInfo();
            // Use !inner to allow filtering on joined table
            let query = supabase.from('change_requests').select('*, entry:entries!inner(*)');

            if (profile.role === 'seller') {
                // Filter by the entry's owner so they see requests FROM market too
                query = query.eq('entry.user_id', user.id);
            } else if (profile.role === 'market') {
                query = query.eq('market_id', profile.market_id);
            }

            const { data, error } = await query.eq('status', 'pending');

            if (error) {
                console.error('Error fetching requests:', error);
            } else if (data) {
                const requests = data.map((req: any) => ({
                    ...req,
                    entry: req.entry ? {
                        id: req.entry.id,
                        marketNomi: req.entry.client,
                        marketRaqami: req.entry.izoh || '',
                        mahsulotTuri: req.entry.mahsulot,
                        miqdori: req.entry.miqdor,
                        narx: req.entry.narx,
                        tolovHolati: req.entry.holat as any,
                        sana: req.entry.sana,
                        summa: typeof req.entry.summa === 'number' ? req.entry.summa : parseFloat(req.entry.summa) || 0,
                    } : null
                })).filter((r: any) => r.entry !== null);

                setPendingRequests(requests as ChangeRequest[]);
            }
        } catch (error) {
            console.error('fetchPendingRequests error:', error);
        }
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

            if (role === 'seller') {
                const { data: entryData, error: entryError } = await supabase
                    .from('entries')
                    .select('client, market_id')
                    .eq('id', entryId)
                    .single();

                if (entryError || !entryData) throw new Error('Entry not found');
                marketId = entryData.market_id;

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

            const { error } = await supabase
                .from('change_requests')
                .insert([{
                    entry_id: entryId,
                    market_id: marketId,
                    requested_by: user!.id,
                    request_side: role,
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
            // Find market_id for the given market name
            const { data: marketData } = await supabase
                .from('markets')
                .select('id')
                .eq('name', entry.marketNomi)
                .single();

            const summa = entry.narx.replace(/[^\d.]/g, '') || '0';
            const dbEntry = {
                user_id: user.id,
                market_id: marketData?.id || null, // Include market_id!
                client: entry.marketNomi,
                mahsulot: entry.mahsulotTuri,
                miqdor: entry.miqdori,
                narx: entry.narx,
                holat: entry.tolovHolati,
                izoh: entry.marketRaqami,
                summa: summa,
                sana: new Date().toISOString().split('T')[0]
            };

            const { error } = await supabase
                .from('entries')
                .insert([dbEntry]);

            if (error) {
                console.error('Error adding entry:', error);
                Alert.alert('Xatolik', `Saqlashda xatolik: ${error.message}`);
            } else {
                await fetchEntries();
            }
        } finally {
            setLoading(false);
        }
    };

    const updateEntry = async (id: string, updatedEntry: Partial<Entry>) => {
        if (!user) return;

        if (updatedEntry.tolovHolati) {
            const currentEntry = entries.find(e => e.id === id);
            if (currentEntry && currentEntry.tolovHolati !== updatedEntry.tolovHolati) {
                await requestChange(id, 'UPDATE_STATUS', updatedEntry.tolovHolati);
                return;
            }
        }

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
            rejectRequest,
            requestChange
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
