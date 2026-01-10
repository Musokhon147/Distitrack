import React from 'react';
import { motion } from 'framer-motion';
import { Store, ShoppingBag, TrendingUp, Clock, ArrowUpRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const MarketDashboard: React.FC = () => {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const stats = [
        { label: 'Jami xaridlar', value: '0', icon: <ShoppingBag />, color: 'emerald' },
        { label: 'Kutilayotgan', value: '0', icon: <Clock />, color: 'amber' },
        { label: 'Oylik o\'sish', value: '+0%', icon: <TrendingUp />, color: 'blue' },
    ];

    return (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 rounded-3xl border border-white/20 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                                <ArrowUpRight size={14} />
                                0%
                            </div>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">
                            {stat.label}
                        </h3>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                            {stat.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Placeholder for Activities */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-[2.5rem] p-8 border border-white/20 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Oxirgi xaridlar</h2>
                    <button className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Barchasini ko'rish</button>
                </div>

                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <ShoppingBag size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Hozircha xaridlar mavjud emas</p>
                </div>
            </motion.div>
        </div>
    );
};
