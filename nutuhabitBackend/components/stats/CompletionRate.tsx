import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

interface CompletionRateProps {
  completionRate: number; // 0-1
  completedCount: number;
  totalCount: number;
  label?: string;
}

export function CompletionRate({
  completionRate,
  completedCount,
  totalCount,
  label = 'Bugün',
}: CompletionRateProps) {
  const percentage = Math.round(completionRate * 100);

  const ringColor =
    completionRate >= 1
      ? COLORS.success
      : completionRate >= 0.5
      ? COLORS.primary[400]
      : completionRate > 0
      ? COLORS.warning
      : 'rgba(255,255,255,0.20)';

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
      <View style={styles.overlay} />
      <View style={styles.specular} />

      <View style={styles.left}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.bigPercent}>{percentage}%</Text>
        <Text style={styles.fraction}>
          {completedCount} / {totalCount} tamamlandı
        </Text>

        <View style={styles.progressBarTrack}>
          <LinearGradient
            colors={
              completionRate >= 1
                ? ['#22c55e', '#16a34a']
                : completionRate >= 0.5
                ? ['#c084fc', '#7c3aed']
                : completionRate > 0
                ? ['#f59e0b', '#d97706']
                : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.15)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressBarFill,
              { width: `${percentage}%` as `${number}%` },
            ]}
          />
        </View>
      </View>

      <ProgressRing
        progress={completionRate}
        size={100}
        strokeWidth={10}
        color={ringColor}
        trackColor="rgba(255,255,255,0.10)"
      >
        <Text style={[styles.ringPercent, { color: ringColor }]}>
          {percentage}%
        </Text>
      </ProgressRing>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    padding: LAYOUT.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#14003C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 12,
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
  left: {
    flex: 1,
    marginRight: LAYOUT.spacing.md,
  },
  label: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 4,
  },
  bigPercent: {
    fontSize: FONTS.size['3xl'],
    fontWeight: FONTS.weight.bold,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 36,
  },
  fraction: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 10,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  ringPercent: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
  },
});
