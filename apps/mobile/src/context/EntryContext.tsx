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
                };
                setEntries([newEntry, ...entries]);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateEntry = async (id: string, updatedEntry: Partial<Entry>) => {
        const dbUpdate: any = {};
        if (updatedEntry.marketNomi !== undefined) dbUpdate.client = updatedEntry.marketNomi;
        if (updatedEntry.mahsulotTuri !== undefined) dbUpdate.mahsulot = updatedEntry.mahsulotTuri;
        if (updatedEntry.miqdori !== undefined) dbUpdate.miqdor = updatedEntry.miqdori;
        if (updatedEntry.narx !== undefined) dbUpdate.narx = updatedEntry.narx;
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
