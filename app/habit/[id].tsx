import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore, SLEEP_HABIT_ID, SLEEP_HABIT } from '@/src/store/useHabitStore';
import { useTranslation } from '@/src/hooks/useTranslation';
import { TimerDisplay } from '@/components/habits/TimerDisplay';
import { DoneToggle } from '@/components/habits/DoneToggle';
import { BadHabitCounter } from '@/components/habits/BadHabitCounter';
import { StreakFire } from '@/components/habits/StreakFire';
import { MonthlyHeatmap } from '@/components/stats/MonthlyHeatmap';
import { useStreak } from '@/src/hooks/useStreak';
import { getTodayString } from '@/src/utils/date';
import { DoneHabit, TimeHabit, BadHabit } from '@/src/types/habit';
import { COLORS } from '@/constants/colors';
import { HabitIcon } from '@/components/ui/HabitIcon';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';
import { deleteHabitService, upsertLog } from '@/src/services/habits';
import { cancelHabitReminder } from '@/src/services/notifications';
import { useAuthStore } from '@/src/store/useAuthStore';
import { formatMinutes } from '@/src/utils/formatTime';

function GlassStatCard({ value, label }: { value: string; label: string }) {
  return (
    <BlurView intensity={16} tint="dark" style={statStyles.card}>
      <View style={statStyles.overlay} />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </BlurView>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  value: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary[300],
  },
  label: {
    fontSize: FONTS.size.xs,
    color: 'rgba(255,255,255,0.38)',
    textAlign: 'center',
  },
});

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const i18n = useTranslation();
  const { habits, logs, getTodayLog, toggleLog, deleteHabit } = useHabitStore();

  const habit = habits.find((h) => h.id === id) || (id === SLEEP_HABIT_ID ? SLEEP_HABIT : undefined);
  const todayLog = getTodayLog(id ?? '');
  const streak = useStreak(id ?? '');
  const { user, isGuest } = useAuthStore();

  const [editingEntry, setEditingEntry] = React.useState<LogEntry | null>(null);
  const [editValue, setEditValue] = React.useState('');

  const handleDeleteEntry = (entryId: string) => {
    if (!todayLog || !todayLog.entries) return;
    const entry = todayLog.entries.find(e => e.id === entryId);
    if (!entry) return;

    Alert.alert(
      i18n.deleteEntryTitle,
      i18n.deleteHabitConfirm(formatMinutes(entry.minutes)),
      [
        { text: i18n.cancel, style: 'cancel' },
        { 
          text: i18n.deleteLabel, 
          style: 'destructive',
          onPress: async () => {
            const newEntries = todayLog.entries!.filter(e => e.id !== entryId);
            let updatedLog: Partial<HabitLog> = { entries: newEntries };
            
            if (habit?.type === 'time') {
              updatedLog.elapsedMinutes = newEntries.reduce((sum, e) => sum + e.minutes, 0);
            } else if (habit?.type === 'bad') {
              const badH = habit as BadHabit;
              const newTotal = newEntries.reduce((sum, e) => sum + e.minutes, 0);
              updatedLog.usedMinutes = newTotal;
              updatedLog.status = newTotal <= (badH.limitMinutes || 60) ? 'done' : 'failed';
            }

            updateLog(habit!.id, todayLog.date, updatedLog);
            if (!isGuest && user?.id) {
              await upsertLog(user.id, { ...todayLog, ...updatedLog }, habit!.type);
            }
          }
        }
      ]
    );
  };

  const handleEditEntry = (entry: LogEntry) => {
    setEditingEntry(entry);
    setEditValue(String(entry.minutes));
  };

  const handleSaveEdit = async () => {
    if (!editingEntry || !todayLog || !todayLog.entries) return;
    const newMins = parseInt(editValue, 10);
    if (isNaN(newMins) || newMins < 0) return;

    const newEntries = todayLog.entries.map(e => 
      e.id === editingEntry.id ? { ...e, minutes: newMins } : e
    );

    let updatedLog: Partial<HabitLog> = { entries: newEntries };
    if (habit?.type === 'time') {
      updatedLog.elapsedMinutes = newEntries.reduce((sum, e) => sum + e.minutes, 0);
    } else if (habit?.type === 'bad') {
      const badH = habit as BadHabit;
      const newTotal = newEntries.reduce((sum, e) => sum + e.minutes, 0);
      updatedLog.usedMinutes = newTotal;
      updatedLog.status = newTotal <= (badH.limitMinutes || 60) ? 'done' : 'failed';
    }

    updateLog(habit!.id, todayLog.date, updatedLog);
    if (!isGuest && user?.id) {
      await upsertLog(user.id, { ...todayLog, ...updatedLog }, habit!.type);
    }
    setEditingEntry(null);
  };

  const renderEntriesList = (log: HabitLog | undefined) => {
    if (!log || !log.entries || !Array.isArray(log.entries) || log.entries.length === 0) return null;
    return (
      <View style={{ marginTop: 24, gap: 12, paddingHorizontal: 4 }}>
        <Text style={styles.sectionLabel}>{i18n.dailyRecords}</Text>
        {log.entries.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((entry) => (
          <BlurView key={entry.id} intensity={20} tint="dark" style={entryStyles.card}>
            <View style={entryStyles.row}>
              <View style={entryStyles.info}>
                <Text style={entryStyles.timeText}>{formatMinutes(entry.minutes)}</Text>
                {entry.note && <Text style={entryStyles.noteText} numberOfLines={1}>{entry.note}</Text>}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity 
                  style={[entryStyles.actionBtn, { backgroundColor: 'rgba(168,85,247,0.1)' }]}
                  onPress={() => handleEditEntry(entry)}
                >
                  <Ionicons name="create-outline" size={18} color="#c084fc" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[entryStyles.actionBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}
                  onPress={() => handleDeleteEntry(entry.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#f87171" />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        ))}
      </View>
    );
  };

  const today = new Date();
  const habitLogs = logs.filter((l) => l.habitId === id);

  const heatmapData = habitLogs.map((l) => {
    let rate = 0;
    if (!habit) return { date: l.date, completionRate: 0 };

    if (habit.type === 'done') {
      rate = l.status === 'done' ? 1 : 0;
    } else if (habit.type === 'time') {
      const elapsed = l.elapsedMinutes ?? 0;
      rate = Math.min(1, elapsed / (habit as TimeHabit).goalMinutes);
    } else if (habit.type === 'bad') {
      const badH = habit as BadHabit;
      if (badH.limitType === 'count') {
        const used = l.usedCount ?? 0;
        rate = used <= badH.limitCount ? 1 : Math.max(0, 1 - (used - badH.limitCount) / badH.limitCount);
      } else {
        const used = l.usedMinutes ?? 0;
        rate = used <= badH.limitMinutes ? 1 : Math.max(0, 1 - (used - badH.limitMinutes) / badH.limitMinutes);
      }
    }
    return { date: l.date, completionRate: rate };
  });

  if (!habit) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1e0530', '#060412']} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>{i18n.habitNotFound}</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
              <LinearGradient colors={['#9333ea', '#7c3aed']} style={styles.backBtnGrad}>
                <Text style={styles.backBtnText}>{i18n.backBtn}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const renderDoneContent = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Streak card */}
      <BlurView intensity={18} tint="dark" style={styles.glassCard}>
        <View style={styles.cardOverlay} />
        <View style={styles.cardSpecular} />
        <View style={styles.cardPadded}>
          <StreakFire count={streak.currentStreak} size="lg" />
          <View style={{ gap: 2 }}>
            <Text style={styles.streakTitle}>{streak.currentStreak}{i18n.streakDayLabel}</Text>
            <Text style={styles.streakSubtitle}>{i18n.longestStreakLabel}: {streak.longestStreak} {i18n.dayUnit}</Text>
          </View>
        </View>
      </BlurView>

      {/* Today toggle */}
      <BlurView intensity={18} tint="dark" style={styles.glassCard}>
        <View style={styles.cardOverlay} />
        <View style={styles.cardSpecular} />
        <View style={styles.cardPadded}>
          <Text style={styles.sectionLabel}>{i18n.today.toUpperCase()}</Text>
          <DoneToggle
            status={todayLog?.status}
            onChange={() => toggleLog(habit.id, getTodayString())}
            habitId={habit.id}
          />
        </View>
      </BlurView>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <GlassStatCard value={String(streak.totalDays)} label={i18n.totalDaysLabel} />
        <GlassStatCard value={String(streak.longestStreak)} label={i18n.longestStreakLabel} />
        <GlassStatCard
          value={habitLogs.length > 0 ? `${Math.round((streak.totalDays / habitLogs.length) * 100)}%` : '0%'}
          label={i18n.completionLabel}
        />
      </View>

      {/* Calendar */}
      <MonthlyHeatmap
        data={heatmapData}
        year={today.getFullYear()}
        month={today.getMonth() + 1}
      />
    </ScrollView>
  );

  const renderSleepContent = () => {
    const sleepMins = todayLog?.elapsedMinutes ?? 0;
    const sleepH = Math.floor(sleepMins / 60);
    const sleepM = sleepMins % 60;
    const durationStr = sleepMins > 0 
      ? (sleepH > 0 
          ? `${sleepH} ${i18n.hourUnit} ${sleepM > 0 ? `${sleepM} ${i18n.minuteUnit}` : ''}` 
          : `${sleepM} ${i18n.minuteUnit}`)
      : null;

    let bedH: number | null = null, bedM: number | null = null;
    let wakeH: number | null = null, wakeM: number | null = null;
    if (todayLog?.note) {
      try {
        const parsed = JSON.parse(todayLog.note);
        bedH = parsed.bedH; bedM = parsed.bedM;
        wakeH = parsed.wakeH; wakeM = parsed.wakeM;
      } catch { /* ignore */ }
    }

    const fmt = (h: number, m: number) =>
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    const goalMins = (habit as TimeHabit).goalMinutes;
    const progress = sleepMins > 0 ? Math.min(1, sleepMins / goalMins) : 0;
    const isGoalMet = sleepMins >= goalMins;

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ring + süre */}
        <BlurView intensity={18} tint="dark" style={styles.glassCard}>
          <View style={styles.cardOverlay} />
          <View style={styles.cardSpecular} />
          <View style={[styles.cardPadded, { justifyContent: 'center', flexDirection: 'column', gap: 20 }]}>
            {/* Progress ring */}
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center' }}>
                {/* Track */}
                <View style={sleepDetailStyles.ringTrack} />
                {/* Fill — simple arc via border trick */}
                <LinearGradient
                  colors={isGoalMet ? ['#6d28d9', '#a855f7', '#ec4899'] : ['#7c3aed', '#a855f7']}
                  style={[sleepDetailStyles.ringFill, { opacity: Math.max(0.25, progress) }]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                />
                <View style={sleepDetailStyles.ringInner}>
                  <Text style={sleepDetailStyles.ringEmoji}>🌙</Text>
                  {durationStr ? (
                    <>
                    <Text style={[sleepDetailStyles.ringDuration, isGoalMet && { color: '#e9d5ff' }]}>
                        {sleepH > 0 ? `${sleepH}${i18n.hourUnitShort}` : ''}{sleepM > 0 ? ` ${sleepM}${i18n.minUnitShort}` : ''}
                      </Text>
                      <Text style={sleepDetailStyles.ringLabel}>
                        {isGoalMet ? `🎉 ${i18n.goalMet}` : `${i18n.goalLabel}: ${Math.floor(goalMins / 60)} ${i18n.hourUnit}`}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={sleepDetailStyles.ringNoData}>—</Text>
                      <Text style={sleepDetailStyles.ringLabel}>{i18n.noDataToday}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Yatış / Uyanış saatleri */}
            {bedH !== null && wakeH !== null && (
              <View style={sleepDetailStyles.timesRow}>
                <View style={sleepDetailStyles.timeBlock}>
                  <Text style={sleepDetailStyles.timeVal}>{fmt(bedH!, bedM!)}</Text>
                  <Text style={sleepDetailStyles.timeLabel}>{i18n.bedtimeModal.toUpperCase()}</Text>
                </View>
                <Text style={sleepDetailStyles.arrow}>→</Text>
                <View style={sleepDetailStyles.timeBlock}>
                  <Text style={sleepDetailStyles.timeVal}>{fmt(wakeH!, wakeM!)}</Text>
                  <Text style={sleepDetailStyles.timeLabel}>{i18n.wakeUpModal.toUpperCase()}</Text>
                </View>
              </View>
            )}

            {!durationStr && (
              <Text style={sleepDetailStyles.hint}>
                {i18n.sleepDetailHint}
              </Text>
            )}
          </View>
        </BlurView>

        {/* Streak */}
        <BlurView intensity={18} tint="dark" style={styles.glassCard}>
          <View style={styles.cardOverlay} />
          <View style={styles.cardSpecular} />
          <View style={styles.cardPadded}>
            <StreakFire count={streak.currentStreak} size="lg" />
            <View style={{ gap: 2 }}>
              <Text style={styles.streakTitle}>{streak.currentStreak}{i18n.streakDayLabel}</Text>
              <Text style={styles.streakSubtitle}>{i18n.longestStreakLabel}: {streak.longestStreak} {i18n.dayUnit}</Text>
            </View>
          </View>
        </BlurView>

        {/* Stats */}
        <View style={styles.statsRow}>
          <GlassStatCard value={String(streak.totalDays)} label={i18n.totalDaysLabel} />
          <GlassStatCard value={String(streak.longestStreak)} label={i18n.longestStreakLabel} />
          <GlassStatCard
            value={`${Math.floor(goalMins / 60)}${i18n.hourUnitShort}`}
            label={i18n.dailyGoalLabel}
          />
        </View>

        {/* Heatmap */}
        <MonthlyHeatmap
          data={heatmapData}
          year={today.getFullYear()}
          month={today.getMonth() + 1}
        />
      </ScrollView>
    );
  };

  const renderTimeLogContent = () => {
    const timeHabit = habit as TimeHabit;
    const elapsedMins = todayLog?.elapsedMinutes ?? 0;
    const goalMins = timeHabit.goalMinutes;
    const progress = goalMins > 0 ? Math.min(1, elapsedMins / goalMins) : (elapsedMins > 0 ? 1 : 0);
    const isGoalMet = goalMins > 0 ? elapsedMins >= goalMins : elapsedMins > 0;
    const elapsedH = Math.floor(elapsedMins / 60);
    const elapsedM = elapsedMins % 60;
    const elapsedStr = elapsedMins > 0 
      ? (elapsedH > 0 
          ? `${elapsedH}${i18n.hourUnitShort}${elapsedM > 0 ? ` ${elapsedM}${i18n.minUnitShort}` : ''}` 
          : `${elapsedMins}${i18n.minUnitShort}`)
      : null;

    // Total logged this week
    const today2 = new Date();
    const dow = today2.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today2);
      d.setDate(today2.getDate() + mondayOffset + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const weekMins = habitLogs
      .filter((l) => weekDates.includes(l.date))
      .reduce((s, l) => s + (l.elapsedMinutes ?? 0), 0);

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Bugünkü kayıt */}
        <BlurView intensity={18} tint="dark" style={styles.glassCard}>
          <View style={styles.cardOverlay} />
          <View style={styles.cardSpecular} />
          <View style={[styles.cardPadded, { flexDirection: 'column', alignItems: 'center', gap: 20 }]}>
            {/* Progress ring */}
            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center' }}>
                <View style={timeDetailStyles.ringTrack} />
                <LinearGradient
                  colors={isGoalMet ? ['#6d28d9', '#a855f7', '#ec4899'] : ['#7c3aed', '#a855f7']}
                  style={[timeDetailStyles.ringFill, { opacity: Math.max(0.20, progress) }]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                />
                <View style={{ alignItems: 'center', gap: 4 }}>
                  <HabitIcon icon={habit.icon} size={28} color="rgba(255,255,255,0.90)" />
                  {elapsedStr ? (
                    <>
                      <Text style={[timeDetailStyles.ringDuration, isGoalMet && { color: '#e9d5ff' }]}>
                        {elapsedStr}
                      </Text>
                      <Text style={timeDetailStyles.ringLabel}>
                        {isGoalMet ? `🎉 ${i18n.completed}!` : goalMins > 0 ? `${i18n.goalLabel}: ${Math.floor(goalMins / 60) > 0 ? Math.floor(goalMins / 60) + i18n.hourUnitShort + ' ' : ''}${goalMins % 60 > 0 ? (goalMins % 60) + i18n.minUnitShort : ''}` : i18n.hasData}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={timeDetailStyles.ringNoData}>—</Text>
                      <Text style={timeDetailStyles.ringLabel}>{i18n.noDataToday}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
            <Text style={timeDetailStyles.hint}>
              {elapsedStr
                ? i18n.recordedToday.replace('%s', elapsedStr)
                : i18n.timeDetailHint}
            </Text>
          </View>
        </BlurView>

        {/* Günlük kayıtlar listesi */}
        {renderEntriesList(todayLog)}

        {/* Streak */}
        <BlurView intensity={18} tint="dark" style={styles.glassCard}>
          <View style={styles.cardOverlay} />
          <View style={styles.cardSpecular} />
          <View style={styles.cardPadded}>
            <StreakFire count={streak.currentStreak} size="lg" />
            <View style={{ gap: 2 }}>
              <Text style={styles.streakTitle}>{streak.currentStreak}{i18n.streakDayLabel}</Text>
              <Text style={styles.streakSubtitle}>{i18n.longestStreakLabel}: {streak.longestStreak} {i18n.dayUnit}</Text>
            </View>
          </View>
        </BlurView>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <GlassStatCard value={String(streak.totalDays)} label={i18n.totalDaysLabel} />
          <GlassStatCard
            value={weekMins > 59 ? `${Math.floor(weekMins / 60)}${i18n.hourUnitShort}` : `${weekMins}${i18n.minUnitShort}`}
            label={i18n.thisWeek}
          />
          <GlassStatCard
            value={goalMins > 0 ? (Math.floor(goalMins / 60) > 0 ? `${Math.floor(goalMins / 60)}${i18n.hourUnitShort}` : `${goalMins}${i18n.minUnitShort}`) : '—'}
            label={i18n.dailyGoalLabel}
          />
        </View>

        {/* Monthly heatmap */}
        <MonthlyHeatmap
          data={heatmapData}
          year={today.getFullYear()}
          month={today.getMonth() + 1}
        />
      </ScrollView>
    );
  };

  const renderTimeContent = () => {
    if (habit.id === SLEEP_HABIT_ID) return renderSleepContent();
    return renderTimeLogContent();
  };

  const renderBadContent = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Streak card */}
      <BlurView intensity={18} tint="dark" style={styles.glassCard}>
        <View style={styles.cardOverlay} />
        <View style={styles.cardSpecular} />
        <View style={styles.cardPadded}>
          <StreakFire count={streak.currentStreak} size="lg" />
          <View style={{ gap: 2 }}>
            <Text style={styles.streakTitle}>{streak.currentStreak} {i18n.streakDayLabel}</Text>
            <Text style={styles.streakSubtitle}>{i18n.badHabitStreakSub}</Text>
          </View>
        </View>
      </BlurView>

      {/* Counter — sadece süre bazlı bad habit için */}
      {(habit as BadHabit).limitType === 'time' && (
        <>
          <BlurView intensity={18} tint="dark" style={styles.glassCard}>
            <View style={styles.cardOverlay} />
            <View style={styles.cardSpecular} />
            <View style={styles.cardPadded}>
              <Text style={styles.sectionLabel}>{i18n.today.toUpperCase()}</Text>
              <BadHabitCounter habit={habit as BadHabit} log={todayLog} />
            </View>
          </BlurView>
          {renderEntriesList(todayLog)}
        </>
      )}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <GlassStatCard value={String(streak.currentStreak || 0)} label={i18n.currentStreakLabel} />
        <GlassStatCard value={String(streak.longestStreak || 0)} label={i18n.longestStreakLabel} />
        {((habit as BadHabit).limitType === 'count' || (!(habit as BadHabit).limitType && (habit as BadHabit).limitCount))
          ? <GlassStatCard value={`${(habit as BadHabit).limitCount || 0} ${i18n.timesUnit}`} label={i18n.limitLabel} />
          : <GlassStatCard value={`${(habit as BadHabit).limitMinutes || 0} ${i18n.minUnitShort}`} label={i18n.dailyLimitLabel} />
        }
      </View>

      {/* Calendar */}
      <MonthlyHeatmap
        data={heatmapData}
        year={today.getFullYear()}
        month={today.getMonth() + 1}
      />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1e0530', '#15032a', '#060412']}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Pink orb */}
      <LinearGradient
        colors={['rgba(236,72,153,0.25)', 'transparent']}
        style={[StyleSheet.absoluteFillObject, { top: -60 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        pointerEvents="none"
      />
      {/* Blue orb */}
      <LinearGradient
        colors={['rgba(59,130,246,0.18)', 'transparent']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 1, y: 0.5 }}
        end={{ x: 0.3, y: 1 }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Custom header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBackBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <LinearGradient
              colors={['rgba(168,85,247,0.30)', 'rgba(109,40,217,0.20)']}
              style={styles.headerBtnGrad}
            >
              <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.85)" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <HabitIcon icon={habit.icon} size={28} color="rgba(255,255,255,0.90)" />
            <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>
          </View>

          <View style={styles.headerRightBtns}>
            <TouchableOpacity
              onPress={() => router.push(`/habit/edit/${habit.id}`)}
              style={styles.headerEditBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <LinearGradient
                colors={['rgba(168,85,247,0.30)', 'rgba(109,40,217,0.20)']}
                style={styles.headerBtnGrad}
              >
                <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.85)" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  i18n.deleteHabitTitle,
                  i18n.deleteHabitConfirm(habit.name),
                  [
                    { text: i18n.cancel, style: 'cancel' },
                    {
                      text: i18n.deleteLabel, style: 'destructive',
                      onPress: async () => { 
                        await cancelHabitReminder(habit.id);
                        await deleteHabitService(habit.id);
                        deleteHabit(habit.id); 
                        router.back(); 
                      },
                    },
                  ]
                );
              }}
              style={styles.headerDeleteBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <LinearGradient
                colors={['rgba(239,68,68,0.25)', 'rgba(185,28,28,0.15)']}
                style={styles.headerBtnGrad}
              >
                <Ionicons name="trash-outline" size={20} color="#f87171" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {habit.type === 'done' && renderDoneContent()}
        {habit.type === 'time' && renderTimeContent()}
        {habit.type === 'bad' && renderBadContent()}
      </SafeAreaView>

      {/* Edit Entry Modal */}
      <Modal
        visible={editingEntry !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingEntry(null)}
      >
        <View style={entryStyles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
          <View style={entryStyles.modalContent}>
            <Text style={entryStyles.modalTitle}>{i18n.edit} ({i18n.minuteUnit})</Text>
            <TextInput
              style={entryStyles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              autoFocus
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
            <View style={entryStyles.modalBtns}>
              <TouchableOpacity style={entryStyles.modalCancel} onPress={() => setEditingEntry(null)}>
                <Text style={entryStyles.modalCancelText}>{i18n.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={entryStyles.modalSave} onPress={handleSaveEdit}>
                <Text style={entryStyles.modalSaveText}>{i18n.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.detail,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  headerRightBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  headerEditBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  headerDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  headerBtnGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: LAYOUT.spacing.sm,
  },
  habitIcon: {
    fontSize: 22,
  },
  habitName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold,
    color: 'rgba(255,255,255,0.90)',
  },
  scrollContent: {
    padding: LAYOUT.spacing.md,
    gap: LAYOUT.spacing.md,
    paddingBottom: 100,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
  },
  cardSpecular: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 1,
  },
  cardPadded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
    padding: LAYOUT.spacing.md,
    flexWrap: 'wrap',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: FONTS.weight.semibold,
    color: 'rgba(255,255,255,0.32)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    width: '100%',
    marginBottom: 6,
  },
  streakTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: 'rgba(255,255,255,0.90)',
  },
  streakSubtitle: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.40)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: LAYOUT.spacing.md,
  },
  notFoundText: {
    fontSize: FONTS.size.lg,
    color: 'rgba(255,255,255,0.55)',
  },
  backBtnWrapper: {
    borderRadius: LAYOUT.radius.lg,
    overflow: 'hidden',
  },
  backBtnGrad: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: LAYOUT.radius.lg,
  },
  backBtnText: {
    color: COLORS.neutral[0],
    fontWeight: FONTS.weight.semibold,
  },
});

const entryStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  noteText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSave: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const timeDetailStyles = StyleSheet.create({
  ringTrack: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    borderWidth: 14, borderColor: 'rgba(255,255,255,0.10)',
  },
  ringFill: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    borderWidth: 14, borderColor: 'transparent',
  },
  ringEmoji: { fontSize: 28, marginBottom: 2 },
  ringDuration: {
    fontSize: 32, fontWeight: '800', color: '#c4b5fd', letterSpacing: -1,
  },
  ringLabel: { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  ringNoData: { fontSize: 36, fontWeight: '300', color: 'rgba(255,255,255,0.25)' },
  hint: {
    fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center',
    lineHeight: 20, paddingHorizontal: 8,
  },
});

const sleepDetailStyles = StyleSheet.create({
  ringTrack: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    borderWidth: 14, borderColor: 'rgba(255,255,255,0.10)',
  },
  ringFill: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    borderWidth: 14, borderColor: 'transparent',
  },
  ringInner: { alignItems: 'center', gap: 4 },
  ringEmoji: { fontSize: 28, marginBottom: 2 },
  ringDuration: {
    fontSize: 32, fontWeight: '800', color: '#c4b5fd', letterSpacing: -1,
  },
  ringLabel: { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  ringNoData: { fontSize: 36, fontWeight: '300', color: 'rgba(255,255,255,0.25)' },

  timesRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20,
    paddingVertical: 4,
  },
  timeBlock: { alignItems: 'center', gap: 4 },
  timeVal: { fontSize: 28, fontWeight: '700', color: '#7dd3fc', letterSpacing: -0.5 },
  timeLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.38)', letterSpacing: 1.2, textTransform: 'uppercase' },
  arrow: { fontSize: 20, color: 'rgba(255,255,255,0.35)', marginBottom: 14 },

  hint: {
    fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center',
    lineHeight: 20, paddingHorizontal: 8,
  },
});
