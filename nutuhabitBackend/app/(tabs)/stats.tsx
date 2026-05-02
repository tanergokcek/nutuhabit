import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useHabitStore } from '@/src/store/useHabitStore';
import { WeeklyChart } from '@/components/stats/WeeklyChart';
import { MonthlyHeatmap } from '@/components/stats/MonthlyHeatmap';
import { TrendLine } from '@/components/stats/TrendLine';
import { HabitTypeDonut } from '@/components/stats/HabitTypeDonut';
import { TopHabitsBar, HabitBarItem } from '@/components/stats/TopHabitsBar';
import { TimeHabit, BadHabit } from '@/src/types/habit';
import { useHabitProgress } from '@/src/hooks/useHabitProgress';
import { getWeekDates, getTodayString } from '@/src/utils/date';
import { formatDuration } from '@/src/utils/formatTime';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { textStyles } from '@/constants/typography';
import { useAppTheme, ThemeTokens } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';

function makeStyles(t: ThemeTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.screenBg,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      padding: LAYOUT.spacing.md,
      gap: LAYOUT.spacing.md,
      paddingBottom: 100,
    },
    header: {
      paddingTop: LAYOUT.spacing.sm,
    },
    title: {
      ...textStyles.title2Bold,                     // 22pt bold — ekran başlığı
      color: t.t1,
    },
    subtitle: {
      ...textStyles.footnote,                       // 13pt — alt açıklama
      color: t.t3,
      marginTop: 2,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    summaryCard: {
      flex: 1,
      minWidth: '44%',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.cardBorder,
      padding: 14,
      alignItems: 'center',
      gap: 4,
      overflow: 'hidden',
      shadowColor: t.cardShadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.30,
      shadowRadius: 16,
      elevation: 8,
    },
    summaryEmoji: {
      fontSize: 22,
      marginBottom: 2,
    },
    summaryValue: {
      ...textStyles.title3Semibold,                 // 20pt semibold — summary rakam
      color: t.tAccent,
    },
    summaryLabel: {
      ...textStyles.caption2,                       // 11pt — kart etiketi
      color: t.t3,
      textAlign: 'center',
    },
    timeSummary: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.cardBorder,
      padding: LAYOUT.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: LAYOUT.spacing.sm,
      overflow: 'hidden',
      shadowColor: t.cardShadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 16,
      elevation: 8,
    },
    timeSummaryEmoji: {
      fontSize: 24,
    },
    timeSummaryText: {
      ...textStyles.subhead,                        // 15pt — özet metin
      color: t.t2,
      flex: 1,
    },
    timeSummaryBold: {
      fontWeight: '700',
      color: t.tAccent,
    },
  });
}

