import * as Haptics from 'expo-haptics';

/**
 * Premium haptic feedback utilities
 * Provides tactile feedback for user interactions
 */

export const haptics = {
    // Light tap for subtle interactions
    light: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    // Medium impact for selections and toggles
    medium: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },

    // Heavy impact for important actions
    heavy: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    },

    // Success notification
    success: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },

    // Warning notification
    warning: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    },

    // Error notification
    error: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },

    // Selection changed (like picker)
    selection: () => {
        Haptics.selectionAsync();
    },
};

/**
 * Premium animation configurations
 * Consistent spring and timing values across the app
 */

export const springConfigs = {
    // Gentle spring for subtle animations
    gentle: {
        damping: 20,
        stiffness: 150,
        mass: 0.5,
    },

    // Bouncy spring for playful interactions
    bouncy: {
        damping: 12,
        stiffness: 200,
        mass: 0.8,
    },

    // Snappy spring for quick responses
    snappy: {
        damping: 25,
        stiffness: 300,
        mass: 0.3,
    },

    // Smooth spring for elegant transitions
    smooth: {
        damping: 30,
        stiffness: 180,
        mass: 0.6,
    },
};

export const timingConfigs = {
    // Fast animations (100-200ms)
    fast: 150,

    // Medium animations (200-300ms)
    medium: 250,

    // Slow animations (300-500ms)
    slow: 400,

    // Very slow (for dramatic effects)
    dramatic: 600,
};

/**
 * Easing functions for smooth animations
 */
export const easings = {
    // Ease out - fast start, slow end (for entrances)
    easeOut: [0.25, 0.1, 0.25, 1],

    // Ease in - slow start, fast end (for exits)
    easeIn: [0.42, 0, 1, 1],

    // Ease in-out - smooth both ends
    easeInOut: [0.42, 0, 0.58, 1],

    // Elastic - bouncy effect
    elastic: [0.68, -0.55, 0.265, 1.55],
};

/**
 * Animation presets for common patterns
 */
export const animationPresets = {
    // Fade in from bottom
    fadeInUp: {
        from: {
            opacity: 0,
            translateY: 20,
        },
        animate: {
            opacity: 1,
            translateY: 0,
        },
    },

    // Fade in from top
    fadeInDown: {
        from: {
            opacity: 0,
            translateY: -20,
        },
        animate: {
            opacity: 1,
            translateY: 0,
        },
    },

    // Scale in
    scaleIn: {
        from: {
            opacity: 0,
            scale: 0.9,
        },
        animate: {
            opacity: 1,
            scale: 1,
        },
    },

    // Slide in from right
    slideInRight: {
        from: {
            opacity: 0,
            translateX: 50,
        },
        animate: {
            opacity: 1,
            translateX: 0,
        },
    },

    // Slide in from left
    slideInLeft: {
        from: {
            opacity: 0,
            translateX: -50,
        },
        animate: {
            opacity: 1,
            translateX: 0,
        },
    },
};

/**
 * Stagger delay calculator
 * Creates sequential animation delays
 */
export const getStaggerDelay = (index: number, baseDelay: number = 50): number => {
    return index * baseDelay;
};

/**
 * Premium color system with gradients and glows
 */
export const premiumColors = {
    primary: {
        gradient: ['#6366f1', '#8b5cf6', '#d946ef'],
        glow: 'rgba(99, 102, 241, 0.3)',
        solid: '#6366f1',
    },
    success: {
        gradient: ['#10b981', '#059669'],
        glow: 'rgba(16, 185, 129, 0.3)',
        solid: '#10b981',
    },
    warning: {
        gradient: ['#f59e0b', '#d97706'],
        glow: 'rgba(245, 158, 11, 0.3)',
        solid: '#f59e0b',
    },
    error: {
        gradient: ['#ef4444', '#dc2626'],
        glow: 'rgba(239, 68, 68, 0.3)',
        solid: '#ef4444',
    },
    glass: {
        light: 'rgba(255, 255, 255, 0.1)',
        medium: 'rgba(255, 255, 255, 0.15)',
        heavy: 'rgba(255, 255, 255, 0.2)',
    },
    dark: {
        surface: '#0f172a',
        elevated: '#1e293b',
        border: '#334155',
    },
};

/**
 * Shadow presets for depth
 */
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
    },
    colored: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    }),
};
