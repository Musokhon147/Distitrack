import React from 'react';
import { History, TrendingUp, Wallet, Clock, AlertCircle } from 'lucide-react';
import { useEntries } from '../../../hooks/useEntries';

export const Hisobot: React.FC = () => {
    const { entries } = useEntries();

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

    return (
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Total Card */}
                <div className="lg:col-span-3 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[32px] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Wallet size={120} />
                    </div>
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
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[32px] border border-emerald-100 dark:border-emerald-800/30 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-4">
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
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[32px] border border-amber-100 dark:border-amber-800/30 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400 rounded-xl">
                            <Clock size={24} />
                        </div>
                        <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Kutilmoqda</span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-3xl font-black text-amber-700 dark:text-amber-400">{formatNumber(totals.pending)}</h3>
                            <span className="text-xs font-bold text-amber-600/60 dark:text-amber-400/60">so'm</span>
                        </div>
                    </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-[32px] border border-red-100 dark:border-red-800/30 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-4">
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
                </div>
            </div>
        </div>
    );
};
