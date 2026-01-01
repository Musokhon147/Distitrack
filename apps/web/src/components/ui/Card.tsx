import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div
            className={cn(
                'bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{children}</h3>
);

export const CardValue: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-2xl font-bold text-slate-900 mt-1">{children}</div>
);
