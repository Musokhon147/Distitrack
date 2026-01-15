import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface PremiumBackgroundProps {
    children: React.ReactNode;
}

export const PremiumBackground: React.FC<PremiumBackgroundProps> = ({ children }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#f8fafc', '#eff6ff', '#eef2ff']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Mesh gradient orbs */}
            <View style={[styles.orb, styles.orb1]} />
            <View style={[styles.orb, styles.orb2]} />
            <View style={[styles.orb, styles.orb3]} />

            {/* Content overlay */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
    orb: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.4,
        filter: 'blur(60px)', // Works in compatible environments
    },
    orb1: {
        width: width * 0.8,
        height: width * 0.8,
        backgroundColor: '#e0e7ff',
        top: -width * 0.3,
        left: -width * 0.2,
    },
    orb2: {
        width: width * 0.7,
        height: width * 0.7,
        backgroundColor: '#fae8ff',
        bottom: height * 0.2,
        right: -width * 0.2,
    },
    orb3: {
        width: width * 0.6,
        height: width * 0.6,
        backgroundColor: '#ecfdf5',
        top: height * 0.3,
        left: -width * 0.1,
    },
});
