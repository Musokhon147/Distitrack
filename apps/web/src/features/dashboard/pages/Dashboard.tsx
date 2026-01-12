import React, { useState } from 'react';
import { useEntries } from '../../../hooks/useEntries';
import { useMarkets } from '../../../context/MarketContext';
import { useProducts } from '../../../context/ProductContext';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { Check, PlusCircle, ShoppingBag, Hash, Package, CreditCard, Clock, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { PageTransition } from '../../../components/layout/PageTransition';

export const SimplifiedDashboard: React.FC = () => {
    const { addEntry } = useEntries();
    const { markets } = useMarkets();
    const { products } = useProducts();
    const [formData, setFormData] = useState<{
        marketNomi: string;
        marketRaqami: string;
        mahsulotTuri: string;
        miqdori: string;
        narx: string;
        tolovHolati: "to'langan" | "to'lanmagan" | "kutilmoqda";
    }>({
        marketNomi: '',
        marketRaqami: '+998',
        mahsulotTuri: '',
        miqdori: '',
        narx: '',
        tolovHolati: "to'lanmagan"
    });
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const formatNumber = (val: string | number) => {
        if (!val) return '';
        const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
        return new Intl.NumberFormat('en-US').format(parseFloat(num) || 0);
    };

    const unformatNumber = (val: string) => {
        if (typeof val !== 'string') return '';
        return val.replace(/,/g, '');
    };

    const handleSubmit = () => {
        const newErrors: Record<string, boolean> = {};
        
        if (!formData.marketNomi) newErrors.marketNomi = true;
        if (!formData.mahsulotTuri) newErrors.mahsulotTuri = true;
        if (!formData.miqdori) newErrors.miqdori = true;
        
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
            toast.error('Iltimos, barcha majburiy maydonlarni to\'ldiring', {
                icon: <AlertCircle size={18} />
            });
            return;
        }
        
        addEntry(formData);
        setFormData({
            marketNomi: '',
            marketRaqami: '+998',
            mahsulotTuri: '',
            miqdori: '',
            narx: '',
            tolovHolati: "to'lanmagan"
        });
        setErrors({});
        toast.success('Muvaffaqiyatli saqlandi!', {
            icon: <CheckCircle2 size={18} />
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <PageTransition>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto p-4 sm:p-8"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white/40 dark:bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/20 backdrop-blur-xl shadow-2xl">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Bo'zor Daftari
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">
                            B2B savdo va hisob-kitob tizimi • <span className="text-primary-600 dark:text-primary-400">Yangi tranzaksiya</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-primary-50 dark:bg-primary-900/20 px-6 py-3 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-primary-700 dark:text-primary-300 font-bold uppercase tracking-widest text-xs">Tizim holati: Onlayn</span>
                    </div>
                </div>

                <div className="flex justify-center">
                    {/* Form Section */}
                    <motion.div
                        variants={itemVariants}
                        className="w-full space-y-8 bg-white/60 dark:bg-slate-900/60 p-6 sm:p-12 rounded-[3rem] border border-white/30 dark:border-slate-800/50 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
                    >
                        {/* Decorative Blobs */}
                        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary-500/5 blur-[80px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary-500/5 blur-[80px] rounded-full pointer-events-none" />

                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white shadow-lg">
                                <PlusCircle size={24} />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
                                Yangi yozuv qo'shish
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                            <motion.div variants={itemVariants} className="space-y-3">
                                <CustomSelect
                                    label="Marketlar"
                                    icon={<ShoppingBag size={14} />}
                                    value={formData.marketNomi}
                                    onChange={(value) => {
                                        const selectedMarket = markets.find(m => m.name === value);
                                        setFormData({
                                            ...formData,
                                            marketNomi: value,
                                            marketRaqami: selectedMarket?.phone || formData.marketRaqami
                                        });
                                        if (errors.marketNomi) {
                                            setErrors({ ...errors, marketNomi: false });
                                        }
                                    }}
                                    options={markets.map(m => ({ id: m.id, value: m.name, label: m.name }))}
                                    placeholder="Marketni tanlang"
                                    className={errors.marketNomi ? 'border-red-500 ring-2 ring-red-500/20' : ''}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">
                                    <Hash size={14} /> Market raqami
                                </label>
                                <input
                                    type="text"
                                    placeholder="+998"
                                    className={`w-full p-5 bg-white/50 border rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none dark:text-white transition-all shadow-sm text-lg font-medium ${
                                        errors.marketRaqami 
                                            ? 'border-red-500 ring-2 ring-red-500/20 dark:border-red-500' 
                                            : 'border-slate-200/50 dark:bg-slate-950/30 dark:border-slate-800/50 focus:border-primary-500'
                                    }`}
                                    value={formData.marketRaqami}
                                    onChange={(e) => {
                                        setFormData({ ...formData, marketRaqami: e.target.value });
                                        if (errors.marketRaqami) {
                                            setErrors({ ...errors, marketRaqami: false });
                                        }
                                    }}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-3">
                                <CustomSelect
                                    label="Mahsulot turi"
                                    icon={<Package size={14} />}
                                    value={formData.mahsulotTuri}
                                    onChange={(value) => {
                                        setFormData({ ...formData, mahsulotTuri: value });
                                        if (errors.mahsulotTuri) {
                                            setErrors({ ...errors, mahsulotTuri: false });
                                        }
                                    }}
                                    options={products.map(p => ({ id: p.id, value: p.name, label: p.name }))}
                                    placeholder="Mahsulotni tanlang"
                                    className={errors.mahsulotTuri ? 'border-red-500 ring-2 ring-red-500/20' : ''}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">
                                    <PlusCircle size={14} /> Miqdori
                                </label>
                                <input
                                    type="text"
                                    placeholder="Masalan: 50 kg"
                                    className={`w-full p-5 bg-white/50 border rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none dark:text-white transition-all shadow-sm text-lg font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700 ${
                                        errors.miqdori 
                                            ? 'border-red-500 ring-2 ring-red-500/20 dark:border-red-500' 
                                            : 'border-slate-200/50 dark:bg-slate-950/30 dark:border-slate-800/50 focus:border-primary-500'
                                    }`}
                                    value={formData.miqdori}
                                    onChange={(e) => {
                                        setFormData({ ...formData, miqdori: e.target.value });
                                        if (errors.miqdori) {
                                            setErrors({ ...errors, miqdori: false });
                                        }
                                    }}
                                />
                                {errors.miqdori && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1"
                                    >
                                        <AlertCircle size={12} />
                                        Majburiy maydon
                                    </motion.p>
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">
                                    <CreditCard size={14} /> Narxi (so'm)
                                </label>
                                <input
                                    type="text"
                                    placeholder="0"
                                    className="w-full p-5 bg-white/50 border border-slate-200/50 dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none dark:text-white transition-all shadow-sm text-lg font-bold text-primary-600 dark:text-primary-400"
                                    value={formatNumber(formData.narx)}
                                    onChange={(e) => setFormData({ ...formData, narx: unformatNumber(e.target.value) })}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">
                                    {formData.tolovHolati === "to'langan" ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />} To'lov holati
                                </label>
                                <div className="flex bg-white/50 dark:bg-slate-950/30 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 relative">
                                    <motion.div
                                        className={`absolute inset-y-1.5 rounded-xl ${formData.tolovHolati === "to'langan" ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-rose-500 shadow-lg shadow-rose-500/20'}`}
                                        animate={{
                                            left: formData.tolovHolati === "to'lanmagan" ? "4px" : "50%",
                                            width: "calc(50% - 6px)",
                                            x: formData.tolovHolati === "to'langan" ? 2 : 0
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                    <button
                                        onClick={() => setFormData({ ...formData, tolovHolati: "to'lanmagan" })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-lg font-bold relative z-10 transition-colors ${formData.tolovHolati === "to'lanmagan" ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                    >
                                        <AlertCircle size={20} strokeWidth={2.5} />
                                        To'lanmagan
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, tolovHolati: "to'langan" })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-lg font-bold relative z-10 transition-colors ${formData.tolovHolati === "to'langan" ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                    >
                                        <CheckCircle2 size={20} strokeWidth={2.5} />
                                        To'langan
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="pt-10">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                className="w-full py-6 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xl font-black rounded-[1.5rem] hover:from-primary-700 hover:to-primary-600 transition-all shadow-2xl shadow-primary-500/30 flex items-center justify-center gap-4 uppercase tracking-[0.2em]"
                            >
                                <Check size={28} strokeWidth={3} />
                                Saqlash
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </PageTransition>
    );
};
