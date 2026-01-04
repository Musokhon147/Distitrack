import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { loginSchema, LoginInput } from '@distitrack/common';

// Local schema removed in favor of shared one

export const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) throw error;

            toast.success('Tizimga muvaffaqiyatli kirdingiz');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Kirishda xatolik yuz berdi');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

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
                <motion.div className="text-center mb-10" variants={itemVariants}>
                    <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 mb-6 relative"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <User size={36} />
                        <motion.div
                            className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-lg"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Sparkles size={12} />
                        </motion.div>
                    </motion.div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                        Xush kelibsiz
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Tizimga kirish uchun ma'lumotlaringizni kiriting
                    </p>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    className="glass-card rounded-[2.5rem] p-10 border border-white/20 shadow-2xl backdrop-blur-xl bg-white/40 dark:bg-slate-900/40"
                    variants={itemVariants}
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <motion.div className="space-y-2" variants={itemVariants}>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                Email yoki Login
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    {...register('email')}
                                    type="text"
                                    className={`w-full pl-11 pr-4 py-4 bg-white/50 border ${errors.email ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium`}
                                    placeholder="example@mail.com"
                                />
                            </div>
                            {errors.email && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-red-500 ml-1">{errors.email.message}</motion.p>
                            )}
                        </motion.div>

                        <motion.div className="space-y-2" variants={itemVariants}>
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Mahfiy parol
                                </label>
                                <Link to="/forgot-password" className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                                    Parolni unutdingizmi?
                                </Link>
                            </div>
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
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-red-500 ml-1">{errors.password.message}</motion.p>
                            )}
                        </motion.div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/25 relative overflow-hidden group"
                        >
                            {isLoading ? (
                                <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <div className="flex items-center">
                                    <span>Kirish</span>
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </div>
                            )}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Footer Link */}
                <motion.p
                    className="text-center mt-10 text-slate-600 dark:text-slate-400 font-medium"
                    variants={itemVariants}
                >
                    Hisobingiz yo'qmi?{' '}
                    <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors border-b-2 border-indigo-600/20 hover:border-indigo-600">
                        Ro'yxatdan o'ting
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
};
