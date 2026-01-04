import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Book, History, PieChart, Moon, Sun, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
    const { isDark, toggleTheme } = useTheme();
    const { logout } = useAuth();

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
                                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                        `}
                        >
                            <Book size={24} />
                            Daftar
                        </NavLink>
                        <NavLink
                            to="/records"
                            className={({ isActive }) => `
                            flex items-center gap-2 px-4 py-3 rounded-2xl font-black transition-all text-base sm:text-lg
                            ${isActive
                                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                        `}
                        >
                            <History size={24} />
                            Tarix
                        </NavLink>
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
                    </div>
                </div>
            </div>
        </nav>
    );
};
