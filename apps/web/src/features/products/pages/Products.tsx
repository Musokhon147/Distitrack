import React, { useState } from 'react';
import { useProducts } from '../../../context/ProductContext';
import { Plus, Trash2, Package, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { PageTransition } from '../../../components/layout/PageTransition';

export const Products: React.FC = () => {
    const { products, addProduct, deleteProduct } = useProducts();
    const [newProduct, setNewProduct] = useState({ name: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newProduct.name) {
            try {
                await addProduct(newProduct);
                setNewProduct({ name: '' });
            } catch (error) {
                // Error is already handled in ProductContext with toast
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Mahsulotlar</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Sotiladigan mahsulot turlari ro'yxati</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Product Form */}
                    <motion.div variants={itemVariants} className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 sticky top-24">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    <Plus size={20} />
                                </div>
                                Yangi qo'shish
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 mb-1 block">Mahsulot Turi</label>
                                    <div className="relative">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Masalan: Telefon, Maishiy texnika"
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all font-medium"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} />
                                    Qo'shish
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Products List */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search */}
                        <motion.div variants={itemVariants} className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Qidirish..."
                                className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border-none rounded-[1.5rem] shadow-sm text-lg outline-none dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </motion.div>

                        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {filteredProducts.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        variants={itemVariants}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-[3rem] -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
                                                        <Package size={24} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{product.name}</h3>
                                                </div>
                                                <button
                                                    onClick={() => deleteProduct(product.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {filteredProducts.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-400">
                                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Mahsulotlar topilmadi</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </PageTransition>
    );
};
