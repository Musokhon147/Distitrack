import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

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

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo or Brand Name */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-4 animate-bounce-subtle">
                        <User size={32} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Xush kelibsiz
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Tizimga kirish uchun ma'lumotlaringizni kiriting
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                Email yoki Login
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    {...register('email')}
                                    type="text"
                                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} dark:bg-slate-900/50 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                                    placeholder="example@mail.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Parol
                                </label>
                                <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
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
                                    className={`w-full pl-11 pr-12 py-3 bg-slate-50 border ${errors.password ? 'border-red-500' : 'border-slate-200'} dark:bg-slate-900/50 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white`}
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
                                <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Kirish
                                    <ArrowRight className="ml-2" size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Link */}
                <p className="text-center mt-8 text-slate-600 dark:text-slate-400">
                    Hisobingiz yo'qmi?{' '}
                    <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        Ro'yxatdan o'ting
                    </Link>
                </p>
            </div>
        </div>
    );
};
