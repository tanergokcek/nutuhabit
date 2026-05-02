import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LAYOUT } from '@/constants/layout';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  intensity?: number;
}

export function Card({ children, style, noPadding = false, intensity = 18 }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        noPadding && styles.noPadding,
        style,
      ]}
    >
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFillObject} />
      <View style={styles.overlay} />
      <View style={styles.specular} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    padding: LAYOUT.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#14003C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 12,
  },
  noPadding: {
    padding: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  specular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});
