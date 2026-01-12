import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export interface PaymentConfirmation {
    id: string;
    entry_id: string;
    requested_by: string;
    market_id: string;
    requested_status: 'to\'langan' | 'to\'lanmagan';
    current_status: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    // Joined data
    seller_name?: string;
    product?: string;
    quantity?: string;
    price?: string;
    market_name?: string;
}

export const usePaymentConfirmations = () => {
    const { profile } = useAuth();
    const [confirmations, setConfirmations] = useState<PaymentConfirmation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConfirmations = useCallback(async () => {
        if (!profile?.market_id) {
            setConfirmations([]);
            setLoading(false);
            setError("Market ID not found for the current user profile.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Fetch pending confirmations for this market
            const { data: confirmationsData, error: confirmationsError } = await supabase
                .from('payment_confirmations')
                .select('*')
                .eq('market_id', profile.market_id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            // If table doesn't exist yet, just return empty array (graceful degradation)
            if (confirmationsError) {
                // Check if it's a "relation does not exist" error (table not created yet)
                if (confirmationsError.code === '42P01' || confirmationsError.message?.includes('does not exist')) {
                    console.warn('Payment confirmations table does not exist yet. Please run the SQL migration.');
                    setConfirmations([]);
                    setLoading(false);
                    return;
                }
                throw confirmationsError;
            }

            if (!confirmationsData || confirmationsData.length === 0) {
                setConfirmations([]);
                setLoading(false);
                return;
            }

            // Get entry IDs and fetch entry details
            const entryIds = confirmationsData.map((c: any) => c.entry_id);
            const { data: entriesData, error: entriesError } = await supabase
                .from('entries')
                .select('id, mahsulot, miqdor, narx, client')
                .in('id', entryIds);

            if (entriesError) throw entriesError;

            // Get seller IDs and fetch seller names
            const sellerIds = [...new Set(confirmationsData.map((c: any) => c.requested_by).filter(Boolean))];
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', sellerIds);

            if (profilesError) throw profilesError;

            // Create maps for easy lookup
            const entryMap = new Map();
            if (entriesData) {
                entriesData.forEach((entry: any) => {
                    entryMap.set(entry.id, entry);
                });
            }

            const sellerMap = new Map();
            if (profilesData) {
                profilesData.forEach((profile: any) => {
                    sellerMap.set(profile.id, profile.full_name || 'Noma\'lum');
                });
            }

            // Combine data
            const mappedConfirmations: PaymentConfirmation[] = confirmationsData.map((conf: any) => {
                const entry = entryMap.get(conf.entry_id);
                return {
                    id: conf.id,
                    entry_id: conf.entry_id,
                    requested_by: conf.requested_by,
                    market_id: conf.market_id,
                    requested_status: conf.requested_status,
                    current_status: conf.current_status,
                    status: conf.status,
                    reviewed_by: conf.reviewed_by,
                    reviewed_at: conf.reviewed_at,
                    created_at: conf.created_at,
                    seller_name: sellerMap.get(conf.requested_by) || 'Noma\'lum',
                    product: entry?.mahsulot || '',
                    quantity: entry?.miqdor || '',
                    price: entry?.narx || '',
                    market_name: entry?.client || '',
                };
            });

            setConfirmations(mappedConfirmations);
        } catch (err: any) {
            console.error('Error in fetchConfirmations:', err);
            // Don't show error to user if table doesn't exist - just return empty array
            if (err.code === '42P01' || err.message?.includes('does not exist')) {
                setConfirmations([]);
                setError(null); // Don't set error for missing table
            } else {
                setError(err.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi.');
                setConfirmations([]);
            }
        } finally {
            setLoading(false);
        }
    }, [profile?.market_id]);

    useEffect(() => {
        if (profile?.market_id) {
            fetchConfirmations().catch((err) => {
                console.error('Error in useEffect fetchConfirmations:', err);
            });
        } else {
            setConfirmations([]);
            setLoading(false);
            setError(null); // Don't set error if market_id is not available yet
        }
    }, [profile?.market_id, fetchConfirmations]);

    const approveConfirmation = async (confirmationId: string) => {
        if (!profile?.id) {
            alert('Foydalanuvchi ma\'lumotlari topilmadi');
            return false;
        }

        try {
            // Get the confirmation details
            const { data: confirmation, error: fetchError } = await supabase
                .from('payment_confirmations')
                .select('entry_id, requested_status')
                .eq('id', confirmationId)
                .single();

            if (fetchError) {
                // Handle case where table doesn't exist
                if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
                    alert('To\'lov tasdiqlash jadvali hali yaratilmagan. Iltimos, SQL migratsiyani bajaring.');
                    return false;
                }
                throw new Error('Tasdiqlash so\'rovi topilmadi');
            }

            if (!confirmation) {
                throw new Error('Tasdiqlash so\'rovi topilmadi');
            }

            // Update the entry's payment status to "to'langan" (paid)
            // Explicitly set to "to'langan" regardless of what was requested
            const { data: updateData, error: updateError } = await supabase
                .from('entries')
                .update({ holat: "to'langan" })
                .eq('id', confirmation.entry_id)
                .select('id, holat');

            if (updateError) {
                console.error('Error updating entry status:', updateError);
                throw updateError;
            }

            if (!updateData || updateData.length === 0) {
                console.error('No entry was updated. Entry might not exist or RLS policy prevented update.');
                throw new Error('Yozuv yangilanmadi. Ruxsat yo\'q yoki yozuv topilmadi.');
            }

            console.log('Entry updated successfully:', updateData[0]);

            // Update the confirmation status to approved
            const { error: confirmError } = await supabase
                .from('payment_confirmations')
                .update({
                    status: 'approved',
                    reviewed_by: profile.id,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', confirmationId);

            if (confirmError) {
                console.error('Error updating confirmation status:', confirmError);
                throw confirmError;
            }

            // Refresh confirmations list (removes the approved one from pending list)
            await fetchConfirmations();
            
            toast.success('To\'lov tasdiqlandi', {
                description: 'Mahsulot holati "To\'langan" ga yangilandi'
            });
            
            return true;
        } catch (err: any) {
            console.error('Error approving confirmation:', err);
            toast.error('Tasdiqlashda xatolik', {
                description: err.message || 'Noma\'lum xatolik yuz berdi'
            });
            return false;
        }
    };

    const rejectConfirmation = async (confirmationId: string) => {
        if (!profile?.id) {
            alert('Foydalanuvchi ma\'lumotlari topilmadi');
            return false;
        }

        try {
            // Get confirmation details to revert entry status
            const { data: confirmation, error: fetchError } = await supabase
                .from('payment_confirmations')
                .select('entry_id, current_status')
                .eq('id', confirmationId)
                .single();

            if (fetchError) {
                if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
                    alert('To\'lov tasdiqlash jadvali hali yaratilmagan. Iltimos, SQL migratsiyani bajaring.');
                    return false;
                }
                throw fetchError;
            }

            // Revert entry status to original status
            if (confirmation?.entry_id && confirmation?.current_status) {
                const { error: revertError } = await supabase
                    .from('entries')
                    .update({ holat: confirmation.current_status })
                    .eq('id', confirmation.entry_id);

                if (revertError) {
                    console.error('Error reverting entry status:', revertError);
                }
            }

            // Update confirmation status to rejected
            const { error } = await supabase
                .from('payment_confirmations')
                .update({
                    status: 'rejected',
                    reviewed_by: profile.id,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', confirmationId);

            if (error) {
                throw error;
            }

            // Refresh confirmations list
            await fetchConfirmations();
            
            toast.info('So\'rov rad etildi', {
                description: 'Mahsulot holati oldingi holatiga qaytarildi'
            });
            
            return true;
        } catch (err: any) {
            console.error('Error rejecting confirmation:', err);
            toast.error('Rad etishda xatolik', {
                description: err.message || 'Noma\'lum xatolik yuz berdi'
            });
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
    };
};
