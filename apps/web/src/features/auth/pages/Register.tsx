import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@distitrack/common';

export const Register: React.FC = () => {
    const [step, setStep] = useState<'register' | 'verify'>('register');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form setup
    const { register, handleSubmit, formState: { errors }, getValues } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.full_name,
                    },
                },
            });

            if (error) throw error;

            if (authData.session) {
                navigate('/dashboard');
            } else {
                setStep('verify');
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const email = getValues('email');
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otpCode,
                type: 'signup',
            });

            if (error) throw error;

            if (data.session) {
                navigate('/dashboard');
            } else {
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please check the code.');
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
                <motion.div className="text-center mb-8" variants={itemVariants}>
                    <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 mb-6 relative group"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <UserPlus size={36} />
                        <motion.div
                            className="absolute -top-2 -right-2 bg-amber-400 text-white p-1.5 rounded-full shadow-lg"
                            animate={{ rotate: [0, 15, 0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Sparkles size={14} />
                        </motion.div>
                    </motion.div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                        {step === 'register' ? 'Hisob yaratish' : 'Tasdiqlash'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                        {step === 'register'
                            ? "Distitrack oilasiga qo'shiling va biznesingizni yangi bosqichga olib chiqing"
                            : "Emailingizga yuborilgan tasdiqlash kodini kiriting"
                        }
                    </p>
                </motion.div>

                {/* Card */}
                <motion.div
                    className="glass-card rounded-[2.5rem] p-10 border border-white/20 shadow-2xl backdrop-blur-xl bg-white/40 dark:bg-slate-900/40"
                    variants={itemVariants}
                >
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 text-sm text-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100/50 dark:border-red-900/20 flex items-center gap-3"
                            >
                                <ShieldCheck size={18} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {step === 'register' ? (
                            <motion.form
                                key="register-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <motion.div className="space-y-2" variants={itemVariants}>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                        To'liq ismingiz
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            {...register('full_name')}
                                            type="text"
                                            className={`w-full pl-11 pr-4 py-4 bg-white/50 border ${errors.full_name ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium`}
                                            placeholder="Ism Familiya"
                                        />
                                    </div>
                                    {errors.full_name && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-red-500 ml-1">{errors.full_name.message}</motion.p>
                                    )}
                                </motion.div>

                                <motion.div className="space-y-2" variants={itemVariants}>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                        Email manzil
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            {...register('email')}
                                            type="email"
                                            className={`w-full pl-11 pr-4 py-4 bg-white/50 border ${errors.email ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium`}
                                            placeholder="example@mail.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-red-500 ml-1">{errors.email.message}</motion.p>
                                    )}
                                </motion.div>

                                <motion.div className="space-y-2" variants={itemVariants}>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                        Mahfiy parol
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
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-red-500 ml-1">{errors.password.message}</motion.p>
                                    )}
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
                                            <span>Ro'yxatdan o'tish</span>
                                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                        </div>
                                    )}
                                </motion.button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="verify-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleVerify}
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 py-3 px-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 inline-block">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Kodni yubordik: <span className="font-bold text-indigo-600 dark:text-indigo-400">{getValues('email')}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            required
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            className="w-full px-6 py-5 bg-white/50 border border-slate-200/50 dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white tracking-[0.5em] text-center text-3xl font-black"
                                            placeholder="••••••"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/25"
                                >
                                    {isLoading ? (
                                        <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <div className="flex items-center">
                                            <span>Kodni tasdiqlash</span>
                                            <CheckCircle2 className="ml-2" size={20} />
                                        </div>
                                    )}
                                </motion.button>

                                <button
                                    type="button"
                                    onClick={() => setStep('register')}
                                    className="w-full text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                                >
                                    Emailni o'zgartirish
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer Link */}
                <motion.p
                    className="text-center mt-10 text-slate-600 dark:text-slate-400 font-medium"
                    variants={itemVariants}
                >
                    Hisobingiz bormi?{' '}
                    <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors border-b-2 border-indigo-600/20 hover:border-indigo-600">
                        Tizimga kiring
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
};

