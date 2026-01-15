import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
// import { MotiView, AnimatePresence } from 'moti';
import { haptics, premiumColors, shadows } from '../utils/animations';
import { BlurView } from 'expo-blur';

interface TabProps {
    label: string;
    value: string;
    count?: number;
}

interface AnimatedTabsProps {
    tabs: TabProps[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
}) => {
    const handlePress = (tab: string) => {
        haptics.selection();
        onTabChange(tab);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.value;
                    return (
                        <TouchableOpacity
                            key={tab.value}
                            onPress={() => handlePress(tab.value)}
                            activeOpacity={0.8}
                            style={styles.tabWrapper}
                        >
                            <View
                                // animate={{
                                //     backgroundColor: isActive ? premiumColors.primary.solid : 'transparent',
                                //     scale: isActive ? 1.05 : 1,
                                // }}
                                // transition={{ type: 'spring', damping: 15 }}
                                style={[styles.tab, isActive && { backgroundColor: premiumColors.primary.solid, transform: [{ scale: 1.05 }] }]}
                            >
                                <Text style={[
                                    styles.label,
                                    isActive && styles.activeLabel
                                ]}>
                                    {tab.label}
                                </Text>
                                {tab.count !== undefined && (
                                    <View style={[
                                        styles.badge,
                                        isActive ? styles.activeBadge : styles.inactiveBadge
                                    ]}>
                                        <Text style={[
                                            styles.badgeText,
                                            isActive ? styles.activeBadgeText : styles.inactiveBadgeText
                                        ]}>
                                            {tab.count}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    scrollContent: {
        paddingHorizontal: 4,
    },
    tabWrapper: {
        marginRight: 10,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.1)',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginRight: 6,
    },
    activeLabel: {
        color: '#ffffff',
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    activeBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    inactiveBadge: {
        backgroundColor: '#f1f5f9',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    activeBadgeText: {
        color: '#ffffff',
    },
    inactiveBadgeText: {
        color: '#64748b',
    },
});
