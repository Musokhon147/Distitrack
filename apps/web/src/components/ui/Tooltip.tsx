import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
    children, 
    content, 
    position = 'top',
    delay = 200 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const calculatePosition = () => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let x = 0;
        let y = 0;

        switch (position) {
            case 'top':
                x = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
                y = triggerRect.top + scrollY - tooltipRect.height - 8;
                break;
            case 'bottom':
                x = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
                y = triggerRect.bottom + scrollY + 8;
                break;
            case 'left':
                x = triggerRect.left + scrollX - tooltipRect.width - 8;
                y = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                x = triggerRect.right + scrollX + 8;
                y = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
                break;
        }

        // Keep tooltip within viewport
        const padding = 8;
        x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));
        y = Math.max(padding, Math.min(y, window.innerHeight + scrollY - tooltipRect.height - padding));

        setTooltipPosition({ x, y });
    };

    const showTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            setTimeout(calculatePosition, 10);
        }, delay) as ReturnType<typeof setTimeout>;
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
    };

    useEffect(() => {
        if (isVisible) {
            calculatePosition();
            window.addEventListener('scroll', calculatePosition);
            window.addEventListener('resize', calculatePosition);
            return () => {
                window.removeEventListener('scroll', calculatePosition);
                window.removeEventListener('resize', calculatePosition);
            };
        }
    }, [isVisible]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, []);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                className="inline-block"
            >
                {children}
            </div>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        ref={tooltipRef}
                        initial={{ opacity: 0, scale: 0.8, y: position === 'bottom' ? -5 : position === 'top' ? 5 : 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="fixed z-50 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 rounded-lg shadow-xl pointer-events-none whitespace-nowrap"
                        style={{
                            left: `${tooltipPosition.x}px`,
                            top: `${tooltipPosition.y}px`,
                        }}
                    >
                        {content}
                        <div 
                            className={`absolute w-2 h-2 bg-slate-900 dark:bg-slate-700 transform rotate-45 ${
                                position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                                position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                                position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                                'left-[-4px] top-1/2 -translate-y-1/2'
                            }`}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
