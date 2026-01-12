import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface MarketEntry {
    id: string;
    seller_id: string;
    seller_name: string | null;
    product: string;
    quantity: string;
    price: string;
    total: string;
    payment_status: 'to\'langan' | 'to\'lanmagan' | 'kutilmoqda';
    date: string;
    created_at: string;
}

export const useMarketEntries = () => {
    const { profile } = useAuth();
    const [entries, setEntries] = useState<MarketEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.market_id) {
            fetchMarketEntries();
        } else {
            setEntries([]);
            setLoading(false);
        }
    }, [profile?.market_id]);

    const fetchMarketEntries = async () => {
        if (!profile?.market_id) return;
        
        setLoading(true);
        try {
            // First, get the market name from the profile
            const { data: marketData, error: marketError } = await supabase
                .from('markets')
                .select('name')
                .eq('id', profile.market_id)
                .single();

            if (marketError) {
                console.error('Error fetching market:', marketError);
                setLoading(false);
                return;
            }

            const marketName = marketData?.name;

            if (!marketName) {
                setLoading(false);
                return;
            }

            // Fetch entries where client (market name) matches
            const { data: entriesData, error: entriesError } = await supabase
                .from('entries')
                .select('id, user_id, client, mahsulot, miqdor, narx, summa, holat, sana, created_at')
                .eq('client', marketName)
                .order('created_at', { ascending: false });

            if (entriesError) {
                console.error('Error fetching entries:', entriesError);
                setLoading(false);
                return;
            }

            if (!entriesData || entriesData.length === 0) {
                setEntries([]);
                setLoading(false);
                return;
            }

            // Get unique seller IDs
            const sellerIds = [...new Set(entriesData.map((e: any) => e.user_id).filter(Boolean))];
            
            // Fetch seller profiles
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', sellerIds);

            // Create a map of seller IDs to names
            const sellerMap = new Map();
            if (profilesData) {
                profilesData.forEach((profile: any) => {
                    sellerMap.set(profile.id, profile.full_name);
                });
            }

            // Map entries with seller names
            const mappedEntries: MarketEntry[] = entriesData.map((row: any) => ({
                id: row.id,
                seller_id: row.user_id,
                seller_name: sellerMap.get(row.user_id) || 'Noma\'lum',
                product: row.mahsulot || '',
                quantity: row.miqdor || '',
                price: row.narx || '0',
                total: row.summa || '0',
                payment_status: row.holat as 'to\'langan' | 'to\'lanmagan' | 'kutilmoqda',
                date: row.sana || '',
                created_at: row.created_at || '',
            }));

            setEntries(mappedEntries);
        } catch (error) {
            console.error('Error in fetchMarketEntries:', error);
        } finally {
            setLoading(false);
        }
    };

    return { entries, loading, refreshEntries: fetchMarketEntries };
};
