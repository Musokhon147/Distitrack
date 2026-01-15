import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import { MotiView } from 'moti';
import { GlassCard } from './GlassCard';
import { premiumColors } from '../utils/animations';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color?: string;
    delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon,
    trend,
    color = premiumColors.primary.solid,
    delay = 0,
}) => {
    return (
        <View
            // from={{ opacity: 0, scale: 0.9, translateY: 20 }}
            // animate={{ opacity: 1, scale: 1, translateY: 0 }}
            // transition={{
            //     type: 'spring',
            //     delay,
            //     damping: 15,
            // }}
            style={styles.wrapper}
        >
            <GlassCard intensity={40} style={styles.container}>
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                        {/* Clone icon with color */}
                        {React.isValidElement(icon)
                            // @ts-ignore
                            ? React.cloneElement(icon, { color, size: 20 })
                            : icon}
                    </View>
                    {trend && (
                        <View style={styles.trendContainer}>
                            <Text style={styles.trendText}>{trend}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.value}>{value}</Text>
                <Text style={styles.label}>{label}</Text>

                <View style={styles.glowContainer}>
                    <View style={[styles.glow, { backgroundColor: color }]} />
                </View>
            </GlassCard>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        minWidth: '45%',
    },
    container: {
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendContainer: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        justifyContent: 'center',
    },
    trendText: {
        color: '#10b981',
        fontSize: 12,
        fontWeight: '700',
    },
    value: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    label: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    glowContainer: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        width: 80,
        height: 80,
        opacity: 0.15,
    },
    glow: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        filter: 'blur(20px)', // Note: standard blur property might need adjustment for RN, usually needs an image or separate view
    }
});
