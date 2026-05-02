import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';

interface StreakBadgeProps {
  count: number;
}

export function StreakBadge({ count }: StreakBadgeProps) {
  const isHighStreak = count >= 7;
  const isLegendary = count >= 30;

  const badgeColor = isLegendary
    ? '#F97316'
    : isHighStreak
    ? '#F59E0B'
    : 'rgba(255,255,255,0.50)';

  const badgeBg = isLegendary
    ? 'rgba(249,115,22,0.20)'
    : isHighStreak
    ? 'rgba(245,158,11,0.20)'
    : 'rgba(255,255,255,0.10)';

  return (
    <View style={[styles.container, { backgroundColor: badgeBg }]}>
      <Text style={styles.fire}>🔥</Text>
      <Text style={[styles.count, { color: badgeColor }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  fire: {
    fontSize: 14,
  },
  count: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
  },
});
