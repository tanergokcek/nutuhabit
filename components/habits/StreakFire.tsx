import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FONTS } from '@/constants/fonts';

interface StreakFireProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakFire({ count, size = 'md' }: StreakFireProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.12,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    return () => {
      scaleAnim.stopAnimation();
    };
  }, [count, scaleAnim]);

  const isHighStreak = count >= 7;
  const isLegendary = count >= 30;

  const textColor = isLegendary
    ? '#EF4444'
    : isHighStreak
    ? '#F97316'
    : 'rgba(255,255,255,0.38)';

  const sizes = {
    sm: { fire: 18, count: 13, gap: 2 },
    md: { fire: 24, count: 16, gap: 4 },
    lg: { fire: 32, count: 22, gap: 6 },
  };

  const s = sizes[size];

  return (
    <View style={[styles.container, { gap: s.gap }]}>
      <Animated.Text
        style={[
          styles.fire,
          { fontSize: s.fire },
          count > 0 && { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {count > 0 ? '🔥' : '○'}
      </Animated.Text>
      <Text style={[styles.count, { fontSize: s.count, color: textColor }]}>
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fire: {
    // emoji
  },
  count: {
    fontWeight: FONTS.weight.bold,
  },
});
