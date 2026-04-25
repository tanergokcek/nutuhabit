import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';
import { HabitType } from '@/src/types/habit';
import { HabitIcon } from '@/components/ui/HabitIcon';

export interface HabitBarItem {
  id: string;
  name: string;
  icon: string;
  rate: number; // 0–1
  type: HabitType;
}

interface TopHabitsBarProps {
  data: HabitBarItem[];
}

const TYPE_COLOR: Record<HabitType, string> = {
  done: '#22c55e',
  time: '#a855f7',
  bad: '#f97316',
};

export function TopHabitsBar({ data }: TopHabitsBarProps) {
  const t = useAppTheme();
  const i18n = useTranslation();

  const top5 = [...data]
    .filter((item) => item.rate > 0)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  return (
    <View style={[styles.container, { borderColor: t.panelBorder, shadowColor: t.cardShadow }]}>
      <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.cardGrad as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Text style={[styles.title, { color: t.t3 }]}>{i18n.topCompleted}</Text>

      {top5.length === 0 ? (
        <Text style={[styles.noData, { color: t.t3 }]}>{i18n.notEnoughData}</Text>
      ) : (
        <View style={styles.bars}>
          {top5.map((item) => {
            const barColor = TYPE_COLOR[item.type];
            const pct = Math.round(item.rate * 100);
            return (
              <View key={item.id} style={styles.barRow}>
                <HabitIcon icon={item.icon} size={18} color="rgba(255,255,255,0.90)" />
                <View style={styles.barTrack}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.barName, { color: t.t2 }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.pct, { color: t.tAccent }]}>{pct}%</Text>
                  </View>
                  <View style={[styles.barBg, { backgroundColor: t.rowBg }]}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${pct}%` as any, backgroundColor: barColor },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    overflow: 'hidden',
    padding: LAYOUT.spacing.md,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    marginBottom: LAYOUT.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  noData: {
    fontSize: FONTS.size.sm,
    textAlign: 'center',
    paddingVertical: 32,
  },
  bars: {
    gap: 14,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 18,
    width: 26,
    textAlign: 'center',
  },
  barTrack: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barName: {
    flex: 1,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium,
    marginRight: 4,
  },
  pct: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    minWidth: 34,
    textAlign: 'right',
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
    opacity: 0.85,
  },
});
