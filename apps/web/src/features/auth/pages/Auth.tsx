import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Sparkles, Store, UserCircle, Mail, UserPlus, CheckCircle2, Search, ChevronDown, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSchema, LoginInput, registerSchema, RegisterInput } from '@distitrack/common';

type AuthMode = 'login' | 'register' | 'verify';
type AuthRole = 'seller' | 'market';

interface Market {
    id: string;
    name: string;
}

export const Auth: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [selectedRole, setSelectedRole] = useState<AuthRole>('seller');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Register specific state
    const [markets, setMarkets] = useState<Market[]>([]);
    const [selectedMarketId, setSelectedMarketId] = useState<string>('');
    const [marketSearch, setMarketSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddingNewMarket, setIsAddingNewMarket] = useState(false);
    const [newMarketName, setNewMarketName] = useState('');
    const [newMarketPhone, setNewMarketPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const navigate = useNavigate();
    const { isAuthenticated, profile, signOut } = useAuth();

    // Forms
    const loginForm = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const registerForm = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    useEffect(() => {
        if (mode === 'register') {
            const fetchMarkets = async () => {
                const { data } = await supabase.from('markets').select('id, name').order('name');
                if (data) setMarkets(data);
            };
            fetchMarkets();
        }
    }, [mode]);

    useEffect(() => {
        if (isAuthenticated && profile) {
            const target = profile.role === 'admin' ? '/admin-dashboard' : (profile.role === 'seller' ? '/dashboard' : '/market-dashboard');
            navigate(target);
        }
    }, [isAuthenticated, profile, navigate]);

    const onLoginSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) throw error;

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !profileData) {
                await signOut();
                throw new Error('Profilingiz topilmadi. Iltimos, admin bilan bog\'laning.');
            }

            toast.success('Xush kelibsiz!');
            const target = profileData.role === 'admin' ? '/admin-dashboard' : (profileData.role === 'seller' ? '/dashboard' : '/market-dashboard');
            navigate(target);
        } catch (err: any) {
            toast.error(err.message || 'Kirishda xatolik');
        } finally {
            setIsLoading(false);
        }
    };

    const onRegisterSubmit = async (data: RegisterInput) => {
        if (selectedRole === 'market' && !selectedMarketId && !newMarketName.trim()) {
            toast.error('Iltimos, do\'konni tanlang');
            return;
        }

        setIsLoading(true);
        try {
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: { data: { full_name: data.full_name } },
            });

            if (signUpError) throw signUpError;

            if (authData.user) {
                let finalMarketId = selectedMarketId;
                if (selectedRole === 'market' && isAddingNewMarket && newMarketName.trim()) {
                    const { data: newId, error: mErr } = await supabase.rpc('create_market', {
                        market_name: newMarketName.trim(),
                        market_phone: newMarketPhone.trim()
                    });
                    if (mErr) throw mErr;
                    finalMarketId = newId;
                }

                const { error: pErr } = await supabase.rpc('create_profile_for_new_user', {
                    user_id: authData.user.id,
                    user_role: selectedRole,
                    user_market_id: selectedRole === 'market' ? finalMarketId : null,
                    user_full_name: data.full_name
                });
                if (pErr) throw pErr;
            }

            if (authData.session) {
                navigate(selectedRole === 'seller' ? '/dashboard' : '/market-dashboard');
            } else {
                setMode('verify');
            }
        } catch (err: any) {
            toast.error(err.message || 'Ro\'yxatdan o\'tishda xatolik');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const email = registerForm.getValues('email');
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otpCode,
                type: 'signup',
            });
            if (error) throw error;
            toast.success('Email tasdiqlandi!');
            navigate(selectedRole === 'seller' ? '/dashboard' : '/market-dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Kodni tasdiqlashda xatolik');
        } finally {
            setIsLoading(false);
        }
    };

    const roleConfig = {
        seller: {
            title: mode === 'login' ? 'Sotuvchi Kirish' : 'Sotuvchi bo\'ling',
            icon: selectedRole === 'seller' ? <UserCircle size={40} /> : <Store size={40} />,
            gradient: 'from-indigo-600 to-purple-600',
            glow: 'bg-indigo-500/10'
        },
        market: {
            title: mode === 'login' ? 'Do\'kon Kirish' : 'Market bo\'ling',
            icon: <Store size={40} />,
            gradient: 'from-emerald-600 to-teal-600',
            glow: 'bg-emerald-500/10'
        }
    };

    const config = roleConfig[selectedRole];
    const filteredMarkets = markets.filter(m => m.name.toLowerCase().includes(marketSearch.toLowerCase()));

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 dark:bg-[#020617] overflow-hidden">
            {/* Animated Glows */}
            <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${config.glow} blur-[120px] rounded-full animate-pulse`} />
            <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] ${config.glow} blur-[120px] rounded-full animate-pulse delay-700`} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Mode Switcher */}
                <div className="flex p-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl mb-8 border border-white/20 dark:border-slate-800/50 shadow-xl">
                    <button
                        onClick={() => setMode('login')}
                        className={`flex-1 py-3 rounded-2xl font-bold transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                    >
                        Kirish
                    </button>
                    <button
                        onClick={() => setMode('register')}
                        className={`flex-1 py-3 rounded-2xl font-bold transition-all ${mode === 'register' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                    >
                        Ro'yxatdan o'tish
                    </button>
                </div>

                {/* Role Switcher - ONLY FOR REGISTER */}
                {mode === 'register' && (
                    <div className="flex gap-4 mb-8">
                        {(['seller', 'market'] as const).map((role) => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={`flex-1 p-4 rounded-[2rem] border transition-all flex flex-col items-center gap-2 ${selectedRole === role
                                    ? `bg-white dark:bg-slate-900 border-${role === 'seller' ? 'indigo' : 'emerald'}-500 shadow-xl`
                                    : 'bg-white/30 dark:bg-slate-900/30 border-transparent text-slate-400'}`}
                            >
                                {role === 'seller' ? <UserCircle size={24} /> : <Store size={24} />}
                                <span className="text-xs font-black uppercase tracking-widest">{role === 'seller' ? 'Sotuvchi' : "Do'kon"}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="glass-card rounded-[3rem] p-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/20 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className={`inline-flex p-5 rounded-3xl bg-gradient-to-br ${mode === 'login' ? 'from-indigo-600 to-purple-600 shadow-indigo-500/30' : config.gradient} text-white shadow-2xl mb-6 shadow-xl`}>
                            {mode === 'verify' ? <CheckCircle2 size={40} /> : (mode === 'login' ? <UserCircle size={40} /> : config.icon)}
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                            {mode === 'login' ? 'Xush kelibsiz' : config.title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            {mode === 'login' ? 'Tizimga kirish uchun malumotlarni kiriting' : 'Ro\'yxatdan o\'tish uchun malumotlarni kiriting'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {mode === 'login' ? (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input {...loginForm.register('email')} className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-medium transition-all" placeholder="example@mail.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Parol</label>
                                        <Link to="/forgot-password" className="text-xs font-bold text-indigo-600">Unutdingizmi?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input {...loginForm.register('password')} type={showPassword ? 'text' : 'password'} className="w-full pl-12 pr-12 py-4 bg-white/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-medium transition-all" placeholder="••••••••" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className={`w-full py-5 rounded-2xl bg-gradient-to-r ${config.gradient} text-white font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50`}>
                                    {isLoading ? 'Yuklanmoqda...' : 'Kirish'}
                                </button>
                            </motion.form>
                        ) : mode === 'register' ? (
                            <motion.form
                                key="register"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">To'liq ism</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input {...registerForm.register('full_name')} className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-medium transition-all" placeholder="Ism Familiya" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input {...registerForm.register('email')} className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-medium transition-all" placeholder="example@mail.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Parol</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input {...registerForm.register('password')} type={showPassword ? 'text' : 'password'} className="w-full pl-12 pr-12 py-4 bg-white/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-medium transition-all" placeholder="••••••••" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {selectedRole === 'market' && (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    {selectedMarketId ? markets.find(m => m.id === selectedMarketId)?.name : "Do'konni tanlang"}
                                                </span>
                                                <ChevronDown size={18} className={isDropdownOpen ? 'rotate-180 transition-all' : 'transition-all'} />
                                            </button>
                                            {isDropdownOpen && (
                                                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-2 max-h-48 overflow-y-auto">
                                                    <div className="relative mb-2">
                                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input value={marketSearch} onChange={e => setMarketSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl outline-none" placeholder="Qidirish..." />
                                                    </div>
                                                    {filteredMarkets.map(m => (
                                                        <button key={m.id} type="button" onClick={() => { setSelectedMarketId(m.id); setIsAddingNewMarket(false); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">{m.name}</button>
                                                    ))}
                                                    <button type="button" onClick={() => { setIsAddingNewMarket(true); setSelectedMarketId(''); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 mt-1 border-t border-slate-100 text-emerald-600 text-sm font-bold">+ Yangi do'kon</button>
                                                </div>
                                            )}
                                        </div>
                                        {isAddingNewMarket && (
                                            <div className="space-y-4 pt-2">
                                                <input value={newMarketName} onChange={e => setNewMarketName(e.target.value)} className="w-full p-4 bg-emerald-50/30 border border-emerald-200 rounded-2xl outline-none" placeholder="Do'kon nomi" />
                                                <input value={newMarketPhone} onChange={e => setNewMarketPhone(e.target.value)} className="w-full p-4 bg-emerald-50/30 border border-emerald-200 rounded-2xl outline-none" placeholder="Telefon (+998 ...)" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button type="submit" disabled={isLoading} className={`w-full py-5 rounded-2xl bg-gradient-to-r ${config.gradient} text-white font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50`}>
                                    {isLoading ? 'Yuklanmoqda...' : 'Ro\'yxatdan o\'tish'}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="verify"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onSubmit={handleVerify}
                                className="space-y-8"
                            >
                                <div className="text-center">
                                    <p className="text-slate-500 text-sm mb-6">Emailingizga yuborilgan 6 xonali kodni kiriting</p>
                                    <input value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full text-center text-4xl font-black tracking-[0.5em] py-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border-none outline-none focus:ring-4 focus:ring-emerald-500/10" maxLength={6} placeholder="000000" />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest shadow-xl">Tasdiqlash</button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
