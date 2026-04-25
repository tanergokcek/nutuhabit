import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { textStyles, fontSizes, fontWeights } from '@/constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Button label sizes mapped to HIG text styles
const LABEL_SIZE: Record<ButtonSize, number> = {
  sm: fontSizes.footnote,  // 13 — compact buttons
  md: fontSizes.subhead,   // 15 — default buttons
  lg: fontSizes.body,      // 17 — large CTA buttons
};

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const sizeStyles = {
    sm: { paddingVertical: 8,  paddingHorizontal: 16, borderRadius: LAYOUT.radius.md },
    md: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: LAYOUT.radius.lg },
    lg: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: LAYOUT.radius.xl },
  };

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[styles.base, sizeStyles[size], isDisabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={['#9333ea', '#7c3aed', '#6d28d9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.neutral[0]} size="small" />
          ) : (
            <Text style={[styles.primaryText, { fontSize: LABEL_SIZE[size] }, textStyle]}>
              {children}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {},
    secondary: {
      backgroundColor: 'rgba(168,85,247,0.20)',
      borderWidth: 1.5,
      borderColor: 'rgba(192,132,252,0.35)',
    },
    ghost: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },
    danger: {
      backgroundColor: 'rgba(239,68,68,0.15)',
      borderWidth: 1.5,
      borderColor: 'rgba(239,68,68,0.35)',
    },
  };

  const variantTextColors: Record<ButtonVariant, string> = {
    primary:   COLORS.neutral[0],
    secondary: COLORS.primary[300],
    ghost:     'rgba(255,255,255,0.80)',
    danger:    '#F87171',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantTextColors[variant]} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { fontSize: LABEL_SIZE[size], color: variantTextColors[variant] },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryText: {
    color: COLORS.neutral[0],
    fontWeight: fontWeights.semibold,
    letterSpacing: -0.24,  // HIG subhead/body tracking
  },
  text: {
    fontWeight: fontWeights.semibold,
    letterSpacing: -0.24,
  },
  disabled: {
    opacity: 0.5,
  },
});
