import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
    headers: string[];
    children: React.ReactNode;
    className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className }) => {
    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                        {headers.map((header, i) => (
                            <th key={i} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {children}
                </tbody>
            </table>
        </div>
    );
};
