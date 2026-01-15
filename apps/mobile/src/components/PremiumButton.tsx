import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import { MotiView } from 'moti';
import { haptics, premiumColors, shadows } from '../utils/animations';

interface PremiumButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

/**
 * Premium animated button with haptic feedback
 * Features gradient backgrounds, scale animations, and glow effects
 */
export const PremiumButton: React.FC<PremiumButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
}) => {
    const [pressed, setPressed] = React.useState(false);

    const gradientColors = {
        primary: premiumColors.primary.gradient,
        success: premiumColors.success.gradient,
        warning: premiumColors.warning.gradient,
        error: premiumColors.error.gradient,
        ghost: ['transparent', 'transparent'],
    }[variant];

    const sizeStyles = {
        sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 13 },
        md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15 },
        lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17 },
    }[size];

    const handlePress = () => {
        if (disabled || loading) return;
        haptics.medium();
        onPress();
    };

    const handlePressIn = () => {
        if (disabled || loading) return;
        setPressed(true);
        haptics.light();
    };

    const handlePressOut = () => {
        setPressed(false);
    };

    return (
        <View
            // animate={{
            //     scale: pressed ? 0.96 : 1,
            //     opacity: disabled ? 0.5 : 1,
            // }}
            // transition={{
            //     type: 'spring',
            //     damping: 15,
            //     stiffness: 300,
            // }}
            style={[styles.container, style]}
        >
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                disabled={disabled || loading}
            >
                <LinearGradient
                    colors={gradientColors as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.gradient,
                        {
                            paddingVertical: sizeStyles.paddingVertical,
                            paddingHorizontal: sizeStyles.paddingHorizontal,
                        },
                        variant === 'ghost' && styles.ghostBorder,
                    ]}
                >
                    <View
                        style={styles.content}
                    // animate={{
                    //     opacity: loading ? 0.5 : 1,
                    // }}
                    >
                        {icon && <View style={styles.icon}>{icon}</View>}
                        <Text
                            style={[
                                styles.text,
                                { fontSize: sizeStyles.fontSize },
                                variant === 'ghost' && styles.ghostText,
                                textStyle,
                            ]}
                        >
                            {loading ? 'Yuklanmoqda...' : title}
                        </Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        ...shadows.md,
    },
    gradient: {
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    icon: {
        marginRight: 4,
    },
    text: {
        color: '#ffffff',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    ghostBorder: {
        borderWidth: 2,
        borderColor: premiumColors.primary.solid,
    },
    ghostText: {
        color: premiumColors.primary.solid,
    },
});
