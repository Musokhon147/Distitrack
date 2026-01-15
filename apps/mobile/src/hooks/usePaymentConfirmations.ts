import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface PaymentConfirmation {
    id: string;
    entry_id: string;
    requested_by: string;
    market_id: string;
    requested_status: 'to\'langan' | 'to\'lanmagan';
    current_status: string;
    status: 'pending' | 'approved' | 'rejected';
    target_role: 'market' | 'seller';
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    // Joined data
    seller_name?: string;
    product?: string;
    quantity?: string;
    price?: string;
    summa?: string;
    market_name?: string;
}

export const usePaymentConfirmations = () => {
    const { user } = useAuth();
    const [confirmations, setConfirmations] = useState<PaymentConfirmation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConfirmations = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            // Get user profile to check role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, market_id')
                .eq('id', user.id)
                .single();

            if (!profile) return;

            let query = supabase.from('payment_confirmations').select('*');

            if (profile.role === 'market' && profile.market_id) {
                query = query.eq('market_id', profile.market_id).eq('target_role', 'market');
            } else if (profile.role === 'seller') {
                query = query.eq('target_role', 'seller');
            } else {
                setConfirmations([]);
                setLoading(false);
                return;
            }

            const { data: confirmationsData, error: confirmationsError } = await query
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (confirmationsError) throw confirmationsError;

            if (!confirmationsData || confirmationsData.length === 0) {
                setConfirmations([]);
                setLoading(false);
                return;
            }

            // Get entry details
            const entryIds = confirmationsData.map((c: any) => c.entry_id);
            const { data: entriesData, error: entriesError } = await supabase
                .from('entries')
                .select('id, mahsulot, miqdor, narx, summa, client')
                .in('id', entryIds);

            if (entriesError) throw entriesError;

            // Get requester profile details
            const requesterIds = [...new Set(confirmationsData.map((c: any) => c.requested_by).filter(Boolean))];
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, market_id, markets:market_id(name)')
                .in('id', requesterIds);

            if (profilesError) throw profilesError;

            const entryMap = new Map();
            if (entriesData) entriesData.forEach(e => entryMap.set(e.id, e));

            const profileMap = new Map();
            if (profilesData) profilesData.forEach(p => profileMap.set(p.id, p));

            const mappedConfirmations: PaymentConfirmation[] = confirmationsData.map((conf: any) => {
                const entry = entryMap.get(conf.entry_id);
                const requesterProfile = profileMap.get(conf.requested_by);

                return {
                    id: conf.id,
                    entry_id: conf.entry_id,
                    requested_by: conf.requested_by,
                    market_id: conf.market_id,
                    requested_status: conf.requested_status,
                    current_status: conf.current_status,
                    status: conf.status,
                    target_role: conf.target_role || 'market',
                    reviewed_by: conf.reviewed_by,
                    reviewed_at: conf.reviewed_at,
                    created_at: conf.created_at,
                    seller_name: requesterProfile?.full_name || 'Noma\'lum',
                    product: entry?.mahsulot || '',
                    quantity: entry?.miqdor || '',
                    price: entry?.narx || '',
                    summa: entry?.summa || '',
                    market_name: entry?.client || (requesterProfile?.markets ? (requesterProfile.markets as any).name : 'Noma\'lum'),
                };
            });

            setConfirmations(mappedConfirmations);
        } catch (err: any) {
            console.error('Error fetching confirmations:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchConfirmations();
        } else {
            setConfirmations([]);
            setLoading(false);
        }
    }, [user, fetchConfirmations]);

    const approveConfirmation = async (confirmationId: string) => {
        if (!user) return false;
        try {
            const { data: confirmation } = await supabase
                .from('payment_confirmations')
                .select('entry_id')
                .eq('id', confirmationId)
                .single();

            if (!confirmation) throw new Error('So\'rov topilmadi');

            const { error: updateError } = await supabase
                .from('entries')
                .update({ holat: "to'langan" })
                .eq('id', confirmation.entry_id);

            if (updateError) throw updateError;

            const { error: confirmError } = await supabase
                .from('payment_confirmations')
                .update({
                    status: 'approved',
                    reviewed_by: user.id,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', confirmationId);

            if (confirmError) throw confirmError;

            await fetchConfirmations();
            return true;
        } catch (err: any) {
            Alert.alert('Xatolik', err.message);
            return false;
        }
    };

    const rejectConfirmation = async (confirmationId: string) => {
        if (!user) return false;
        try {
            const { data: confirmation } = await supabase
                .from('payment_confirmations')
                .select('entry_id')
                .eq('id', confirmationId)
                .single();

            if (!confirmation) throw new Error('So\'rov topilmadi');

            await supabase
                .from('entries')
                .update({ holat: "to'lanmagan" })
                .eq('id', confirmation.entry_id);

            const { error: confirmError } = await supabase
                .from('payment_confirmations')
                .update({
                    status: 'rejected',
                    reviewed_by: user.id,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', confirmationId);

            if (confirmError) throw confirmError;

            await fetchConfirmations();
            return true;
        } catch (err: any) {
            Alert.alert('Xatolik', err.message);
            return false;
        }
    };

    const createConfirmation = async (params: {
        entry_id: string;
        requested_status: 'to\'langan' | 'to\'lanmagan';
        current_status: string;
        target_role: 'market' | 'seller';
        market_id?: string;
    }) => {
        if (!user) return false;

        try {
            const { data: existing } = await supabase
                .from('payment_confirmations')
                .select('id')
                .eq('entry_id', params.entry_id)
                .eq('status', 'pending')
                .maybeSingle();

            if (existing) {
                Alert.alert('Ogohlantirish', 'Ushbu yozuv uchun kutilayotgan so\'rov allaqachon mavjud');
                return false;
            }

            const { error: confError } = await supabase
                .from('payment_confirmations')
                .insert([{
                    entry_id: params.entry_id,
                    requested_by: user.id,
                    market_id: params.market_id,
                    requested_status: params.requested_status,
                    current_status: params.current_status,
                    status: 'pending',
                    target_role: params.target_role
                }]);

            if (confError) throw confError;

            await supabase
                .from('entries')
                .update({ holat: 'kutilmoqda' })
                .eq('id', params.entry_id);

            Alert.alert('Muvaffaqiyat', 'So\'rov muvaffaqiyatli yuborildi');
            return true;
        } catch (err: any) {
            Alert.alert('Xatolik', err.message || 'So\'rov yuborishda xatolik yuz berdi');
            return false;
        }
    };

    return {
        confirmations,
        loading,
        error,
        refreshConfirmations: fetchConfirmations,
        approveConfirmation,
        rejectConfirmation,
        createConfirmation,
    };
};
