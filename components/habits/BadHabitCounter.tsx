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
  selectedDate: string;
  onFutureError?: () => void;
}

export function BadHabitCounter({ habit, log, selectedDate, onFutureError }: BadHabitCounterProps) {
  const updateLog = useHabitStore((state) => state.updateLog);

  const isTimeLimit = habit.limitType === 'time';
  
  const usedValue = isTimeLimit ? (log?.usedMinutes ?? 0) : (log?.usedCount ?? 0);
  const limitValue = isTimeLimit ? (habit.limitMinutes || 60) : (habit.limitCount || 1);
  
  const remaining = Math.max(0, limitValue - usedValue);
  const progress = Math.min(1, usedValue / limitValue);
  const isOverLimit = usedValue > limitValue;

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

  const handleUpdate = (amount: number) => {
    if (selectedDate > getTodayString()) {
      onFutureError?.();
      return;
    }

    const newValue = usedValue + amount;
    const finalValue = Math.max(0, newValue);
    
    if (isTimeLimit) {
      updateLog(habit.id, selectedDate, {
        usedMinutes: finalValue,
        status: finalValue <= limitValue ? 'done' : 'failed',
      });
    } else {
      updateLog(habit.id, selectedDate, {
        usedCount: finalValue,
        status: finalValue <= limitValue ? 'done' : 'failed',
      });
    }
  };

  const progressBarWidth = `${Math.round(progress * 100)}%` as `${number}%`;

  return (
    <View style={styles.container}>
      {/* Status row */}
      <View style={styles.statusRow}>
        <View>
          <Text style={[styles.usedText, { color: isOverLimit ? '#F87171' : 'rgba(255,255,255,0.95)' }]}>
            {isTimeLimit ? formatMinutes(usedValue) : `${usedValue} kez`}
          </Text>
          <Text style={styles.limitText}>/ {isTimeLimit ? formatMinutes(limitValue) : `${limitValue} kez`} limit</Text>
        </View>

        {!isOverLimit ? (
          <View style={[styles.remainingBadge, { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.30)' }]}>
            <Text style={[styles.remainingText, { color: '#4ade80' }]}>
              {isTimeLimit ? formatMinutes(remaining) : `${remaining} kaldı`}
            </Text>
          </View>
        ) : (
          <View style={[styles.remainingBadge, { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.30)' }]}>
            <Text style={[styles.remainingText, { color: '#F87171' }]}>
              {isTimeLimit ? formatMinutes(usedValue - limitValue) : `${usedValue - limitValue} kez`} aşıldı!
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
        {isTimeLimit ? (
          <>
            <TouchableOpacity
              onPress={() => handleUpdate(-5)}
              style={styles.subBtn}
              activeOpacity={0.75}
            >
              <Text style={styles.subBtnText}>-5 dk</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleUpdate(-15)}
              style={styles.subBtn}
              activeOpacity={0.75}
            >
              <Text style={styles.subBtnText}>-15 dk</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleUpdate(15)}
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
              onPress={() => handleUpdate(30)}
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
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => handleUpdate(-1)}
              style={styles.subBtn}
              activeOpacity={0.75}
            >
              <Text style={styles.subBtnText}>-1 kez</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleUpdate(1)}
              activeOpacity={0.75}
              style={styles.addBtnWrapper}
            >
              <LinearGradient
                colors={dangerLevel === 'safe' ? ['#9333ea', '#7c3aed'] : [barColor, barColor]}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnText}>+1 kez</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
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
