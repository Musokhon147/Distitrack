import React from 'react';
import { NavLink } from 'react-router-dom';
import { Book, History } from 'lucide-react';

export const Navbar: React.FC = () => {
    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 transition-colors">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <div className="flex justify-center md:justify-start items-center h-16 gap-8">
                    <NavLink
                        to="/"
                        className={({ isActive }) => `
                            flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all
                            ${isActive
                                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                        `}
                    >
                        <Book size={20} />
                        Daftar
                    </NavLink>
                    <NavLink
                        to="/records"
                        className={({ isActive }) => `
                            flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all
                            ${isActive
                                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                        `}
                    >
                        <History size={20} />
                        Yozuvlar
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};
