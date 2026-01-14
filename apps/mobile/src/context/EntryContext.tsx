import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Entry } from '@distitrack/common';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

interface EntryContextType {
    entries: Entry[];
    loading: boolean;
    addEntry: (entry: Omit<Entry, 'id' | 'sana'>) => Promise<void>;
    updateEntry: (id: string, updatedEntry: Partial<Entry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    refreshEntries: () => Promise<void>;
}

const EntryContext = createContext<EntryContextType | undefined>(undefined);

export const EntryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchEntries();
        } else {
            setEntries([]);
        }
    }, [user]);

    const fetchEntries = async () => {
        setLoading(true);
        try {
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
        } finally {
            setLoading(false);
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
                const newEntry: Entry = {
                    id: data.id,
                    marketNomi: data.client,
                    marketRaqami: data.izoh || '',
                    mahsulotTuri: data.mahsulot,
                    miqdori: data.miqdor,
                    narx: data.narx,
                    tolovHolati: data.holat as any,
                    sana: data.sana,
                    summa: typeof data.summa === 'number' ? data.summa : parseFloat(data.summa) || 0,
                };
                setEntries([newEntry, ...entries]);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateEntry = async (id: string, updatedEntry: Partial<Entry>) => {
        if (!user) return;

        const currentEntry = entries.find(e => e.id === id);
        if (currentEntry?.tolovHolati === "kutilmoqda") {
            Alert.alert('Ogohlantirish', "Tasdiqlash kutilayotgan yozuvni o'zgartirib bo'lmaydi");
            return;
        }

        // Check if payment status is being changed to 'to'langan'
        const isChangingToPaid = updatedEntry.tolovHolati === "to'langan";

        if (isChangingToPaid) {
            // Get the current entry state
            if (!currentEntry) {
                Alert.alert('Xatolik', 'Yozuv topilmadi');
                return;
            }

            // Only proceed if not already paid
            if (currentEntry.tolovHolati === "to'langan") {
                Alert.alert('Ogohlantirish', "To'langan yozuvni o'zgartirib bo'lmaydi");
                return;
            }

            try {
                // 1. Get market_id from entries table
                const { data: entryData, error: entryError } = await supabase
                    .from('entries')
                    .select('client, holat, market_id')
                    .eq('id', id)
                    .single();

                if (entryError || !entryData) {
                    throw new Error('Yozuv ma\'lumotlarini olishda xatolik');
                }

                let marketId = entryData.market_id;

                // 2. Lookup market_id by name if missing
                if (!marketId) {
                    const { data: marketData, error: marketError } = await supabase
                        .from('markets')
                        .select('id')
                        .eq('name', entryData.client)
                        .single();

                    if (!marketError && marketData) {
                        marketId = marketData.id;
                    }
                }

                if (!marketId) {
                    throw new Error('Market ma\'lumotlarini topishda xatolik. Iltimos, market nomini tekshiring.');
                }

                // 3. Create payment confirmation request
                const { error: confirmationError } = await supabase
                    .from('payment_confirmations')
                    .insert([{
                        entry_id: id,
                        requested_by: user.id,
                        market_id: marketId,
                        requested_status: "to'langan",
                        current_status: entryData.holat || currentEntry.tolovHolati,
                        status: 'pending'
                    }]);

                if (confirmationError) {
                    // Fallback if table doesn't exist or other DB error
                    console.warn('Confirmation error, falling back to direct update:', confirmationError);
                    const { error: directError } = await supabase
                        .from('entries')
                        .update({ holat: "to'langan" })
                        .eq('id', id);

                    if (directError) throw directError;

                    setEntries(entries.map(e => e.id === id ? { ...e, tolovHolati: "to'langan" } : e));
                    Alert.alert('Muvaffaqiyat', 'To\'lov holati yangilandi');
                    return;
                }

                // 4. Update entry status to "kutilmoqda"
                const { error: statusUpdateError } = await supabase
                    .from('entries')
                    .update({ holat: 'kutilmoqda' })
                    .eq('id', id);

                if (statusUpdateError) console.error('Error updating status to waiting:', statusUpdateError);

                // 5. Apply other field updates if any
                const dbUpdate: any = {};
                if (updatedEntry.marketNomi !== undefined) dbUpdate.client = updatedEntry.marketNomi;
                if (updatedEntry.mahsulotTuri !== undefined) dbUpdate.mahsulot = updatedEntry.mahsulotTuri;
                if (updatedEntry.miqdori !== undefined) dbUpdate.miqdor = updatedEntry.miqdori;
                if (updatedEntry.narx !== undefined) {
                    dbUpdate.narx = updatedEntry.narx;
                    dbUpdate.summa = updatedEntry.narx.replace(/[^\d.]/g, '') || '0';
                }

                if (Object.keys(dbUpdate).length > 0) {
                    await supabase.from('entries').update(dbUpdate).eq('id', id);
                }

                setEntries(entries.map(e => e.id === id ? { ...e, ...updatedEntry, tolovHolati: 'kutilmoqda' } : e));
                Alert.alert('So\'rov yuborildi', 'To\'lov tasdiqlov kutilmoqda');
                return;
            } catch (error: any) {
                Alert.alert('Xatolik', error.message || 'Kutilmagan xatolik yuz berdi');
                return;
            }
        }

        // Standard update for other fields or if already paid
        if (currentEntry?.tolovHolati === "to'langan") {
            Alert.alert('Ogohlantirish', "To'langan yozuvni tahrirlash mumkin emas");
            return;
        }

        const dbUpdate: any = {};
        if (updatedEntry.marketNomi !== undefined) dbUpdate.client = updatedEntry.marketNomi;
        if (updatedEntry.mahsulotTuri !== undefined) dbUpdate.mahsulot = updatedEntry.mahsulotTuri;
        if (updatedEntry.miqdori !== undefined) dbUpdate.miqdor = updatedEntry.miqdori;
        if (updatedEntry.tolovHolati !== undefined) dbUpdate.holat = updatedEntry.tolovHolati;
        if (updatedEntry.marketRaqami !== undefined) dbUpdate.izoh = updatedEntry.marketRaqami;
        if (updatedEntry.narx !== undefined) {
            dbUpdate.narx = updatedEntry.narx;
            dbUpdate.summa = updatedEntry.narx.replace(/[^\d.]/g, '') || '0';
        }

        const { error } = await supabase
            .from('entries')
            .update(dbUpdate)
            .eq('id', id);

        if (error) {
            console.error('Error updating entry:', error);
            Alert.alert('Xatolik', `Yangilashda xatolik: ${error.message}`);
        } else {
            const finalUpdate = { ...updatedEntry };
            if (updatedEntry.narx) {
                (finalUpdate as any).summa = parseFloat(updatedEntry.narx.replace(/[^\d.]/g, '')) || 0;
            }
            setEntries(entries.map(e => e.id === id ? { ...e, ...finalUpdate } : e));
        }
    };

    const deleteEntry = async (id: string) => {
        const { error } = await supabase
            .from('entries')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting entry:', error);
            Alert.alert('Xatolik', 'O\'chirishda xatolik yuz berdi');
        } else {
            setEntries(entries.filter(e => e.id !== id));
        }
    };

    return (
        <EntryContext.Provider value={{ entries, loading, addEntry, updateEntry, deleteEntry, refreshEntries: fetchEntries }}>
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
