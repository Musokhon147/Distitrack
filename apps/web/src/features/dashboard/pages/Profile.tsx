import React, { useState } from 'react';
import { User, Lock, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileInput } from '@distitrack/common';
import { motion } from 'framer-motion';

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-3xl mx-auto relative px-4"
        >
            {/* Background elements */}
            <div className="absolute top-0 right-[-20%] w-[50%] h-[50%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-20%] w-[50%] h-[50%] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div variants={itemVariants} className="mb-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <User size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profil Sozlamalari</h1>
                    <p className="text-slate-500 dark:text-slate-400">Shaxsiy ma'lumotlarni boshqarish</p>
                </div>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="glass-card rounded-[2rem] p-8 sm:p-10 border border-white/20 shadow-2xl backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 relative overflow-hidden"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Full Name */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                            To'liq ismingiz
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                <User size={20} />
                            </div>
                            <input
                                {...register('full_name')}
                                type="text"
                                className={`w-full pl-12 pr-4 py-4 bg-white/50 border ${errors.full_name ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium text-lg`}
                            />
                        </div>
                        {errors.full_name && (
                            <p className="text-xs font-medium text-red-500 ml-1">{errors.full_name.message}</p>
                        )}
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

                    {/* Password Change */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <ShieldCheck size={20} />
                            <h3 className="text-lg font-bold">Xavfsizlik</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                                    Yangi parol <span className="text-slate-300 font-normal normal-case">(ixtiyoriy)</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        {...register('password')}
                                        type="password"
                                        className={`w-full pl-12 pr-4 py-4 bg-white/50 border ${errors.password ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-xs font-medium text-red-500 ml-1">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                                    Parolni tasdiqlang
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        {...register('confirm_password')}
                                        type="password"
                                        className={`w-full pl-12 pr-4 py-4 bg-white/50 border ${errors.confirm_password ? 'border-red-500' : 'border-slate-200/50'} dark:bg-slate-950/30 dark:border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.confirm_password && (
                                    <p className="text-xs font-medium text-red-500 ml-1">{errors.confirm_password.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className="flex items-center justify-center py-4 px-8 rounded-2xl text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/25"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="mr-2" size={20} strokeWidth={2.5} />
                                    Saqlash
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};
