import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '@/src/store/useHabitStore';
import { getTodayString } from '@/src/utils/date';
import { HabitIcon } from '@/components/ui/HabitIcon';
import { useTranslation } from '@/src/hooks/useTranslation';

function makeDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatSelected(ds: string, i18n: any) {
  const [y, m, d] = ds.split('-');
  const monthName = i18n.monthNames[parseInt(m) - 1].slice(0, 3);
  return `${parseInt(d)} ${monthName} ${y}`;
}

export default function CalendarPage() {
  const router = useRouter();
  const i18n = useTranslation();
  const { habits, logs } = useHabitStore();
  const today = new Date();
  const todayStr = getTodayString();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Sunday = 0 (SU MO TU WE TH FR SA)
  const firstWeekdaySun = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [
    ...Array(firstWeekdaySun).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const activeHabits = habits.filter(h => !h.isArchived);
  const selectedLogs = logs.filter(l => l.date === selectedDate);
  const trackedCount = selectedLogs.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1e0a3c', '#130838', '#0a0620', '#060410']}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(109,40,217,0.50)', 'transparent']}
        style={[StyleSheet.absoluteFillObject, styles.orb]}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.75)" />
          <Text style={styles.backText}>{i18n.calendarBack}</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Month header */}
          <View style={styles.monthRow}>
            <Text style={styles.monthTitle}>{i18n.monthNames[month]} {year}</Text>
            <View style={styles.monthArrows}>
              <TouchableOpacity style={styles.arrowBtn} onPress={prevMonth} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={16} color="rgba(255,255,255,0.80)" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowBtn} onPress={nextMonth} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.80)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {i18n.dayNamesShort.map(d => (
              <Text key={d} style={styles.dayHeaderText}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.grid}>
            {cells.map((day, idx) => {
              if (day === null) return <View key={`e${idx}`} style={styles.cellEmpty} />;
              const ds = makeDateStr(year, month, day);
              const dayLogs = logs.filter(l => l.date === ds);
              const hasDot = dayLogs.length > 0;
              const isSelected = ds === selectedDate;
              const isToday = ds === todayStr;
              const isFuture = ds > todayStr;

              return (
                <TouchableOpacity
                  key={ds}
                  style={styles.cell}
                  onPress={() => !isFuture && setSelectedDate(ds)}
                  activeOpacity={0.75}
                >
                  {isSelected ? (
                    <LinearGradient colors={['#9333ea', '#7c3aed']} style={styles.cellSelected}>
                      <Text style={styles.cellNumSelected}>{day}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={[
                      styles.cellNum,
                      isToday && styles.cellNumToday,
                      isFuture && styles.cellNumFuture,
                    ]}>{day}</Text>
                  )}
                  {hasDot && !isSelected && (
                    <View style={[styles.dot, isFuture && { opacity: 0.3 }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Selected date info */}
          <View style={styles.dateInfoRow}>
            <Text style={styles.dateInfoLabel}>{formatSelected(selectedDate, i18n)}</Text>
            <Text style={styles.trackedLabel}>{trackedCount} {i18n.habitsTracked}</Text>
          </View>

          {/* Habit list */}
          {activeHabits.map(habit => {
            const log = selectedLogs.find(l => l.habitId === habit.id);
            const isDone = log?.status === 'done';
            const isMissed = !log && selectedDate < todayStr;
            const isFuture = selectedDate > todayStr;

            let badge: { label: string; color: string; bg: string } | null = null;
            if (isDone) badge = { label: `✓ ${i18n.statusDone}`, color: '#4ade80', bg: 'rgba(34,197,94,0.20)' };
            else if (isMissed) badge = { label: `✗ ${i18n.statusMissed}`, color: '#f87171', bg: 'rgba(239,68,68,0.20)' };

            const typeLabel = habit.type === 'done'
              ? i18n.dailyMorning
              : habit.type === 'time'
              ? i18n.weeklyGoalLabel
              : i18n.daily;

            return (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitIconBox}>
                  <HabitIcon icon={habit.icon} size={20} color="rgba(255,255,255,0.90)" />
                </View>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitSub}>{typeLabel}</Text>
                </View>
                {badge && (
                  <View style={[styles.badgeWrap, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                )}
              </View>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  orb: { top: -100, left: -60, width: '85%', height: '50%', borderRadius: 400 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  backRow: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backText: {
    fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: '500',
  },

  monthRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 18, marginTop: 4,
  },
  monthTitle: {
    fontSize: 28, fontWeight: '800', color: '#fff',
    fontFamily: 'InriaSerif_700Bold',
  },
  monthArrows: { flexDirection: 'row', gap: 8 },
  arrowBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  dayHeaders: {
    flexDirection: 'row', marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1, textAlign: 'center',
    fontSize: 11, fontWeight: '700',
    color: 'rgba(255,255,255,0.38)', letterSpacing: 0.3,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  cellEmpty: { width: '14.28%', aspectRatio: 1 },
  cell: {
    width: '14.28%', aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  cellSelected: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cellNumSelected: { fontSize: 14, fontWeight: '700', color: '#fff' },
  cellNum: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.80)' },
  cellNumToday: { color: '#c084fc', fontWeight: '700' },
  cellNumFuture: { color: 'rgba(255,255,255,0.22)' },
  dot: {
    position: 'absolute', bottom: 4,
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#a855f7',
  },

  divider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.09)',
    marginVertical: 16,
  },

  dateInfoRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  dateInfoLabel: {
    fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.88)',
  },
  trackedLabel: {
    fontSize: 12, color: 'rgba(255,255,255,0.40)',
  },

  habitCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: 14, marginBottom: 10,
  },
  habitIconBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.20)',
    alignItems: 'center', justifyContent: 'center',
  },
  habitInfo: { flex: 1, gap: 2 },
  habitName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  habitSub: { fontSize: 12, color: 'rgba(255,255,255,0.40)' },
  badgeWrap: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 99,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
