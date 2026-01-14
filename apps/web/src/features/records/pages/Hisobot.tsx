import React, { useState, useMemo } from 'react';
import { DollarSign, CheckCircle2, XCircle, Package as PackageIcon, Calendar, TrendingUp } from 'lucide-react';
import { useEntries } from '../../../hooks/useEntries';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';
import { PageTransition } from '../../../components/layout/PageTransition';

// Animation Variants matching mobile feel
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 30
        }
    }
} as const;

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-[20px] p-4 border-l-4 shadow-sm hover:shadow-md transition-all group`} style={{ borderLeftColor: color }}>
        <div className="flex justify-between items-center mb-3">
            <div className={`p-2 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
                <Icon size={20} style={{ color }} />
            </div>
            <TrendingUp size={14} className="text-emerald-500" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{value}</h3>
    </div>
);

export const Hisobot: React.FC = () => {
    const { entries } = useEntries();
    const { profile } = useAuth();
    const [filter, setFilter] = useState<'all' | "to'langan" | "to'lanmagan">('all');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('uz-UZ').format(price);
    };

    // Parity with mobile's role-based filtering logic
    const filteredByRole = useMemo(() => {
        if (!profile) return [];
        if (profile.role === 'market') {
            return entries.filter(e => e.marketNomi === profile.full_name);
        }
        return entries; // For sellers, entries are already filtered by user_id in the hook/context usually, 
        // but we follow mobile's logic of current user's entries.
    }, [entries, profile]);

    const stats = useMemo(() => {
        const total = filteredByRole.reduce((acc, e) => acc + (Number(e.summa) || 0), 0);
        const paid = filteredByRole.filter(e => e.tolovHolati === "to'langan").reduce((acc, e) => acc + (Number(e.summa) || 0), 0);
        const unpaid = total - paid;
        return { total, paid, unpaid };
    }, [filteredByRole]);

    const filteredEntries = useMemo(() => {
        return filteredByRole.filter(e => filter === 'all' || e.tolovHolati === filter);
    }, [filteredByRole, filter]);

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors">
                {/* Header Section */}
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Hisobotlar</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Sizning moliyaviy natijalaringiz</p>
                </header>

                {/* Stats Grid - 1:1 with mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    <StatCard
                        label="Umumiy"
                        value={formatPrice(stats.total)}
                        icon={DollarSign}
                        color="#4f46e5"
                    />
                    <StatCard
                        label="To'langan"
                        value={formatPrice(stats.paid)}
                        icon={CheckCircle2}
                        color="#10b981"
                    />
                    <StatCard
                        label="To'lanmagan"
                        value={formatPrice(stats.unpaid)}
                        icon={XCircle}
                        color="#ef4444"
                    />
                </div>

                {/* Filters - Segmented style */}
                <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex gap-1 mb-8 shadow-inner">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${filter === 'all'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        Barchasi
                    </button>
                    <button
                        onClick={() => setFilter("to'langan")}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${filter === "to'langan"
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        To'langan
                    </button>
                    <button
                        onClick={() => setFilter("to'lanmagan")}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${filter === "to'lanmagan"
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        To'lanmagan
                    </button>
                </div>


                <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {filteredEntries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                            <PackageIcon size={48} className="text-slate-300" />
                            <p className="mt-3 text-sm font-bold text-slate-400">Ma'lumotlar mavjud emas</p>
                        </div>
                    ) : (
                        filteredEntries.map((e, i) => (
                            <motion.div
                                key={e.id || i}
                                variants={itemVariants}
                                className="bg-white dark:bg-slate-800 p-5 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                                            {e.mahsulotTuri}
                                            <span className={`text-xs font-bold ml-1.5 ${e.tolovHolati === "to'langan" ? 'text-emerald-500' : 'text-red-500'}`}>
                                                ({e.tolovHolati === "to'langan" ? "To'langan" : "To'lanmagan"})
                                            </span>
                                        </h3>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">{e.marketNomi}</p>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${e.tolovHolati === "to'langan"
                                        ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30'
                                        : 'bg-red-50 text-red-500 dark:bg-red-950/30'
                                        }`}>
                                        {e.tolovHolati}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-300" />
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                            {e.sana || (e.created_at ? new Date(e.created_at).toLocaleDateString() : '')}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-lg font-black ${e.tolovHolati === "to'langan" ? 'text-emerald-500' : 'text-red-500'
                                            }`}>
                                            {formatPrice(Number(e.summa) || 0)}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">UZS</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </PageTransition>
    );
};
