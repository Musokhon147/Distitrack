import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Book, History, PieChart, Moon, Sun, LogOut, Store, Package, Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
    const { isDark, toggleTheme, accentColor, setAccentColor } = useTheme();
    const { logout, user, profile } = useAuth();
    const [showColorPicker, setShowColorPicker] = useState(false);

    const colors = [
        { id: 'blue', label: 'Blue', class: 'bg-blue-500' },
        { id: 'violet', label: 'Violet', class: 'bg-violet-500' },
        { id: 'rose', label: 'Rose', class: 'bg-rose-500' },
        { id: 'orange', label: 'Orange', class: 'bg-orange-500' },
        { id: 'teal', label: 'Teal', class: 'bg-teal-500' },
    ] as const;

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-4 sm:gap-10">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => `
                            flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all text-base sm:text-lg
                            ${isActive
                                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                        `}
                        >
                            <Book size={24} />
                            Daftar
                        </NavLink>
                        {/* Only show Tarix, Marketlar, and Mahsulotlar for Seller role */}
                        {profile?.role !== 'market' && (
                            <>
                                <NavLink
                                    to="/records"
                                    className={({ isActive }) => `
                                    flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all text-base sm:text-lg
                                    ${isActive
                                            ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                                `}
                                >
                                    <History size={24} />
                                    Tarix
                                </NavLink>
                                <NavLink
                                    to="/markets"
                                    className={({ isActive }) => `
                                    flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all text-base sm:text-lg
                                    ${isActive
                                            ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/30'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                                `}
                                >
                                    <Store size={24} />
                                    Marketlar
                                </NavLink>
                                <NavLink
                                    to="/products"
                                    className={({ isActive }) => `
                                    flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all text-base sm:text-lg
                                    ${isActive
                                            ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/30'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                                `}
                                >
                                    <Package size={24} />
                                    Mahsulotlar
                                </NavLink>
                            </>
                        )}
                        <NavLink
                            to="/hisobot"
                            className={({ isActive }) => `
                            flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all text-base sm:text-lg
                            ${isActive
                                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                        `}
                        >
                            <PieChart size={24} />
                            Hisob-kitob
                        </NavLink>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Theme Trigger */}
                        <div className="relative">
                            <button
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform shadow-sm"
                                title="Rangni o'zgartirish"
                            >
                                <Palette size={24} />
                            </button>

                            <AnimatePresence>
                                {showColorPicker && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowColorPicker(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 min-w-[200px] z-50"
                                        >
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Mavzu rangi</p>
                                            <div className="grid grid-cols-5 gap-2">
                                                {colors.map((color) => (
                                                    <button
                                                        key={color.id}
                                                        onClick={() => {
                                                            setAccentColor(color.id);
                                                            setShowColorPicker(false);
                                                        }}
                                                        className={`w-8 h-8 rounded-full ${color.class} flex items-center justify-center transition-transform hover:scale-110 ring-2 ring-offset-2 dark:ring-offset-slate-800 ${accentColor === color.id ? 'ring-slate-400 dark:ring-slate-500' : 'ring-transparent'}`}
                                                        title={color.label}
                                                    >
                                                        {accentColor === color.id && <Check size={14} className="text-white" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:scale-110 transition-transform shadow-sm"
                            title={isDark ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
                        >
                            {isDark ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                        <button
                            onClick={logout}
                            className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:scale-110 transition-transform shadow-sm"
                            title="Tizimdan chiqish"
                        >
                            <LogOut size={24} />
                        </button>

                        <NavLink to="/profile" className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-700 ml-2 hover:opacity-80 transition-opacity">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {user?.user_metadata?.full_name || 'Foydalanuvchi'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {user?.email}
                                </p>
                            </div>
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg shadow-sm">
                                {user?.user_metadata?.full_name
                                    ? user.user_metadata.full_name.charAt(0).toUpperCase()
                                    : (user?.email?.charAt(0).toUpperCase() || 'U')}
                            </div>
                        </NavLink>
                    </div>
                </div>
            </div>
        </nav>
    );
};
