import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps, Animated } from 'react-native';
// import { MotiView } from 'moti';
import { haptics, premiumColors, shadows } from '../utils/animations';

interface PremiumInputProps extends TextInputProps {
    label: string;
    icon?: React.ReactNode;
    error?: string;
    containerStyle?: ViewStyle;
}

/**
 * Premium input with floating label and animated focus state
 */
export const PremiumInput: React.FC<PremiumInputProps> = ({
    label,
    icon,
    error,
    containerStyle,
    value,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);

    // Floating label animation
    const labelAnim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        setHasValue(!!value);
    }, [value]);

    useEffect(() => {
        Animated.timing(labelAnim, {
            toValue: isFocused || hasValue ? 1 : 0,
            duration: 200,
            useNativeDriver: false, // height/layout changes require JS driver usually, or specific transform
        }).start();
    }, [isFocused, hasValue]);

    const handleFocus = () => {
        setIsFocused(true);
        haptics.selection();
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const labelStyle = {
        top: labelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 6],
        }),
        fontSize: labelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: labelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#94a3b8', premiumColors.primary.solid],
        }),
    };

    return (
        <View
            style={[styles.container, containerStyle]}
        // animate={{
        //     scale: isFocused ? 1.02 : 1,
        // }}
        // transition={{
        //     type: 'spring',
        //     damping: 20,
        //     stiffness: 200,
        // }}
        >
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.focusedContainer,
                    !!error && styles.errorContainer,
                ]}
            >
                {icon && <View style={styles.iconContainer}>{icon}</View>}

                <View style={styles.textContainer}>
                    <Animated.Text style={[styles.label, labelStyle as any]}>
                        {label}
                    </Animated.Text>
                    <TextInput
                        {...props}
                        value={value}
                        style={[styles.input, props.multiline && styles.multiline]}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder=""
                        placeholderTextColor="transparent"
                    />
                </View>
            </View>

            {error && (
                <View
                // from={{ opacity: 0, translateY: -10 }}
                // animate={{ opacity: 1, translateY: 0 }}
                >
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#f1f5f9',
        paddingHorizontal: 16,
        height: 64,
        ...shadows.sm,
    },
    focusedContainer: {
        borderColor: premiumColors.primary.solid,
        backgroundColor: '#fff',
        ...shadows.md,
        shadowColor: premiumColors.primary.glow,
    },
    errorContainer: {
        borderColor: premiumColors.error.solid,
    },
    iconContainer: {
        marginRight: 12,
        marginTop: 4
    },
    textContainer: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
    },
    label: {
        position: 'absolute',
        left: 0,
        fontWeight: '600',
        zIndex: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
        paddingTop: 20, // Space for label
        height: '100%',
        fontWeight: '500',
    },
    multiline: {
        paddingTop: 24,
        textAlignVertical: 'top',
    },
    errorText: {
        color: premiumColors.error.solid,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontWeight: '500',
    }
});
