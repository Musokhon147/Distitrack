import React, { useState } from 'react';
import { Mail, ArrowRight, Sparkles, KeyRound, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setIsSent(true);
        } catch (err: any) {
            setError(err.message || 'Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-[#020617]">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            <motion.div
                className="w-full max-w-md relative z-10"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header */}
                <motion.div className="text-center mb-8" variants={itemVariants}>
                    <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 mb-6 relative group"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <KeyRound size={36} />
                        <motion.div
                            className="absolute -top-2 -right-2 bg-amber-400 text-white p-1.5 rounded-full shadow-lg"
                            animate={{ rotate: [0, 15, 0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Sparkles size={14} />
                        </motion.div>
                    </motion.div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                        Parolni tiklash
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                        Elektron pochta manzilingizni kiriting va biz sizga tiklash havolasini yuboramiz
                    </p>
                </motion.div>

                {/* Card */}
                <motion.div
                    className="glass-card rounded-[2.5rem] p-10 border border-white/20 shadow-2xl backdrop-blur-xl bg-white/40 dark:bg-slate-900/40"
                    variants={itemVariants}
                >
                    <AnimatePresence mode="wait">
                        {!isSent ? (
                            <motion.form
                                key="forgot-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-4 text-sm text-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100/50 dark:border-red-900/20"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <motion.div className="space-y-2" variants={itemVariants}>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                        Email manzil
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-4 bg-white/50 border border-slate-200/50 dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium"
                                            placeholder="example@mail.com"
                                        />
                                    </div>
                                </motion.div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/25 relative overflow-hidden"
                                >
                                    {isLoading ? (
                                        <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <div className="flex items-center">
                                            <span>Havolani yuborish</span>
                                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                        </div>
                                    )}
                                </motion.button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success-message"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-6">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Havola yuborildi!
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-8">
                                    Iltimos, pochtangizni tekshiring. Biz sizga parolni tiklash bo'yicha ko'rsatmalarni yubordik.
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center py-3 px-8 rounded-2xl text-white font-bold bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25"
                                >
                                    Login sahifasiga qaytish
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer Link */}
                <motion.p
                    className="text-center mt-10 text-slate-600 dark:text-slate-400 font-medium"
                    variants={itemVariants}
                >
                    Esingizga tushdimi?{' '}
                    <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors border-b-2 border-indigo-600/20 hover:border-indigo-600">
                        Tizimga kiring
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
};
