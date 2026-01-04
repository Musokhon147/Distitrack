import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 animate-pulse absolute inset-0" />
                    <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-bounce-subtle">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white animate-pulse">
                    Yuklanmoqda...
                </h2>
            </div>
        </div>
    );
};
