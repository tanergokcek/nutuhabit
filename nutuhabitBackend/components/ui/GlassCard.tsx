import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '@/constants/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  padding?: number;
}

export function GlassCard({
  children,
  style,
  intensity = 20,
  tint = 'dark',
  padding = 16,
}: GlassCardProps) {
  return (
    <BlurView intensity={intensity} tint={tint} style={[styles.blur, style]}>
      <View style={[styles.overlay, { borderRadius: (style as Record<string, number>)?.borderRadius ?? 28 }]}>
        <View style={{ padding }}>
          {children}
        </View>
      </View>
      {/* Top specular highlight */}
      <View style={styles.specular} />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.borderSub,
    shadowColor: '#14003C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.glass.bg,
    borderRadius: 28,
  },
  specular: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 1,
  },
});
