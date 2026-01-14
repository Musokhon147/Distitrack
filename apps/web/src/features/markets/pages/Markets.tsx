import React, { useState } from 'react';
import { useMarkets } from '../../../context/MarketContext';
import { Plus, Trash2, Store, Phone, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { PageTransition } from '../../../components/layout/PageTransition';

export const Markets: React.FC = () => {
    const { markets, addMarket, deleteMarket } = useMarkets();
    const [newMarket, setNewMarket] = useState({ name: '', phone: '+998' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMarket.name) {
            addMarket(newMarket);
            setNewMarket({ name: '', phone: '+998' });
        }
    };

    const filteredMarkets = markets.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.includes(searchTerm)
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    } as const;

    return (
        <PageTransition>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto p-4 sm:p-8"
            >
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Marketlar</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Do'konlar va mijozlar ro'yxati</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Market Form */}
                    <motion.div variants={itemVariants} className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 sticky top-24">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <Plus size={20} />
                                </div>
                                Yangi qo'shish
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 mb-1 block">Nomi</label>
                                    <div className="relative">
                                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Market nomi"
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all font-medium"
                                            value={newMarket.name}
                                            onChange={(e) => setNewMarket({ ...newMarket, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 mb-1 block">Telefon</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="+998"
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all font-medium"
                                            value={newMarket.phone}
                                            onChange={(e) => setNewMarket({ ...newMarket, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} />
                                    Qo'shish
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Markets List */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search */}
                        <motion.div variants={itemVariants} className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Market nomi yoki telefon raqami bo'yicha qidirish..."
                                className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] shadow-sm text-lg outline-none dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </motion.div>

                        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {filteredMarkets.map((market) => (
                                    <motion.div
                                        key={market.id}
                                        variants={itemVariants}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-[3rem] -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-3">
                                                {market.avatar_url ? (
                                                    <img
                                                        src={market.avatar_url}
                                                        alt={market.name}
                                                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
                                                        {market.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => deleteMarket(market.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">{market.name}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 text-sm">
                                                <Phone size={14} />
                                                {market.phone || '-'}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {filteredMarkets.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full py-16 text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                        className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-6 mx-auto shadow-lg"
                                    >
                                        <Store size={48} className="text-indigo-500 dark:text-indigo-400" />
                                    </motion.div>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        {searchTerm ? 'Marketlar topilmadi' : 'Hozircha marketlar yo\'q'}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                        {searchTerm
                                            ? 'Qidiruv bo\'yicha hech narsa topilmadi. Boshqa kalit so\'z bilan qidiring.'
                                            : 'Yangi market qo\'shish uchun formadan foydalaning'}
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </PageTransition>
    );
};
