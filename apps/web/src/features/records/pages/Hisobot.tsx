import React, { useState } from 'react';
import { History, TrendingUp, Wallet, AlertCircle, Calendar } from 'lucide-react';
import { useEntries } from '../../../hooks/useEntries';
import { motion } from 'framer-motion';
import { PageTransition } from '../../../components/layout/PageTransition';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
} as const;

export const Hisobot: React.FC = () => {
    const { entries } = useEntries();
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const unformatNumber = (val: string) => {
        if (typeof val !== 'string') return '';
        return val.replace(/,/g, '');
    };

    const formatNumber = (val: string | number) => {
        if (!val) return '0';
        const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
        return new Intl.NumberFormat('en-US').format(parseFloat(num) || 0);
    };

    const totals = entries.reduce((acc, entry) => {
        const price = parseFloat(unformatNumber(entry.narx || '0')) || 0;
        acc.total += price;
        if (entry.tolovHolati === "to'langan") acc.paid += price;
        else if (entry.tolovHolati === 'kutilmoqda') acc.pending += price;
        else acc.unpaid += price;
        return acc;
    }, { total: 0, paid: 0, pending: 0, unpaid: 0 });

    const filteredEntries = selectedStatus
        ? entries.filter(entry => entry.tolovHolati === selectedStatus)
        : [];

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto p-4 md:p-10 bg-white dark:bg-slate-900 shadow-2xl rounded-[32px] mt-6 transition-colors min-h-[70vh]">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                            <TrendingUp size={32} />
                        </div>
                        Moliyaviy Hisobot
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg">Barcha do'konlar va mahsulotlar bo'yicha umumiy hisob-kitob ma'lumotlari</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {/* Main Total Card */}
                    <div className="lg:col-span-3 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[32px] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <span className="text-blue-100 text-sm font-black uppercase tracking-widest block mb-1">Umumiy Aylanma Summa</span>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-5xl sm:text-7xl font-black">{formatNumber(totals.total)}</h2>
                                    <span className="text-xl font-bold text-blue-200">so'm</span>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 self-start md:self-center">
                                <p className="text-blue-100 font-black uppercase tracking-widest text-xs mb-1">Jami Yozuvlar</p>
                                <span className="text-3xl font-black">{entries.length} ta</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown Cards */}
                    <button
                        onClick={() => setSelectedStatus(selectedStatus === "to'langan" ? null : "to'langan")}
                        className={`text-left p-6 rounded-[32px] border flex flex-col justify-between group transition-all duration-300 ${selectedStatus === "to'langan"
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 ring-2 ring-emerald-500 shadow-xl'
                            : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 hover:scale-[1.02] hover:shadow-lg'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4 w-full">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <Wallet size={24} />
                            </div>
                            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">To'langan</span>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{formatNumber(totals.paid)}</h3>
                                <span className="text-xs font-bold text-emerald-600/60 dark:text-emerald-400/60">so'm</span>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setSelectedStatus(selectedStatus === "to'lanmagan" ? null : "to'lanmagan")}
                        className={`text-left p-6 rounded-[32px] border flex flex-col justify-between group transition-all duration-300 ${selectedStatus === "to'lanmagan"
                            ? 'bg-red-100 dark:bg-red-900/30 border-red-500 ring-2 ring-red-500 shadow-xl'
                            : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30 hover:scale-[1.02] hover:shadow-lg'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4 w-full">
                            <div className="p-3 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400 rounded-xl">
                                <AlertCircle size={24} />
                            </div>
                            <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">To'lanmagan</span>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <h3 className="text-3xl font-black text-red-700 dark:text-red-400">{formatNumber(totals.unpaid)}</h3>
                                <span className="text-xs font-bold text-red-600/60 dark:text-red-400/60">so'm</span>
                            </div>
                        </div>
                    </button>
                </div>

                {selectedStatus && (
                    <motion.div
                        key={selectedStatus}
                        className="space-y-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-3 h-8 rounded-full ${selectedStatus === "to'langan" ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white capitalize">
                                {selectedStatus} bo'yicha batafsil ro'yxat
                            </h2>
                        </div>

                        <motion.div className="space-y-4">
                            {filteredEntries.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/50 rounded-[24px]">
                                    Ma'lumot topilmadi
                                </div>
                            ) : (
                                filteredEntries.map((entry) => (
                                    <motion.div
                                        key={entry.id}
                                        variants={itemVariants}
                                        className="p-4 sm:p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-[24px] shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                            <div className="flex items-center gap-4 w-full lg:w-auto">
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform hidden sm:block">
                                                    <Calendar size={24} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{entry.marketNomi}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-slate-400 font-mono mt-1">
                                                        <span>{entry.marketRaqami}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {entry.sana || 'Noma\'lum sana'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                                                <div className="bg-slate-50 dark:bg-slate-700/50 px-3 sm:px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                    <span className="text-[10px] text-slate-400 block uppercase font-black tracking-wider mb-1">Mahsulot</span>
                                                    <span className="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-200 truncate block">{entry.mahsulotTuri}</span>
                                                </div>
                                                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 sm:px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700/50">
                                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase font-black tracking-wider mb-1">Narx</span>
                                                    <span className="font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 truncate block">{formatNumber(entry.narx)} so'm</span>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-700/50 px-3 sm:px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700/50 col-span-2 sm:col-span-1 flex flex-col justify-center">
                                                    <span className="text-[10px] text-slate-400 block uppercase font-black tracking-wider mb-1">Holati</span>
                                                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-tight py-1 px-2 rounded-lg text-center ${entry.tolovHolati === 'to\'langan'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {entry.tolovHolati}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </PageTransition>
    );
};
