import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Habit, HabitLog, DoneHabit, TimeHabit, BadHabit } from '@/src/types/habit';
import { DoneToggle } from './DoneToggle';
import { TimeTracker } from './TimeTracker';
import { BadHabitCounter } from './BadHabitCounter';
import { StreakFire } from './StreakFire';
import { useHabitStore } from '@/src/store/useHabitStore';
import { useStreak } from '@/src/hooks/useStreak';
import { HabitIcon } from '@/components/ui/HabitIcon';
import { getTodayString } from '@/src/utils/date';
import { formatMinutes } from '@/src/utils/formatTime';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { textStyles, textColors } from '@/constants/typography';

// ─── Haftalık gün yardımcıları ────────────────────────────────────────────────
const DAY_SHORT = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

function getThisWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Pazar
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOfWeek + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return { dateStr: `${y}-${m}-${day}`, label: DAY_SHORT[i], isToday: i === dayOfWeek };
  });
}

// ─── Done streak haftası ──────────────────────────────────────────────────────
function DoneWeekDots({ habitId }: { habitId: string }) {
  const getLogsForHabit = useHabitStore((s) => s.getLogsForHabit);
  const logs = getLogsForHabit(habitId);
  const weekDates = getThisWeekDates();

  return (
    <View style={dotStyles.row}>
      {weekDates.map(({ dateStr, label, isToday }) => {
        const log = logs.find((l) => l.date === dateStr);
        const isDone = log?.status === 'done';
        const isFuture = dateStr > getTodayString();
        return (
          <View key={dateStr} style={dotStyles.dayCol}>
            <Text style={[dotStyles.dayLabel, isToday && dotStyles.dayLabelToday]}>{label}</Text>
            <View style={[
              dotStyles.circle,
              isDone && dotStyles.circleDone,
              isToday && !isDone && dotStyles.circleToday,
              isFuture && dotStyles.circleFuture,
            ]}>
              {isDone && <Text style={dotStyles.checkmark}>✓</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Bad habit haftası ────────────────────────────────────────────────────────
function BadWeekDots({ habitId }: { habitId: string }) {
  const getLogsForHabit = useHabitStore((s) => s.getLogsForHabit);
  const logs = getLogsForHabit(habitId);
  const weekDates = getThisWeekDates();

  return (
    <View style={dotStyles.row}>
      {weekDates.map(({ dateStr, label, isToday }) => {
        const log = logs.find((l) => l.date === dateStr);
        const isGood = log?.status === 'done';
        const isBad = log?.status === 'failed';
        const isFuture = dateStr > getTodayString();
        return (
          <View key={dateStr} style={dotStyles.dayCol}>
            <Text style={[dotStyles.dayLabel, isToday && dotStyles.dayLabelToday]}>{label}</Text>
            <View style={[
              dotStyles.circle,
              isGood && dotStyles.circleGood,
              isBad && dotStyles.circleBad,
              isToday && !isGood && !isBad && dotStyles.circleToday,
              isFuture && dotStyles.circleFuture,
            ]}>
              {isGood && <Text style={dotStyles.checkmark}>✓</Text>}
              {isBad && <Text style={dotStyles.crossmark}>✗</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    ...textStyles.caption2,
    color: textColors.tertiary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  dayLabelToday: { color: 'rgba(192,132,252,0.80)' },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: 'rgba(168,85,247,0.70)',
    borderColor: 'rgba(192,132,252,0.80)',
  },
  circleGood: {
    backgroundColor: 'rgba(34,197,94,0.65)',
    borderColor: 'rgba(74,222,128,0.80)',
  },
  circleBad: {
    backgroundColor: 'rgba(239,68,68,0.65)',
    borderColor: 'rgba(248,113,113,0.80)',
  },
  circleToday: {
    borderColor: 'rgba(192,132,252,0.55)',
    borderWidth: 1.5,
  },
  circleFuture: {
    opacity: 0.35,
  },
  checkmark: { ...textStyles.caption2, color: '#fff', fontWeight: '700' },
  crossmark:  { ...textStyles.caption2, color: '#fff', fontWeight: '700' },
});

const TYPE_ICON_BG: Record<string, string> = {
  done: 'rgba(168,85,247,0.25)',
  time: 'rgba(59,130,246,0.25)',
  bad: 'rgba(239,68,68,0.20)',
};

const TYPE_ICON_BORDER: Record<string, string> = {
  done: 'rgba(192,132,252,0.40)',
  time: 'rgba(96,165,250,0.40)',
  bad: 'rgba(248,113,113,0.40)',
};

interface HabitCardProps {
  habit: Habit;
  log: HabitLog | undefined;
  onPress: (habit: Habit) => void;
}

function DoneHabitCard({ habit, log, onPress }: { habit: DoneHabit; log: HabitLog | undefined; onPress: () => void }) {
  const toggleLog = useHabitStore((state) => state.toggleLog);
  const streak = useStreak(habit.id);

  return (
    <TouchableOpacity
      style={styles.cardOuter}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <BlurView intensity={28} tint="dark" style={styles.blurCard}>
        <View style={styles.glassOverlay} />
        <View style={styles.specularLine} />
        <View style={styles.cardInner}>
          <View style={styles.topRow}>
            <View style={[styles.iconBox, { backgroundColor: TYPE_ICON_BG.done, borderColor: TYPE_ICON_BORDER.done }]}>
              <HabitIcon icon={habit.icon} size={22} color="rgba(255,255,255,0.90)" />
            </View>
            <View style={styles.nameCol}>
              <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
              <Text style={styles.subInfo}>
                {streak.currentStreak > 0 ? `🔥 ${streak.currentStreak} gün seri` : 'Seri yok'}
              </Text>
            </View>
            <View style={styles.rightAction}>
              <DoneToggle
                status={log?.status}
                onChange={(status) => {
                  toggleLog(habit.id, getTodayString());
                  void status;
                }}
                habitId={habit.id}
                compact
              />
            </View>
          </View>
          <DoneWeekDots habitId={habit.id} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

function TimeHabitCard({ habit, log, onPress }: { habit: TimeHabit; log: HabitLog | undefined; onPress: () => void }) {
  const streak = useStreak(habit.id);
  const progress = Math.min(1, (log?.elapsedMinutes ?? 0) / habit.goalMinutes);
  const pct = Math.round(progress * 100);
  const progressBarWidth = `${pct}%` as `${number}%`;

  return (
    <TouchableOpacity
      style={styles.cardOuter}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <BlurView intensity={28} tint="dark" style={styles.blurCard}>
        <View style={styles.glassOverlay} />
        <View style={styles.specularLine} />
        <View style={styles.cardInner}>
          <View style={styles.topRow}>
            <View style={[styles.iconBox, { backgroundColor: TYPE_ICON_BG.time, borderColor: TYPE_ICON_BORDER.time }]}>
              <HabitIcon icon={habit.icon} size={22} color="rgba(255,255,255,0.90)" />
            </View>
            <View style={styles.nameCol}>
              <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
              <Text style={styles.subInfo}>
                {streak.currentStreak > 0 ? `🔥 ${streak.currentStreak} gün seri` : `Hedef: ${formatMinutes(habit.goalMinutes)}`}
              </Text>
            </View>
            <Text style={styles.pctText}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progressBarWidth, backgroundColor: '#3b82f6' }]} />
          </View>
          {(log?.elapsedMinutes ?? 0) > 0 && (
            <Text style={styles.timeLoggedText}>
              ⏱ {formatMinutes(log!.elapsedMinutes!)} / {formatMinutes(habit.goalMinutes)} çalışıldı
            </Text>
          )}
          <DoneWeekDots habitId={habit.id} />
          <TimeTracker habit={habit} log={log} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

function BadHabitCard({ habit, log, onPress }: { habit: BadHabit; log: HabitLog | undefined; onPress: () => void }) {
  const streak = useStreak(habit.id);
  const progress = Math.min(1, (log?.usedMinutes ?? 0) / habit.limitMinutes);
  const pct = Math.round(progress * 100);
  const progressBarWidth = `${pct}%` as `${number}%`;

  return (
    <TouchableOpacity
      style={styles.cardOuter}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <BlurView intensity={28} tint="dark" style={styles.blurCard}>
        <View style={styles.glassOverlay} />
        <View style={styles.specularLine} />
        <View style={styles.cardInner}>
          <View style={styles.topRow}>
            <View style={[styles.iconBox, { backgroundColor: TYPE_ICON_BG.bad, borderColor: TYPE_ICON_BORDER.bad }]}>
              <HabitIcon icon={habit.icon} size={22} color="rgba(255,255,255,0.90)" />
            </View>
            <View style={styles.nameCol}>
              <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
              <View style={styles.limitRow}>
                <Text style={styles.limitBadge}>Limit: {formatMinutes(habit.limitMinutes)}/gün</Text>
                {streak.currentStreak > 0 && (
                  <Text style={styles.subInfo}>🔥 {streak.currentStreak} gün seri</Text>
                )}
              </View>
            </View>
            <Text style={[styles.pctText, { color: pct >= 80 ? '#F87171' : pct >= 50 ? '#FCD34D' : 'rgba(255,255,255,0.80)' }]}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {
              width: progressBarWidth,
              backgroundColor: pct >= 80 ? COLORS.danger : pct >= 50 ? COLORS.warning : COLORS.success,
            }]} />
          </View>
          <BadHabitCounter habit={habit} log={log} />
          <BadWeekDots habitId={habit.id} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

export function HabitCard({ habit, log, onPress }: HabitCardProps) {
  const handlePress = () => onPress(habit);

  if (habit.type === 'done') {
    return <DoneHabitCard habit={habit as DoneHabit} log={log} onPress={handlePress} />;
  }
  if (habit.type === 'time') {
    return <TimeHabitCard habit={habit as TimeHabit} log={log} onPress={handlePress} />;
  }
  if (habit.type === 'bad') {
    return <BadHabitCard habit={habit as BadHabit} log={log} onPress={handlePress} />;
  }

  return null;
}

const styles = StyleSheet.create({
  cardOuter: {
    marginBottom: 12,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#14003C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 40,
    elevation: 16,
  },
  blurCard: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 22,
  },
  specularLine: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 1,
  },
  cardInner: {
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconEmoji: {
    fontSize: 22,
  },
  nameCol: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...textStyles.subheadSemibold,
    color: textColors.primary,
  },
  subInfo: {
    ...textStyles.caption2,
    color: textColors.tertiary,
  },
  rightAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    ...textStyles.title2Bold,
    color: textColors.primary,
    minWidth: 44,
    textAlign: 'right',
  },
  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeLoggedText: {
    ...textStyles.caption2,
    color: 'rgba(96,165,250,0.85)',
    fontWeight: '600',
    marginTop: 2,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  limitBadge: {
    ...textStyles.caption2Medium,
    color: 'rgba(248,113,113,0.85)',
    backgroundColor: 'rgba(239,68,68,0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.28)',
    overflow: 'hidden',
  },
});
