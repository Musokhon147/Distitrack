import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Get email and password from form (need to adding ref or name attribute to inputs first, or control inputs)
        // Since inputs are not controlled, let's use FormEvent target
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setIsLoading(false);

        if (error) {
            alert(error.message); // Simple error handling for now
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo or Brand Name */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-4 animate-bounce-subtle">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Xush kelibsiz!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Tizimga kirish uchun ma'lumotlaringizni kiriting
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                Email yoki Login
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    name="email"
                                    type="text"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                    placeholder="example@mail.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Parol
                                </label>
                                <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                    Parolni unutdingizmi?
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
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
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                                Meni eslab qol
                            </label>
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
