import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Store, TrendingUp, AlertCircle, Clock, ArrowUpRight, DollarSign } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PageTransition } from '../../../components/layout/PageTransition';

interface AdminStats {
    sellers: number;
    markets: number;
    transactions: number;
    revenue: number;
    pendingRequests: number;
}

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={14} />
                    {trend}
                </div>
            )}
        </div>
        <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-1">
            {typeof value === 'number' ? new Intl.NumberFormat('en-US').format(value) : value}
        </h3>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</p>
    </motion.div>
);

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats>({
        sellers: 0,
        markets: 0,
        transactions: 0,
        revenue: 0,
        pendingRequests: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAdminData = async () => {
        try {
            const [
                { count: sellerCount },
                { count: marketCount },
                { data: entryData, count: entryCount },
                { count: requestCount }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
                supabase.from('markets').select('*', { count: 'exact', head: true }),
                supabase.from('entries').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(6),
                supabase.from('change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ]);

            const totalRevenue = (entryData || []).reduce((acc, curr) => acc + (Number(curr.summa) || 0), 0);

            setStats({
                sellers: sellerCount || 0,
                markets: marketCount || 0,
                transactions: entryCount || 0,
                revenue: totalRevenue,
                pendingRequests: requestCount || 0
            });

            if (entryData) {
                setRecentActivity(entryData);
            }
        } catch (error) {
            console.error('Error fetching admin dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <PageTransition>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto space-y-8"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Admin Paneli</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Tizimning umumiy holati va statistikasi</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Sotuvchilar"
                        value={stats.sellers}
                        icon={Users}
                        color="bg-indigo-500"
                    />
                    <StatCard
                        title="Do'konlar"
                        value={stats.markets}
                        icon={Store}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        title="Tranzaksiyalar"
                        value={stats.transactions}
                        icon={TrendingUp}
                        color="bg-amber-500"
                    />
                    <StatCard
                        title="So'rovlar"
                        value={stats.pendingRequests}
                        icon={AlertCircle}
                        color="bg-rose-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Clock className="text-indigo-500" size={20} />
                                Oxirgi harakatlar
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 text-xs font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">Market</th>
                                        <th className="px-8 py-4">Mahsulot</th>
                                        <th className="px-8 py-4">Sana</th>
                                        <th className="px-8 py-4 text-right">Summa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {recentActivity.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-8 py-4 font-bold text-slate-700 dark:text-slate-300">{item.client}</td>
                                            <td className="px-8 py-4 text-slate-500 dark:text-slate-400">{item.mahsulot}</td>
                                            <td className="px-8 py-4 text-slate-400 text-sm">
                                                {new Date(item.created_at).toLocaleDateString('uz-UZ')}
                                            </td>
                                            <td className="px-8 py-4 text-right font-black text-slate-900 dark:text-white">
                                                {new Intl.NumberFormat('uz-UZ').format(item.summa)}
                                            </td>
                                        </tr>
                                    ))}
                                    {recentActivity.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">
                                                Hozircha malumotlar yo'q
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                <DollarSign size={28} />
                            </div>
                            <h3 className="text-lg font-bold opacity-80 mb-2">Umumiy Savdo</h3>
                            <p className="text-4xl font-black mb-4">
                                {new Intl.NumberFormat('uz-UZ').format(stats.revenue)} <span className="text-sm font-medium opacity-60">so'm</span>
                            </p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Tizim holati</p>
                            <p className="text-sm font-bold flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                Onlayn va xavfsiz
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </PageTransition>
    );
};
