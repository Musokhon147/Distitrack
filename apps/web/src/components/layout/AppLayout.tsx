import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Store,
    ArrowLeftRight,
    Menu,
    X,
    LogOut,
    Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
    to: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, active, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            active
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        )}
    >
        <Icon className={cn('w-5 h-5', active ? 'text-white' : 'group-hover:text-primary-600')} />
        <span className="font-medium text-sm">{label}</span>
    </Link>
);

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { to: '/', icon: LayoutDashboard, label: 'Boshqaruv paneli' },
        { to: '/inventory', icon: Package, label: 'Mening inventarim' },
        { to: '/stores', icon: Store, label: 'Do\'konlar' },
        { to: '/transactions', icon: ArrowLeftRight, label: 'Tranzaksiyalar' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200 p-6 sticky top-0 h-screen">
                <div className="flex items-center gap-3 px-2 mb-10">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
                        <Package className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">DistriTrack</h1>
                </div>

                <nav className="flex-1 space-y-1">
                    {navigation.map((item) => (
                        <SidebarItem
                            key={item.to}
                            {...item}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100">
                    <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Chiqish</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 transform transition-transform duration-300 lg:hidden",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between mb-10 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Package className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-bold text-slate-900">DistriTrack</h1>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <nav className="space-y-1">
                    {navigation.map((item) => (
                        <SidebarItem
                            key={item.to}
                            {...item}
                            active={location.pathname === item.to}
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 sticky top-0 z-30 flex items-center justify-between">
                    <button
                        className="lg:hidden p-2 -ml-2 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-8 h-8 bg-primary-100 rounded-full border border-primary-200 flex items-center justify-center">
                            <span className="text-primary-700 text-xs font-bold">A</span>
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
};

