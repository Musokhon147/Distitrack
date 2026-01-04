import React, { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileInput } from '@distitrack/common';

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileInput>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.user_metadata?.full_name || '',
        }
    });

    const onSubmit = async (data: ProfileInput) => {
        setIsLoading(true);
        try {
            const updates: any = {
                data: { full_name: data.full_name }
            };

            if (data.password && data.password.length > 0) {
                updates.password = data.password;
            }

            const { error } = await supabase.auth.updateUser(updates);

            if (error) throw error;

            toast.success('Profil muvaffaqiyatli yangilandi');
        } catch (error: any) {
            toast.error(error.message || 'Xatolik yuz berdi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Profil Sozlamalari</h1>

            <div className="glass-card rounded-3xl p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                            To'liq ismingiz
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                {...register('full_name')}
                                type="text"
                                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${errors.full_name ? 'border-red-500' : 'border-slate-200'} dark:bg-slate-900/50 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                            />
                        </div>
                        {errors.full_name && (
                            <p className="text-xs text-red-500 ml-1">{errors.full_name.message}</p>
                        )}
                    </div>

                    <hr className="border-slate-200 dark:border-slate-800" />

                    {/* Password Change */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Parolni o'zgartirish</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                Yangi parol (ixtiyoriy)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    {...register('password')}
                                    type="password"
                                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${errors.password ? 'border-red-500' : 'border-slate-200'} dark:bg-slate-900/50 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                Yangi parolni tasdiqlang
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    {...register('confirm_password')}
                                    type="password"
                                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${errors.confirm_password ? 'border-red-500' : 'border-slate-200'} dark:bg-slate-900/50 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.confirm_password && (
                                <p className="text-xs text-red-500 ml-1">{errors.confirm_password.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center justify-center py-3 px-6 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 ml-auto"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="mr-2" size={18} />
                                    Saqlash
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
