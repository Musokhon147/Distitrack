import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ShoppingBag, TrendingUp, ArrowUpRight, LogOut, User, Package, Calendar, DollarSign, CheckCircle2, AlertCircle, XCircle, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMarketEntries } from '../../hooks/useMarketEntries';
import { usePaymentConfirmations } from '../../hooks/usePaymentConfirmations';
import { Skeleton } from '../../components/ui/Skeleton';
import { PageTransition } from '../../components/layout/PageTransition';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { Tooltip } from '../../components/ui/Tooltip';

export const MarketDashboard: React.FC = () => {
    const { profile, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { entries, loading: entriesLoading, refreshEntries } = useMarketEntries();
    const { confirmations = [], loading: confirmationsLoading = false, approveConfirmation, rejectConfirmation } = usePaymentConfirmations();

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="text-red-500" size={48} />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Profil ma'lumotlari yuklanmadi. Iltimos, qayta kirib ko'ring.
                </p>
                <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Chiqish
                </button>
            </div>
        );
    }

    // Calculate statistics
    const stats = useMemo(() => {
        const total = entries.length;
        const paid = entries.filter(e => e.payment_status === 'to\'langan').length;
        
        // Calculate total amount - price is already the total price, just sum them
        const totalAmount = entries.reduce((sum, e) => {
            // Price field contains the total price for the order (not per unit)
            const priceStr = (e.price || '0').replace(/[^\d.]/g, '');
            const amount = parseFloat(priceStr) || 0;
            return sum + amount;
        }, 0);

        // Calculate monthly growth (simplified - compare this month vs last month)
        const now = new Date();
        const thisMonth = entries.filter(e => {
            const entryDate = new Date(e.created_at);
            return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
        }).length;
        
        const lastMonth = entries.filter(e => {
            const entryDate = new Date(e.created_at);
            const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return entryDate >= lastMonthDate && entryDate.getMonth() === lastMonthDate.getMonth();
        }).length;

        const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(0) : '0';

        return [
            { 
                label: 'Jami xaridlar', 
                value: total.toString(), 
                icon: <ShoppingBag />, 
                color: 'emerald',
                subtitle: `${paid} to'langan`
            },
            { 
                label: 'Jami summa', 
                value: new Intl.NumberFormat('en-US').format(totalAmount), 
                icon: <DollarSign />, 
                color: 'blue',
                subtitle: 'So\'m',
                growth: growth
            },
        ];
    }, [entries]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('uz-UZ', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }).format(date);
    };

    const formatNumber = (val: string) => {
        if (!val) return '0';
        // Remove all non-digit characters except decimal point
        const num = val.replace(/[^\d.]/g, '');
        const parsed = parseFloat(num);
        if (isNaN(parsed)) return '0';
        return new Intl.NumberFormat('en-US').format(parsed);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            "to'langan": { 
                icon: <CheckCircle2 size={14} />, 
                color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50',
                text: "To'langan"
            },
            "to'lanmagan": { 
                icon: <XCircle size={14} />, 
                color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700/50',
                text: "To'lanmagan"
            },
            "kutilmoqda": { 
                icon: <AlertCircle size={14} />, 
                color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700/50',
                text: 'Kutilmoqda'
            },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["kutilmoqda"];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
                {config.icon}
                {config.text}
            </span>
        );
    };

    return (
        <PageTransition>
            <div className="space-y-8">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                            <Store className="text-emerald-500" size={32} />
                            {profile?.market_name || "Do'kon"} Paneli
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            Xush kelibsiz, {profile?.full_name}! Xaridlaringizni shu yerdan kuzatib boring.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                        >
                            <LogOut size={18} />
                            Chiqish
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stats.map((stat, index) => {
                        const colorClasses = {
                            emerald: 'bg-emerald-500/10 text-emerald-500',
                            amber: 'bg-amber-500/10 text-amber-500',
                            blue: 'bg-blue-500/10 text-blue-500',
                        };
                        const colorClass = colorClasses[stat.color as keyof typeof colorClasses] || colorClasses.emerald;

                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform`}>
                                        {stat.icon}
                                    </div>
                                    {stat.growth && (
                                        <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                                            <ArrowUpRight size={14} />
                                            {stat.growth}%
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">
                                    {stat.label}
                                </h3>
                                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                                    {stat.color === 'blue' && stat.value && stat.value.includes(',') ? (
                                        <AnimatedCounter 
                                            value={parseFloat(stat.value.replace(/,/g, '')) || 0} 
                                            duration={1.5}
                                            className="text-3xl font-black"
                                        />
                                    ) : (
                                        stat.value || '0'
                                    )}
                                </p>
                                {stat.subtitle && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        {stat.subtitle}
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Payment Confirmations Section */}
                {confirmations && confirmations.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card rounded-[2.5rem] p-8 border-2 border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 backdrop-blur-xl shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">To'lov tasdiqlash so'rovlari</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {confirmations.length} ta so'rov kutmoqda
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {confirmations.map((confirmation, index) => (
                                    <motion.div
                                        key={confirmation.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white dark:bg-slate-800/80 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                                {/* Seller */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sotuvchi</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{confirmation.seller_name}</p>
                                                    </div>
                                                </div>

                                                {/* Product */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mahsulot</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{confirmation.product}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{confirmation.quantity}</p>
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                        <DollarSign size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Narxi</p>
                                                        <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{formatNumber(confirmation.price || '')} so'm</p>
                                                    </div>
                                                </div>

                                                {/* Status Change */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                        <AlertCircle size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Holati</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 line-through">{confirmation.current_status}</span>
                                                            <span className="text-xs">→</span>
                                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">To'langan</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 md:flex-col lg:flex-row">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={async () => {
                                                        try {
                                                            const success = await approveConfirmation(confirmation.id);
                                                            if (success) {
                                                                // Refresh entries immediately after approval
                                                                // The update should have completed by now
                                                                await refreshEntries();
                                                            }
                                                        } catch (error) {
                                                            console.error('Error approving confirmation:', error);
                                                        }
                                                    }}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                                                >
                                                    <Check size={18} />
                                                    Ha
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={async () => {
                                                        const success = await rejectConfirmation(confirmation.id);
                                                        if (success) {
                                                            // Immediately refresh entries to show updated status
                                                            await refreshEntries();
                                                        }
                                                    }}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all"
                                                >
                                                    <X size={18} />
                                                    Yo'q
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* Entries List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card rounded-[2.5rem] p-8 border border-white/20 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Oxirgi xaridlar</h2>
                        <Tooltip content="Ma'lumotlarni yangilash" position="bottom">
                            <button 
                                onClick={refreshEntries}
                                className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors p-2 -mr-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                                Yangilash
                            </button>
                        </Tooltip>
                    </div>

                    {entriesLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : entries.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mb-6 shadow-lg"
                            >
                                <ShoppingBag size={40} className="text-slate-400 dark:text-slate-500" />
                            </motion.div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Hozircha xaridlar mavjud emas
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                Yangi buyurtmalar kelganida bu yerda ko'rinadi
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {entries.slice(0, 10).map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -2 }}
                                        className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800/50 transition-all cursor-pointer group"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                            {/* Seller */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sotuvchi</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{entry.seller_name}</p>
                                                </div>
                                            </div>

                                            {/* Product */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mahsulot</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{entry.product}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{entry.quantity}</p>
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sana</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(entry.created_at)}</p>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                    <DollarSign size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Narxi</p>
                                                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{formatNumber(entry.price)} so'm</p>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="flex justify-end">
                                                {getStatusBadge(entry.payment_status)}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </div>
        </PageTransition>
    );
};
