import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
// import { MotiView } from 'moti';
import { shadows, premiumColors } from '../utils/animations';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    gradient?: boolean;
    gradientColors?: string[];
    animated?: boolean;
    delay?: number;
}

/**
 * Premium glassmorphic card component
 * Features frosted glass effect with optional gradient border
 */
export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    intensity = 20,
    gradient = false,
    gradientColors = premiumColors.primary.gradient,
    animated = true,
    delay = 0,
}) => {
    const CardWrapper = View; // animated ? MotiView : View;

    const animationProps = {};
    // const animationProps = animated
    //     ? {
    //         from: { opacity: 0, scale: 0.95, translateY: 20 },
    //         animate: { opacity: 1, scale: 1, translateY: 0 },
    //         transition: {
    //             type: 'spring',
    //             damping: 20,
    //             stiffness: 150,
    //             delay,
    //         },
    //     }
    //     : {};

    if (gradient) {
        return (
            <CardWrapper {...animationProps} style={[styles.container, style]}>
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBorder}
                >
                    <BlurView intensity={intensity} tint="light" style={styles.blurContainer}>
                        <View style={styles.content}>{children}</View>
                    </BlurView>
                </LinearGradient>
            </CardWrapper>
        );
    }

    return (
        <CardWrapper {...animationProps} style={[styles.container, style]}>
            <BlurView intensity={intensity} tint="light" style={styles.blurContainer}>
                <View style={[styles.glassBackground, styles.content]}>{children}</View>
            </BlurView>
        </CardWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        ...shadows.lg,
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 24,
    },
    blurContainer: {
        borderRadius: 22,
        overflow: 'hidden',
    },
    glassBackground: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    content: {
        padding: 20,
    },
});
