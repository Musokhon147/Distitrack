import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Entry } from '@distitrack/common';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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
        const { data, error } = await supabase
            .from('entries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching entries:', error);
        } else if (data) {
            // Map DB columns to Frontend Entry shape
            const mappedEntries: Entry[] = data.map((row: any) => ({
                id: row.id,
                marketNomi: row.client,
                marketRaqami: row.izoh || '', // Using izoh for phone number based on assumption
                mahsulotTuri: row.mahsulot,
                miqdori: row.miqdor,
                narx: row.narx,
                tolovHolati: row.holat as any,
                sana: row.sana,
                // Any other fields needed?
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
        // Map partial updates
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
