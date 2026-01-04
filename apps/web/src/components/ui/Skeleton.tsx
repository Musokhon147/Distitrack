import React from 'react';
import { cn } from '../../lib/utils'; // Assuming you have a utility for class merging, or we can use tailwind-merge directly if utils doesn't exist.

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-800", className)}
            {...props}
        />
    );
};