export default function StatsScreen() {
  const t = useAppTheme();
  const i18n = useTranslation();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { habits, logs } = useHabitStore();
  const { completionRate, completedCount, totalCount } = useHabitProgress('all');

  const today = new Date();
  const todayStr = getTodayString();

  const weekDates = getWeekDates(todayStr);
  const weeklyChartData = useMemo(() => {
    return weekDates.map((date) => {
      const dayLogs = logs.filter((l) => l.date === date);
      const activeHabits = habits.filter((h) => !h.isArchived);
      if (activeHabits.length === 0) return { date, completionRate: 0 };

      let dayCompletedCount = 0;
      for (const habit of activeHabits) {
        const log = dayLogs.find((l) => l.habitId === habit.id);
        if (!log) continue;
        if (habit.type === 'done' && log.status === 'done') dayCompletedCount++;
        else if (habit.type === 'time') {
          const elapsed = log.elapsedMinutes ?? 0;
          if (elapsed >= (habit as { goalMinutes: number }).goalMinutes) dayCompletedCount++;
        } else if (habit.type === 'bad') {
          const used = log.usedMinutes ?? 0;
          if (used <= (habit as { limitMinutes: number }).limitMinutes) dayCompletedCount++;
        }
      }
      return { date, completionRate: dayCompletedCount / activeHabits.length };
    });
  }, [weekDates, logs, habits]);

  const weeklyTimeMinutes = useMemo(() => {
    return logs
      .filter((l) => weekDates.includes(l.date) && l.elapsedMinutes !== undefined)
      .reduce((acc, l) => acc + (l.elapsedMinutes ?? 0), 0);
  }, [logs, weekDates]);

  const trendData = useMemo(() => {
    return weeklyChartData.map((d) => ({
      label: d.date.slice(5),
      value: Math.round(d.completionRate * 100),
    }));
  }, [weeklyChartData]);

  const monthlyData = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const activeHabits = habits.filter((h) => !h.isArchived);

    const dateSet = new Set(logs.map((l) => l.date).filter((d) => {
      const [y, m] = d.split('-').map(Number);
      return y === year && m === month;
    }));

    return Array.from(dateSet).map((date) => {
      const dayLogs = logs.filter((l) => l.date === date);
      let completed = 0;
      for (const habit of activeHabits) {
        const log = dayLogs.find((l) => l.habitId === habit.id);
        if (!log) continue;
        if (habit.type === 'done' && log.status === 'done') completed++;
        else if (habit.type === 'time') {
          if ((log.elapsedMinutes ?? 0) >= (habit as { goalMinutes: number }).goalMinutes) completed++;
        } else if (habit.type === 'bad') {
          if ((log.usedMinutes ?? 0) <= (habit as { limitMinutes: number }).limitMinutes) completed++;
        }
      }
      const rate = activeHabits.length > 0 ? completed / activeHabits.length : 0;
      return { date, completionRate: rate };
    });
  }, [habits, logs, today]);

  const totalLogs = logs.length;
  const completedLogs = logs.filter((l) => l.status === 'done').length;
  const overallRate = totalLogs > 0 ? completedLogs / totalLogs : 0;

  const pct = Math.round(completionRate * 100);

  const activeHabits = habits.filter((h) => !h.isArchived);
  const doneCount = activeHabits.filter((h) => h.type === 'done').length;
  const timeCount = activeHabits.filter((h) => h.type === 'time').length;
  const badCount = activeHabits.filter((h) => h.type === 'bad').length;

  const topHabitsData = useMemo((): HabitBarItem[] => {
    return habits.filter((h) => !h.isArchived).map((habit) => {
      const habitLogs = logs.filter((l) => l.habitId === habit.id);
      if (habitLogs.length === 0) {
        return { id: habit.id, name: habit.name, icon: habit.icon, rate: 0, type: habit.type };
      }
      let completed = 0;
      for (const log of habitLogs) {
        if (habit.type === 'done' && log.status === 'done') completed++;
        else if (habit.type === 'time') {
          if ((log.elapsedMinutes ?? 0) >= (habit as TimeHabit).goalMinutes) completed++;
        } else if (habit.type === 'bad') {
          if ((log.usedMinutes ?? 0) <= (habit as BadHabit).limitMinutes) completed++;
        }
      }
      return {
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        rate: completed / habitLogs.length,
        type: habit.type,
      };
    });
  }, [habits, logs]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={t.statusBar} />
      <LinearGradient
        colors={t.gradBg as any}
        style={StyleSheet.absoluteFillObject}
      />
      {/* orbs */}
      <LinearGradient
        colors={t.orb1 as any}
        style={[StyleSheet.absoluteFillObject, { top: -80 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={t.orb2 as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 1, y: 0.3 }}
        end={{ x: 0.3, y: 0.8 }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.statsTitle}</Text>
            <Text style={styles.subtitle}>{i18n.statsSubtitle}</Text>
          </View>

          {/* Summary grid */}
          <View style={styles.summaryRow}>
            {([
              { emoji: '📊', value: `${pct}%`, label: i18n.today },
              { emoji: '🎯', value: `${Math.round(overallRate * 100)}%`, label: i18n.overallRate },
              { emoji: '⏱', value: formatDuration(weeklyTimeMinutes), label: i18n.thisWeekLabel },
              { emoji: '✅', value: String(habits.filter((h) => !h.isArchived).length), label: i18n.habitsCount },
            ] as { emoji: string; value: string; label: string }[]).map((item) => (
              <View key={item.label} style={styles.summaryCard}>
                <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
                <LinearGradient
                  colors={t.cardGrad as any}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                />
                <Text style={styles.summaryEmoji}>{item.emoji}</Text>
                <Text style={styles.summaryValue}>{item.value}</Text>
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Weekly chart */}
          <WeeklyChart data={weeklyChartData} />

          {/* Time summary */}
          {weeklyTimeMinutes > 0 ? (
            <View style={styles.timeSummary}>
              <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
              <LinearGradient
                colors={t.cardGrad as any}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              />
              <Text style={styles.timeSummaryEmoji}>⏱</Text>
              <Text style={styles.timeSummaryText}>
                {i18n.workedThisWeek(formatDuration(weeklyTimeMinutes)).split(formatDuration(weeklyTimeMinutes))[0]}
                <Text style={styles.timeSummaryBold}>{formatDuration(weeklyTimeMinutes)}</Text>
                {i18n.workedThisWeek(formatDuration(weeklyTimeMinutes)).split(formatDuration(weeklyTimeMinutes))[1]}
              </Text>
            </View>
          ) : null}

          {/* Trend */}
          <TrendLine
            data={trendData}
            title={i18n.weeklyTrend}
            color={COLORS.primary[400]}
          />

          {/* Monthly heatmap */}
          <MonthlyHeatmap
            data={monthlyData}
            year={today.getFullYear()}
            month={today.getMonth() + 1}
          />

          {/* Habit type distribution */}
          <HabitTypeDonut
            doneCount={doneCount}
            timeCount={timeCount}
            badCount={badCount}
          />

          {/* Top habits by completion rate */}
          <TopHabitsBar data={topHabitsData} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
