import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Sparkles, Store, UserCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { loginSchema, LoginInput } from '@distitrack/common';

type AuthRole = 'seller' | 'market';

export const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<AuthRole>('seller');

    const navigate = useNavigate();
    const { isAuthenticated, profile, signOut } = useAuth();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) throw error;

            // Fetch profile to verify role
            let { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            // SELF-HEALING: If profile doesn't exist, create it
            if (profileError && profileError.code === 'PGRST116') {
                const { data: newProfile, error: upsertError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        role: selectedRole,
                        full_name: authData.user.user_metadata?.full_name || 'Foydalanuvchi',
                        updated_at: new Date().toISOString()
                    })
                    .select('role')
                    .single();

                if (upsertError) throw upsertError;
                profileData = newProfile;
            } else if (profileError || !profileData) {
                await signOut();
                throw new Error('Profilingiz topilmadi');
            }

            if (profileData.role !== selectedRole) {
                await signOut();
                const roleName = selectedRole === 'seller' ? 'Sotuvchi' : "Do'kon";
                const oppositeRole = selectedRole === 'seller' ? "do'kon" : "sotuvchi";
                throw new Error(`Bu hisob ${oppositeRole} hisobi. Iltimos, "${roleName}" tugmasini tanlang.`);
            }

            toast.success('Tisimga muvaffaqiyatli kirdingiz');
            navigate(selectedRole === 'seller' ? '/dashboard' : '/market-dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Kirishda xatolik yuz berdi');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated && profile) {
            navigate(profile.role === 'seller' ? '/dashboard' : '/market-dashboard');
        }
    }, [isAuthenticated, profile, navigate]);

    const roleConfig = {
        seller: {
            title: 'Sotuvchi Kirish',
            subtitle: "Mahsulotlar va sotuvlarni boshqarish",
            icon: <UserCircle size={36} />,
            color: 'indigo',
            gradient: 'from-indigo-600 to-purple-600',
            bgGlow: 'bg-indigo-500/10'
        },
        market: {
            title: "Do'kon Kirish",
            subtitle: "Buyurtmalar va hisobotlarni ko'rish",
            icon: <Store size={36} />,
            color: 'emerald',
            gradient: 'from-emerald-600 to-teal-600',
            bgGlow: 'bg-emerald-500/10'
        }
    };

    const config = roleConfig[selectedRole];

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
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${selectedRole}-glow-1`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${config.bgGlow} blur-[120px] rounded-full animate-pulse`}
                />
                <motion.div
                    key={`${selectedRole}-glow-2`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] ${config.bgGlow} blur-[120px] rounded-full animate-pulse`}
                    style={{ animationDelay: '2s' }}
                />
            </AnimatePresence>

            <motion.div
                className="w-full max-w-md relative z-10"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Role Switcher */}
                <motion.div
                    className="flex p-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg rounded-3xl mb-8 border border-white/20 dark:border-slate-800/50 shadow-xl"
                    variants={itemVariants}
                >
                    <button
                        onClick={() => setSelectedRole('seller')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all duration-300 ${selectedRole === 'seller'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        <UserCircle size={18} />
                        <span>Sotuvchi</span>
                    </button>
                    <button
                        onClick={() => setSelectedRole('market')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all duration-300 ${selectedRole === 'market'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        <Store size={18} />
                        <span>Do'kon</span>
                    </button>
                </motion.div>

                {/* Header */}
                <motion.div className="text-center mb-10" variants={itemVariants}>
                    <motion.div
                        key={selectedRole}
                        initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${config.gradient} text-white shadow-2xl mb-6 relative`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {config.icon}
                        <motion.div
                            className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-lg"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Sparkles size={12} />
                        </motion.div>
                    </motion.div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                        {config.title}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {config.subtitle}
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
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-${config.color}-500 transition-colors`}>
                                    <User size={18} />
                                </div>
                                <input
                                    {...register('email')}
                                    type="text"
                                    className={`w-full pl-11 pr-4 py-4 bg-white/50 border ${errors.email ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-${config.color}-500/10 focus:border-${config.color}-500 outline-none transition-all dark:text-white font-medium`}
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
                                <Link to="/forgot-password" className={`text-xs font-bold text-${config.color}-600 hover:text-${config.color}-500 dark:text-${config.color}-400 transition-colors`}>
                                    Parolni unutdingizmi?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-${config.color}-500 transition-colors`}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    {...register('password')}
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full pl-11 pr-12 py-4 bg-white/50 border ${errors.password ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-${config.color}-500/10 focus:border-${config.color}-500 outline-none transition-all dark:text-white font-medium`}
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
                            className={`w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r ${config.gradient} transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl relative overflow-hidden group`}
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
                    <Link to="/register" className={`font-bold text-${config.color}-600 hover:text-${config.color}-500 dark:text-${config.color}-400 transition-colors border-b-2 border-${config.color}-600/20 hover:border-${config.color}-600`}>
                        Ro'yxatdan o'ting
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
};
