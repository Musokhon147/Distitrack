import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const resetSchema = z.object({
    password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
    message: "Parollar mos kelmadi",
    path: ["confirm_password"],
});

type ResetInput = z.infer<typeof resetSchema>;

export const ResetPassword: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<ResetInput>({
        resolver: zodResolver(resetSchema),
    });

    const onSubmit = async (data: ResetInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password
            });

            if (error) throw error;
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5 }
        }
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
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 mb-6">
                        <Lock size={36} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                        Yangi parol
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Hisobingiz uchun yangi xavfsiz parol o'rnating
                    </p>
                </div>

                {/* Card */}
                <div className="glass-card rounded-[2.5rem] p-10 border border-white/20 shadow-2xl backdrop-blur-xl bg-white/40 dark:bg-slate-900/40">
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.form
                                key="reset-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                {error && (
                                    <div className="p-4 text-sm text-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100/50 dark:border-red-900/20 flex items-center gap-3">
                                        <ShieldCheck size={18} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                        Yangi parol
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            {...register('password')}
                                            type={showPassword ? "text" : "password"}
                                            className={`w-full pl-11 pr-12 py-4 bg-white/50 border ${errors.password ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs font-medium text-red-500 ml-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                        Parolni tasdiqlash
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <input
                                            {...register('confirm_password')}
                                            type={showPassword ? "text" : "password"}
                                            className={`w-full pl-11 pr-12 py-4 bg-white/50 border ${errors.confirm_password ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {errors.confirm_password && (
                                        <p className="text-xs font-medium text-red-500 ml-1">{errors.confirm_password.message}</p>
                                    )}
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/25"
                                >
                                    {isLoading ? (
                                        <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <div className="flex items-center">
                                            <span>Parolni o'zgartirish</span>
                                            <ArrowRight className="ml-2" size={20} />
                                        </div>
                                    )}
                                </motion.button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="reset-success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-6">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                    Muvaffaqiyatli!
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-2">
                                    Parolingiz yangilandi.
                                </p>
                                <p className="text-sm text-slate-400">
                                    Siz 3 soniyadan so'ng login sahifasiga yo'naltirilasiz...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
