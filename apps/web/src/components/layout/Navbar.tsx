import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Book, History, PieChart, Moon, Sun, LogOut, Store, Package, Palette, Check, Menu, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
    const { isDark, toggleTheme, accentColor, setAccentColor } = useTheme();
    const { logout, user, profile } = useAuth();
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                    <div className="hidden lg:flex items-center gap-2 sm:gap-6">
                        <NavLink
                            to={profile?.role === 'admin' ? '/admin-dashboard' : (profile?.role === 'market' ? '/market-dashboard' : '/dashboard')}
                            className={({ isActive }) => `
                            flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all text-base
                            ${isActive
                                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                        `}
                        >
                            <Book size={20} />
                            Daftar
                        </NavLink>
                        {profile?.role !== 'market' && (
                            <>
                                <NavLink
                                    to="/records"
                                    className={({ isActive }) => `
                                    flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all text-base
                                    ${isActive
                                            ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                                `}
                                >
                                    <History size={20} />
                                    Tarix
                                </NavLink>
                                <NavLink
                                    to="/markets"
                                    className={({ isActive }) => `
                                    flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all text-base
                                    ${isActive
                                            ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/30'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                                `}
                                >
                                    <Store size={20} />
                                    Marketlar
                                </NavLink>
                                <NavLink
                                    to="/products"
                                    className={({ isActive }) => `
                                    flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all text-base
                                    ${isActive
                                            ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/30'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                                `}
                                >
                                    <Package size={20} />
                                    Mahsulotlar
                                </NavLink>
                            </>
                        )}
                        <NavLink
                            to="/hisobot"
                            className={({ isActive }) => `
                            flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all text-base
                            ${isActive
                                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                        `}
                        >
                            <PieChart size={20} />
                            Hisob-kitob
                        </NavLink>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform shadow-sm mr-2"
                        >
                            {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
                        </button>
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

            {/* Mobile Navigation Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                    >
                        <div className="flex flex-col p-4 gap-2">
                            <NavLink
                                to={profile?.role === 'admin' ? '/admin-dashboard' : (profile?.role === 'market' ? '/market-dashboard' : '/dashboard')}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                flex items-center gap-3 px-5 py-4 rounded-2xl font-black transition-all
                                ${isActive
                                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                            `}
                            >
                                <Book size={20} />
                                Daftar
                            </NavLink>
                            {profile?.role !== 'market' && (
                                <>
                                    <NavLink
                                        to="/records"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                        flex items-center gap-3 px-5 py-4 rounded-2xl font-black transition-all
                                        ${isActive
                                                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                    `}
                                    >
                                        <History size={20} />
                                        Tarix
                                    </NavLink>
                                    <NavLink
                                        to="/markets"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                        flex items-center gap-3 px-5 py-4 rounded-2xl font-black transition-all
                                        ${isActive
                                                ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                    `}
                                    >
                                        <Store size={20} />
                                        Marketlar
                                    </NavLink>
                                    <NavLink
                                        to="/products"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                        flex items-center gap-3 px-5 py-4 rounded-2xl font-black transition-all
                                        ${isActive
                                                ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/30 shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                    `}
                                    >
                                        <Package size={20} />
                                        Mahsulotlar
                                    </NavLink>
                                </>
                            )}
                            <NavLink
                                to="/hisobot"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                flex items-center gap-3 px-5 py-4 rounded-2xl font-black transition-all
                                ${isActive
                                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                            `}
                            >
                                <PieChart size={20} />
                                Hisob-kitob
                            </NavLink>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
