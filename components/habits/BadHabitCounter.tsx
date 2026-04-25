import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BadHabit, HabitLog } from '@/src/types/habit';
import { useHabitStore } from '@/src/store/useHabitStore';
import { getTodayString } from '@/src/utils/date';
import { formatMinutes } from '@/src/utils/formatTime';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

interface BadHabitCounterProps {
  habit: BadHabit;
  log: HabitLog | undefined;
}

export function BadHabitCounter({ habit, log }: BadHabitCounterProps) {
  const updateLog = useHabitStore((state) => state.updateLog);

  const usedMinutes = log?.usedMinutes ?? 0;
  const remaining = Math.max(0, habit.limitMinutes - usedMinutes);
  const progress = Math.min(1, usedMinutes / habit.limitMinutes);
  const isOverLimit = usedMinutes > habit.limitMinutes;

  const dangerLevel = progress < 0.5
    ? 'safe'
    : progress < 0.8
    ? 'warning'
    : 'danger';

  const barColor =
    dangerLevel === 'safe'
      ? COLORS.success
      : dangerLevel === 'warning'
      ? COLORS.warning
      : COLORS.danger;

  const handleAdd = (minutes: number) => {
    const newUsed = usedMinutes + minutes;
    updateLog(habit.id, getTodayString(), {
      usedMinutes: newUsed,
      status: newUsed <= habit.limitMinutes ? 'done' : 'failed',
    });
  };

  const handleSubtract = (minutes: number) => {
    const newUsed = Math.max(0, usedMinutes - minutes);
    updateLog(habit.id, getTodayString(), {
      usedMinutes: newUsed,
      status: newUsed <= habit.limitMinutes ? 'done' : 'failed',
    });
  };

  const progressBarWidth = `${Math.round(progress * 100)}%` as `${number}%`;

  return (
    <View style={styles.container}>
      {/* Status row */}
      <View style={styles.statusRow}>
        <View>
          <Text style={[styles.usedText, { color: isOverLimit ? '#F87171' : 'rgba(255,255,255,0.95)' }]}>
            {formatMinutes(usedMinutes)}
          </Text>
          <Text style={styles.limitText}>/ {formatMinutes(habit.limitMinutes)} limit</Text>
        </View>

        {!isOverLimit ? (
          <View style={[styles.remainingBadge, { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.30)' }]}>
            <Text style={[styles.remainingText, { color: '#4ade80' }]}>
              {formatMinutes(remaining)} kaldı
            </Text>
          </View>
        ) : (
          <View style={[styles.remainingBadge, { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.30)' }]}>
            <Text style={[styles.remainingText, { color: '#F87171' }]}>
              {formatMinutes(usedMinutes - habit.limitMinutes)} aşıldı!
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: progressBarWidth, backgroundColor: barColor },
          ]}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => handleSubtract(5)}
          style={styles.subBtn}
          activeOpacity={0.75}
        >
          <Text style={styles.subBtnText}>-5 dk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSubtract(15)}
          style={styles.subBtn}
          activeOpacity={0.75}
        >
          <Text style={styles.subBtnText}>-15 dk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAdd(15)}
          activeOpacity={0.75}
          style={styles.addBtnWrapper}
        >
          <LinearGradient
            colors={dangerLevel === 'safe' ? ['#9333ea', '#7c3aed'] : [barColor, barColor]}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>+15 dk</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAdd(30)}
          activeOpacity={0.75}
          style={styles.addBtnWrapper}
        >
          <LinearGradient
            colors={dangerLevel === 'safe' ? ['#9333ea', '#7c3aed'] : [barColor, barColor]}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>+30 dk</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  usedText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
  },
  limitText: {
    fontSize: FONTS.size.xs,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  remainingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: LAYOUT.radius.full,
    borderWidth: 1,
  },
  remainingText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  subBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: LAYOUT.radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  subBtnText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium,
    color: 'rgba(255,255,255,0.60)',
  },
  addBtnWrapper: {
    borderRadius: LAYOUT.radius.md,
    overflow: 'hidden',
  },
  addBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: LAYOUT.radius.md,
  },
  addBtnText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium,
    color: COLORS.neutral[0],
  },
});
