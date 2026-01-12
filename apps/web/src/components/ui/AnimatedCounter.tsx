import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValueEvent } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    duration = 1.5,
    decimals = 0,
    prefix = '',
    suffix = '',
    className = '',
}) => {
    const spring = useSpring(0, {
        stiffness: 50,
        damping: 30,
    });
    const [display, setDisplay] = useState('0');

    useMotionValueEvent(spring, 'change', (latest) => {
        setDisplay(
            Math.floor(latest).toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })
        );
    });

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return (
        <motion.span className={className}>
            {prefix}
            {display}
            {suffix}
        </motion.span>
    );
};
