import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Market {
    id: string;
    name: string;
    phone: string;
    address?: string;
    avatar_url?: string;
    created_at?: string;
}

interface MarketContextType {
    markets: Market[];
    loading: boolean;
    addMarket: (market: Omit<Market, 'id'>) => Promise<void>;
    deleteMarket: (id: string) => Promise<void>;
    refreshMarkets: () => Promise<void>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMarkets = async () => {
        try {
            const { data, error } = await supabase
                .from('markets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMarkets(data || []);
        } catch (error) {
            console.error('Error fetching markets:', error);
            toast.error('Marketlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarkets();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('markets_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'markets' }, () => {
                fetchMarkets();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const addMarket = async (market: Omit<Market, 'id'>) => {
        try {
            const { error } = await supabase
                .from('markets')
                .insert([market]);

            if (error) throw error;
            toast.success('Market muvaffaqiyatli qo\'shildi');
        } catch (error) {
            console.error('Error adding market:', error);
            toast.error('Market qo\'shishda xatolik');
            throw error;
        }
    };

    const deleteMarket = async (id: string) => {
        try {
            const { error } = await supabase
                .from('markets')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Market o\'chirildi');
        } catch (error) {
            console.error('Error deleting market:', error);
            toast.error('Market o\'chirishda xatolik');
            throw error;
        }
    };

    return (
        <MarketContext.Provider value={{ markets, loading, addMarket, deleteMarket, refreshMarkets: fetchMarkets }}>
            {children}
        </MarketContext.Provider>
    );
};

export const useMarkets = () => {
    const context = useContext(MarketContext);
    if (!context) {
        throw new Error('useMarkets must be used within a MarketProvider');
    }
    return context;
};
