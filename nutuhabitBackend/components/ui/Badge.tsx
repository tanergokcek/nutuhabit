import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';

type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: BadgeSize;
  style?: ViewStyle;
}

export function Badge({
  label,
  color = 'rgba(168,85,247,0.22)',
  textColor = COLORS.primary[300],
  size = 'md',
  style,
}: BadgeProps) {
  const sizeStyles = {
    sm: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10 },
    md: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
    lg: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16 },
  };

  const textSizeStyles = {
    sm: FONTS.size.xs,
    md: FONTS.size.sm,
    lg: FONTS.size.md,
  };

  return (
    <View
      style={[
        styles.badge,
        sizeStyles[size],
        { backgroundColor: color, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor, fontSize: textSizeStyles[size] }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: FONTS.weight.semibold,
    letterSpacing: 0.2,
  },
});
