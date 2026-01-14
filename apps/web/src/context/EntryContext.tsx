import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Entry } from '@distitrack/common';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface EntryContextType {
    entries: Entry[];
    loading: boolean;
    addEntry: (entry: Omit<Entry, 'id' | 'sana'>) => Promise<void>;
    updateEntry: (id: string, updatedEntry: Partial<Entry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
}

const EntryContext = createContext<EntryContextType | undefined>(undefined);

export const EntryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchEntries();
        } else {
            setEntries([]);
            setLoading(false);
        }
    }, [user]);

    const fetchEntries = async () => {
        setLoading(true);
        // Optimize: select only needed fields instead of *
        const { data: entriesData, error: entriesError } = await supabase
            .from('entries')
            .select('id, client, izoh, mahsulot, miqdor, narx, holat, sana, created_at, user_id')
            .order('created_at', { ascending: false });

        if (entriesError) {
            console.error('Error fetching entries:', entriesError);
        } else if (entriesData) {
            // Fetch profiles separately
            const userIds = [...new Set(entriesData.map(e => e.user_id))].filter(Boolean);
            let profilesMap: Record<string, any> = {};

            if (userIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', userIds);

                profilesMap = (profilesData || []).reduce((acc: any, p: any) => ({
                    ...acc,
                    [p.id]: p
                }), {});
            }

            // Map DB columns to Frontend Entry shape
            const mappedEntries: Entry[] = entriesData.map((row: any) => ({
                id: row.id,
                marketNomi: row.client,
                marketRaqami: row.izoh || '',
                mahsulotTuri: row.mahsulot,
                miqdori: row.miqdor,
                narx: row.narx,
                tolovHolati: row.holat as any,
                sana: row.sana,
                summa: row.summa || 0,
                created_at: row.created_at,
                sellerName: profilesMap[row.user_id]?.full_name,
                sellerAvatar: profilesMap[row.user_id]?.avatar_url,
            }));
            setEntries(mappedEntries);
        }
        setLoading(false);
    };

    const addEntry = async (entry: Omit<Entry, 'id' | 'sana'>) => {
        if (!user) return;

        try {
            // Price (narx) is already the total price for the order, not per unit
            const priceStr = entry.narx.replace(/[^\d.]/g, '') || '0';
            const price = parseFloat(priceStr) || 0;

            // Save ALL information to Supabase including price
            // Note: narx is the total price, summa should be the same as narx
            const dbEntry = {
                user_id: user.id, // Seller ID
                client: entry.marketNomi, // Market name
                mahsulot: entry.mahsulotTuri, // Product name
                miqdor: entry.miqdori, // Quantity
                narx: entry.narx, // Total price (saved as string for display)
                holat: entry.tolovHolati, // Payment status
                izoh: entry.marketRaqami, // Phone number/notes
                summa: entry.narx, // Total amount (same as price since price is total)
                sana: new Date().toISOString().split('T')[0], // Date
                created_at: new Date().toISOString() // Timestamp
            };

            const { data, error } = await supabase
                .from('entries')
                .insert([dbEntry])
                .select()
                .single();

            if (error) {
                console.error('Error adding entry:', error);
                alert(`Error saving: ${error.message}`);
            } else if (data) {
                // Map back to Frontend Entry
                const newEntry: Entry = {
                    id: data.id,
                    marketNomi: data.client,
                    marketRaqami: data.izoh || '',
                    mahsulotTuri: data.mahsulot,
                    miqdori: data.miqdor,
                    narx: data.narx,
                    summa: Number(data.summa) || 0,
                    tolovHolati: data.holat as any,
                    sana: data.sana,
                };
                setEntries([newEntry, ...entries]);
            }
        } catch (error: any) {
            console.error('Error in addEntry:', error);
            alert(`Error saving: ${error.message || 'Noma\'lum xatolik'}`);
        }
    };

    const updateEntry = async (id: string, updatedEntry: Partial<Entry>) => {
        if (!user) return;

        const currentEntry = entries.find(e => e.id === id);
        if (!currentEntry) {
            toast.error('Yozuv topilmadi');
            return;
        }

        // Prevent modification if already paid or pending
        if (currentEntry.tolovHolati === "to'langan") {
            toast.error("To'langan yozuvni o'zgartirib bo'lmaydi");
            return;
        }

        if (currentEntry.tolovHolati === "kutilmoqda") {
            toast.error("Tasdiqlash kutilayotgan yozuvni o'zgartirib bo'lmaydi");
            return;
        }

        // Check if payment status is being changed to 'to'langan'
        const isChangingToPaid = updatedEntry.tolovHolati === "to'langan";

        if (isChangingToPaid) {
            // Get the current entry to check its status
            const currentEntry = entries.find(e => e.id === id);
            if (!currentEntry) {
                alert('Yozuv topilmadi');
                return;
            }

            // If it's already paid, update directly
            if (currentEntry.tolovHolati === "to'langan") {
                // Just update directly since it's already paid
            } else {
                // Get the entry from database to get market_id
                const { data: entryData, error: entryError } = await supabase
                    .from('entries')
                    .select('client, holat, market_id')
                    .eq('id', id)
                    .single();

                if (entryError || !entryData) {
                    alert('Yozuv ma\'lumotlarini olishda xatolik');
                    return;
                }

                let marketId = entryData.market_id;

                // If market_id is not set, look it up by market name
                if (!marketId) {
                    const { data: marketData, error: marketError } = await supabase
                        .from('markets')
                        .select('id')
                        .eq('name', entryData.client)
                        .single();

                    if (marketError || !marketData) {
                        alert('Market ma\'lumotlarini topishda xatolik');
                        return;
                    }
                    marketId = marketData.id;
                }

                // Create a payment confirmation request
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
                    // If table doesn't exist, just update the entry directly
                    if (confirmationError.code === '42P01' || confirmationError.message?.includes('does not exist')) {
                        console.warn('Payment confirmations table does not exist. Updating entry directly.');
                        // Update the entry directly since confirmation system isn't set up yet
                        const { error: directUpdateError } = await supabase
                            .from('entries')
                            .update({ holat: "to'langan" })
                            .eq('id', id);

                        if (directUpdateError) {
                            console.error('Error updating entry:', directUpdateError);
                            alert(`Xatolik: ${directUpdateError.message}`);
                        } else {
                            setEntries(entries.map(e => e.id === id ? { ...e, tolovHolati: "to'langan" } : e));
                        }
                        return;
                    }
                    console.error('Error creating confirmation request:', confirmationError);
                    alert(`Tasdiqlash so\'rovi yaratishda xatolik: ${confirmationError.message}`);
                    return;
                }

                // Update entry status to "kutilmoqda" (waiting for confirmation) in database
                const { error: statusUpdateError } = await supabase
                    .from('entries')
                    .update({ holat: 'kutilmoqda' })
                    .eq('id', id);

                if (statusUpdateError) {
                    console.error('Error updating entry status to waiting:', statusUpdateError);
                }

                // Update other fields (not payment status) if needed
                const dbUpdate: any = {};
                if (updatedEntry.marketNomi !== undefined) dbUpdate.client = updatedEntry.marketNomi;
                if (updatedEntry.mahsulotTuri !== undefined) dbUpdate.mahsulot = updatedEntry.mahsulotTuri;
                if (updatedEntry.miqdori !== undefined) dbUpdate.miqdor = updatedEntry.miqdori;
                if (updatedEntry.narx !== undefined) dbUpdate.narx = updatedEntry.narx;
                if (updatedEntry.marketRaqami !== undefined) dbUpdate.izoh = updatedEntry.marketRaqami;

                // Update other fields if there are any
                if (Object.keys(dbUpdate).length > 0) {
                    const { error: updateError } = await supabase
                        .from('entries')
                        .update(dbUpdate)
                        .eq('id', id);

                    if (updateError) {
                        console.error('Error updating entry:', updateError);
                    }
                }

                // Update local state to show "kutilmoqda" (waiting) status
                setEntries(entries.map(e => e.id === id ? { ...e, ...updatedEntry, tolovHolati: 'kutilmoqda' } : e));

                toast.success('Tasdiqlash so\'rovi yuborildi', {
                    description: 'Market tasdigini kutmoqda...'
                });
                return;
            }
        }

        // For non-payment status changes or other updates, update directly
        const dbUpdate: any = {};
        if (updatedEntry.marketNomi !== undefined) dbUpdate.client = updatedEntry.marketNomi;
        if (updatedEntry.mahsulotTuri !== undefined) dbUpdate.mahsulot = updatedEntry.mahsulotTuri;
        if (updatedEntry.miqdori !== undefined) dbUpdate.miqdor = updatedEntry.miqdori;
        if (updatedEntry.narx !== undefined) dbUpdate.narx = updatedEntry.narx;
        if (updatedEntry.tolovHolati !== undefined) dbUpdate.holat = updatedEntry.tolovHolati;
        if (updatedEntry.marketRaqami !== undefined) dbUpdate.izoh = updatedEntry.marketRaqami;

        const { error } = await supabase
            .from('entries')
            .update(dbUpdate)
            .eq('id', id);

        if (error) {
            console.error('Error updating entry:', error);
            alert(`Error updating: ${error.message}`);
        } else {
            setEntries(entries.map(e => e.id === id ? { ...e, ...updatedEntry } : e));
        }
    };

    const deleteEntry = async (id: string) => {
        const currentEntry = entries.find(e => e.id === id);
        if (currentEntry?.tolovHolati === "to'langan") {
            toast.error("To'langan yozuvni o'chirib bo'lmaydi");
            return;
        }

        const { error } = await supabase
            .from('entries')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting entry:', error);
        } else {
            setEntries(entries.filter(e => e.id !== id));
        }
    };

    return (
        <EntryContext.Provider value={{ entries, loading, addEntry, updateEntry, deleteEntry }}>
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
