import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Store, UserCircle, ChevronDown, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@distitrack/common';

type AuthRole = 'seller' | 'market';

interface Market {
    id: string;
    name: string;
}

export const Register: React.FC = () => {
    const [step, setStep] = useState<'register' | 'verify'>('register');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<AuthRole>('seller');
    const [markets, setMarkets] = useState<Market[]>([]);
    const [selectedMarketId, setSelectedMarketId] = useState<string>('');
    const [marketSearch, setMarketSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddingNewMarket, setIsAddingNewMarket] = useState(false);
    const [newMarketName, setNewMarketName] = useState('');

    // Form setup
    const { register, handleSubmit, formState: { errors }, getValues } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { isAuthenticated, profile } = useAuth();

    useEffect(() => {
        const fetchMarkets = async () => {
            const { data, error } = await supabase
                .from('markets')
                .select('id, name')
                .order('name');

            if (!error && data) {
                setMarkets(data);
            }
        };
        fetchMarkets();
    }, []);

    const onSubmit = async (data: RegisterInput) => {
        if (selectedRole === 'market' && !selectedMarketId && !newMarketName.trim()) {
            setError('Iltimos, do\'koningizni tanlang yoki yangi do\'kon nomini kiriting');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.full_name,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // Create/update profile using RPC function to bypass RLS
            if (authData.user) {
                let finalMarketId = selectedMarketId;

                // If adding a new market, create it first using RPC function
                if (selectedRole === 'market' && isAddingNewMarket && newMarketName.trim()) {
                    const { data: newMarketId, error: marketError } = await supabase
                        .rpc('create_market', { market_name: newMarketName.trim() });

                    if (marketError) {
                        console.error('Error creating market:', marketError);
                        throw new Error('Do\'kon yaratishda xatolik: ' + marketError.message);
                    }
                    finalMarketId = newMarketId;
                }

                const { error: profileError } = await supabase.rpc('create_profile_for_new_user', {
                    user_id: authData.user.id,
                    user_role: selectedRole,
                    user_market_id: selectedRole === 'market' ? finalMarketId : null,
                    user_full_name: data.full_name
                });

                if (profileError) throw profileError;
            }

            if (authData.session) {
                navigate(selectedRole === 'seller' ? '/dashboard' : '/market-dashboard');
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
                navigate(selectedRole === 'seller' ? '/dashboard' : '/market-dashboard');
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
    useEffect(() => {
        if (isAuthenticated && profile) {
            navigate(profile.role === 'seller' ? '/dashboard' : '/market-dashboard');
        }
    }, [isAuthenticated, profile, navigate]);

    const roleConfig = {
        seller: {
            title: 'Sotuvchi bo\'ling',
            subtitle: "Distitrack orqali savdolaringizni oshiring",
            icon: <UserPlus size={36} />,
            color: 'indigo',
            gradient: 'from-indigo-600 to-purple-600',
            bgGlow: 'bg-indigo-500/10'
        },
        market: {
            title: 'Do\'kon sifatida qo\'shiling',
            subtitle: "Xaridlaringizni oson boshqaring",
            icon: <Store size={36} />,
            color: 'emerald',
            gradient: 'from-emerald-600 to-teal-600',
            bgGlow: 'bg-emerald-500/10'
        }
    };

    const config = roleConfig[selectedRole];

    const filteredMarkets = markets.filter(m =>
        m.name.toLowerCase().includes(marketSearch.toLowerCase())
    );

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
                {step === 'register' && (
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
                )}

                {/* Header */}
                <motion.div className="text-center mb-8" variants={itemVariants}>
                    <motion.div
                        key={selectedRole}
                        initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${config.gradient} text-white shadow-2xl mb-6 relative group`}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {step === 'register' ? config.icon : <CheckCircle2 size={36} />}
                        <motion.div
                            className="absolute -top-2 -right-2 bg-amber-400 text-white p-1.5 rounded-full shadow-lg"
                            animate={{ rotate: [0, 15, 0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Sparkles size={14} />
                        </motion.div>
                    </motion.div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                        {step === 'register' ? config.title : 'Tasdiqlash'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                        {step === 'register'
                            ? config.subtitle
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
                                        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-${config.color}-500 transition-colors`}>
                                            <User size={18} />
                                        </div>
                                        <input
                                            {...register('full_name')}
                                            type="text"
                                            className={`w-full pl-11 pr-4 py-4 bg-white/50 border ${errors.full_name ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-${config.color}-500/10 focus:border-${config.color}-500 outline-none transition-all dark:text-white font-medium`}
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
                                        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-${config.color}-500 transition-colors`}>
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            {...register('email')}
                                            type="email"
                                            className={`w-full pl-11 pr-4 py-4 bg-white/50 border ${errors.email ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-${config.color}-500/10 focus:border-${config.color}-500 outline-none transition-all dark:text-white font-medium`}
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

                                <AnimatePresence>
                                    {selectedRole === 'market' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                                Do'koningizni tanlang
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                    className={`w-full flex items-center justify-between px-4 py-4 bg-white/50 border ${!selectedMarketId ? 'border-amber-500/50' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-white text-left font-medium`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Store size={18} className="text-emerald-500" />
                                                        <span>
                                                            {selectedMarketId
                                                                ? markets.find(m => m.id === selectedMarketId)?.name
                                                                : "Do'konni tanlang..."}
                                                        </span>
                                                    </div>
                                                    <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {isDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                                                        >
                                                            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                                                                <div className="relative">
                                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                    <input
                                                                        type="text"
                                                                        value={marketSearch}
                                                                        onChange={(e) => setMarketSearch(e.target.value)}
                                                                        placeholder="Qidirish..."
                                                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                                                {filteredMarkets.length > 0 ? (
                                                                    filteredMarkets.map((market) => (
                                                                        <button
                                                                            key={market.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedMarketId(market.id);
                                                                                setIsAddingNewMarket(false);
                                                                                setNewMarketName('');
                                                                                setIsDropdownOpen(false);
                                                                            }}
                                                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${selectedMarketId === market.id
                                                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                                                }`}
                                                                        >
                                                                            {market.name}
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <p className="p-4 text-center text-sm text-slate-400">Do'kon topilmadi</p>
                                                                )}
                                                                {/* Add New Market Button */}
                                                                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setIsAddingNewMarket(true);
                                                                            setSelectedMarketId('');
                                                                            setIsDropdownOpen(false);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <span className="text-lg">+</span>
                                                                        Yangi do'kon qo'shish
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* New Market Name Input */}
                                            <AnimatePresence>
                                                {isAddingNewMarket && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-4 space-y-2"
                                                    >
                                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                                            Yangi do'kon nomi
                                                        </label>
                                                        <div className="relative group">
                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500">
                                                                <Store size={18} />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={newMarketName}
                                                                onChange={(e) => setNewMarketName(e.target.value)}
                                                                className="w-full pl-11 pr-4 py-4 bg-white/50 border border-emerald-300 dark:bg-slate-950/30 dark:border-emerald-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium"
                                                                placeholder="Do'kon nomini kiriting..."
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsAddingNewMarket(false);
                                                                setNewMarketName('');
                                                            }}
                                                            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                                                        >
                                                            ← Mavjud do'konlardan tanlash
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

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
                                    <div className={`bg-${config.color}-50 dark:bg-${config.color}-900/20 py-3 px-4 rounded-2xl border border-${config.color}-100 dark:border-${config.color}-900/30 inline-block`}>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Kodni yubordik: <span className={`font-bold text-${config.color}-600 dark:text-${config.color}-400`}>{getValues('email')}</span>
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
                                            className={`w-full px-6 py-5 bg-white/50 border border-slate-200/50 dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-${config.color}-500/10 focus:border-${config.color}-500 outline-none transition-all dark:text-white tracking-[0.2em] text-center text-3xl font-black`}
                                            placeholder="••••••••"
                                            maxLength={8}
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white font-bold bg-gradient-to-r ${selectedRole === 'seller' ? config.gradient : 'from-emerald-500 to-teal-600'} transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl`}
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
                                    className={`w-full text-sm font-semibold text-slate-500 hover:text-${config.color}-600 dark:hover:text-${config.color}-400 transition-all`}
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
                    <Link to="/login" className={`font-bold text-${config.color}-600 hover:text-${config.color}-500 dark:text-${config.color}-400 transition-colors border-b-2 border-${config.color}-600/20 hover:border-${config.color}-600`}>
                        Tizimga kiring
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
};

