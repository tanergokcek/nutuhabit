import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, StatusBar, ScrollView, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useHabitStore, SLEEP_HABIT_ID, SLEEP_HABIT } from '@/src/store/useHabitStore';
import { useStreak } from '@/src/hooks/useStreak';
import { DoneHabit, TimeHabit, BadHabit, HabitLog } from '@/src/types/habit';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { LAYOUT } from '@/constants/layout';
import { textStyles, textColors } from '@/constants/typography';
import { useAppTheme, ThemeTokens } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';
import { HabitIcon } from '@/components/ui/HabitIcon';

// ─── Hafta yardımcıları ───────────────────────────────────────────────────────
function getWeekDates(): string[] {
  const today = new Date();
  const dow = today.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

const WEEK_DATES = getWeekDates();

function fmtHM(mins: number, i18n: any) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hUnit = i18n.hourUnitShort;
  const mUnit = i18n.minUnitShort;
  return m > 0 ? `${h}${hUnit} ${String(m).padStart(2, '0')}${mUnit}` : `${h}${hUnit}`;
}

// ─── Tab seçici ───────────────────────────────────────────────────────────────
type Tab = 'done' | 'time' | 'bad';

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const t = useAppTheme();
  const i18n = useTranslation();
  const TABS: { key: Tab; label: string }[] = [
    { key: 'done', label: i18n.tabDone },
    { key: 'time', label: i18n.tabTime },
    { key: 'bad', label: i18n.tabBad },
  ];
  return (
    <View style={[tabStyles.wrap, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}>
      {TABS.map((tab) => {
        const on = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key} style={tabStyles.btn}
            onPress={() => onChange(tab.key)} activeOpacity={0.75}
          >
            {on ? (
              <>
                <BlurView intensity={18} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
                <LinearGradient
                  colors={['rgba(120,50,220,0.55)', 'rgba(70,20,150,0.45)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={[tabStyles.activeBorder, { borderColor: t.cardBorder }]} />
                <Text style={[tabStyles.labelOn, { color: t.t1 }]}>{tab.label}</Text>
              </>
            ) : (
              <Text style={[tabStyles.labelOff, { color: t.tabInactive }]}>{tab.label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: 14, padding: 4, marginHorizontal: LAYOUT.spacing.md,
    marginBottom: 18, borderWidth: 1,
  },
  btn: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  activeBorder: {
    ...StyleSheet.absoluteFillObject, borderRadius: 10,
    borderWidth: 1,
  },
  labelOn:  { ...textStyles.footnoteSemibold },   // 13pt semibold — active tab
  labelOff: { ...textStyles.footnote, fontWeight: '600' }, // 13pt — inactive tab
});

// ─── Kart ortak sarmalayıcı ───────────────────────────────────────────────────
function HabitCardWrap({ children, onPress, onLongPress }: { children: React.ReactNode; onPress: () => void; onLongPress: () => void }) {
  const t = useAppTheme();
  return (
    <TouchableOpacity
      style={[card.outer, { borderColor: t.cardBorder, shadowColor: t.cardShadow }]}
      onPress={onPress} onLongPress={onLongPress} activeOpacity={0.92} delayLongPress={400}
    >
      <BlurView intensity={18} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.cardGrad as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <View style={[card.glassOverlay, { backgroundColor: t.glassOverlay }]} />
      <View style={[card.specular, { backgroundColor: t.specular }]} />
      <View style={card.inner}>{children}</View>
    </TouchableOpacity>
  );
}
const card = StyleSheet.create({
  outer: {
    borderRadius: 20, overflow: 'hidden', marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40, shadowRadius: 24, elevation: 12,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  specular: {
    position: 'absolute', top: 0, left: 16, right: 16, height: 1,
  },
  inner: { padding: 16 },
});

// ─── Done sekmesi ─────────────────────────────────────────────────────────────
function DoneIconRow({ habit, logs, t }: { habit: DoneHabit; logs: HabitLog[]; t: ThemeTokens }) {
  return (
    <View style={doneStyles.row}>
      {WEEK_DATES.map((date) => {
        const log = logs.find((l) => l.date === date);
        const status = log?.status;
        let bg = t.rowBg;
        let content: React.ReactNode;

        if (status === 'done') {
          bg = 'rgba(109,40,217,0.30)';
          content = <HabitIcon icon={habit.icon} size={22} color="rgba(255,255,255,0.90)" />;
        } else if (status === 'failed') {
          bg = 'rgba(185,28,28,0.35)';
          content = <Text style={doneStyles.cellX}>✕</Text>;
        } else if (status === 'excused') {
          bg = 'rgba(180,130,0,0.30)';
          content = <Text style={doneStyles.cellEmoji}>😊</Text>;
        } else {
          content = <HabitIcon icon={habit.icon} size={22} color="rgba(255,255,255,0.22)" />;
        }

        return (
          <View key={date} style={[doneStyles.cell, { backgroundColor: bg }]}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

function DoneCard({ habit, logs, onPress, onLongPress }: { habit: DoneHabit; logs: HabitLog[]; onPress: () => void; onLongPress: () => void }) {
  const t = useAppTheme();
  const i18n = useTranslation();
  const weekLogs = logs.filter((l) => WEEK_DATES.includes(l.date));
  const misses = weekLogs.filter((l) => l.status === 'failed').length;
  const skips = weekLogs.filter((l) => l.status === 'excused').length;
  const { currentStreak: streak } = useStreak(habit.id, 'done');

  return (
    <HabitCardWrap onPress={onPress} onLongPress={onLongPress}>
      {/* Top row */}
      <View style={doneStyles.topRow}>
        <View style={[doneStyles.iconBox, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}>
          <HabitIcon icon={habit.icon} size={26} color="rgba(255,255,255,0.90)" />
        </View>
        <View style={doneStyles.nameCol}>
          <Text style={[doneStyles.name, { color: t.t1 }]}>{habit.name}</Text>
          <Text style={[doneStyles.sub, { color: t.t2 }]}>{streak > 0 ? `🔥 ${streak}. ${i18n.dayUnit}` : i18n.logToStart}</Text>
        </View>
        <View style={doneStyles.streakBadge}>
          <Text style={doneStyles.streakNum}>{streak}</Text>
          <Text style={doneStyles.streakLabel}>{i18n.dayUnit}</Text>
        </View>
      </View>

      {/* Icon row */}
      <DoneIconRow habit={habit} logs={logs} t={t} />

      {/* Stat pills */}
      {(misses > 0 || skips > 0) && (
        <View style={doneStyles.pillRow}>
          {misses > 0 && (
            <View style={[doneStyles.pill, { borderColor: 'rgba(239,68,68,0.45)', backgroundColor: 'rgba(239,68,68,0.12)' }]}>
              <Text style={[doneStyles.pillText, { color: '#f87171' }]}>{misses} {i18n.missLabel}</Text>
            </View>
          )}
          {skips > 0 && (
            <View style={[doneStyles.pill, { borderColor: 'rgba(251,191,36,0.45)', backgroundColor: 'rgba(251,191,36,0.10)' }]}>
              <Text style={[doneStyles.pillText, { color: '#fbbf24' }]}>{skips} {i18n.skipLabel}</Text>
            </View>
          )}
        </View>
      )}
    </HabitCardWrap>
  );
}

const doneStyles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  nameCol: { flex: 1 },
  name: { ...textStyles.headline, fontFamily: 'InriaSerif_700Bold' }, // 17pt semibold + brand serif
  sub:  { ...textStyles.caption1, marginTop: 2 },                    // 12pt
  streakBadge: {
    minWidth: 52, height: 52, borderRadius: 14, paddingHorizontal: 8,
    backgroundColor: 'rgba(109,40,217,0.60)',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.40)',
    alignItems: 'center', justifyContent: 'center',
  },
  streakNum:   { ...textStyles.title3Semibold, color: '#fff', fontFamily: 'InriaSerif_700Bold' }, // 20pt
  streakLabel: { ...textStyles.caption2Medium, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.5 }, // 11pt
  row: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  cell: {
    flex: 1, aspectRatio: 1, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cellEmoji: { fontSize: 20 },
  cellX:     { ...textStyles.calloutSemibold, color: '#f87171' },   // 16pt
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  pill: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 99, borderWidth: 1,
  },
  pillText: { ...textStyles.caption2Medium },                        // 11pt
});

// ─── Time sekmesi ─────────────────────────────────────────────────────────────
function TimeCard({ habit, logs, onPress, onLongPress }: { habit: TimeHabit; logs: HabitLog[]; onPress: () => void; onLongPress: () => void }) {
  const t = useAppTheme();
  const i18n = useTranslation();
  const weekMins = useMemo(() =>
    logs.filter((l) => WEEK_DATES.includes(l.date))
      .reduce((s, l) => s + (l.elapsedMinutes ?? 0), 0),
    [logs]);
  const goalWeekMins = habit.goalMinutes * 7;
  const progress = Math.min(1, weekMins / goalWeekMins);
  const isSleep = habit.id === SLEEP_HABIT_ID;
  const noData = isSleep && logs.length === 0;

  return (
    <HabitCardWrap onPress={onPress} onLongPress={onLongPress}>
      <View style={timeStyles.topRow}>
        <View style={[timeStyles.iconBox, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}>
          <HabitIcon icon={habit.icon} size={26} color="rgba(255,255,255,0.90)" />
        </View>
        <View style={timeStyles.nameCol}>
          <Text style={[timeStyles.name, { color: t.t1 }]}>{habit.name}</Text>
          <Text style={[timeStyles.sub, { color: t.t2 }]}>
            {noData ? i18n.sleepHabitHint : ""}
          </Text>
        </View>
        <View style={timeStyles.rightCol}>
          <Text style={timeStyles.bigTime}>{noData ? "—" : fmtHM(weekMins, i18n)}</Text>
          <Text style={[timeStyles.goalText, { color: t.t3 }]}>{""}</Text>
        </View>
      </View>
      {/* Haftalık hedef takibi kaldırıldı */}
    </HabitCardWrap>
  );
}

const timeStyles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  nameCol: { flex: 1 },
  name:     { ...textStyles.headline, fontFamily: 'InriaSerif_700Bold' },    // 17pt semibold
  sub:      { ...textStyles.caption1, marginTop: 2 },                        // 12pt
  rightCol: { alignItems: 'flex-end' },
  bigTime:  { ...textStyles.title3Semibold, color: '#a78bfa', fontFamily: 'InriaSerif_700Bold' }, // 20pt
  goalText: { ...textStyles.caption2, marginTop: 2 },                        // 11pt
  track: { height: 5, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  fill: { height: '100%', borderRadius: 3 },
  pctLabel: { ...textStyles.caption2 },                                       // 11pt
});

// ─── Bad Habit sekmesi ────────────────────────────────────────────────────────
function BadIconRow({ habit, logs, t }: { habit: BadHabit; logs: HabitLog[]; t: ThemeTokens }) {
  return (
    <View style={badStyles.row}>
      {WEEK_DATES.map((date) => {
        const log = logs.find((l) => l.date === date);
        const status = log?.status;
        let bg = t.rowBg;
        let content: React.ReactNode;

        if (status === 'failed') {
          bg = 'rgba(185,28,28,0.35)';
          content = <Text style={badStyles.cellX}>✕</Text>;
        } else if (status === 'done') {
          bg = 'rgba(109,40,217,0.30)';
          content = <HabitIcon icon={habit.icon} size={22} color="rgba(255,255,255,0.90)" />;
        } else {
          content = <HabitIcon icon={habit.icon} size={22} color="rgba(255,255,255,0.22)" />;
        }

        return (
          <View key={date} style={[badStyles.cell, { backgroundColor: bg }]}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

function BadCard({ habit, logs, onPress, onLongPress }: { habit: BadHabit; logs: HabitLog[]; onPress: () => void; onLongPress: () => void }) {
  const t = useAppTheme();
  const i18n = useTranslation();
  const weekLogs = logs.filter((l) => WEEK_DATES.includes(l.date));
  // Adet bazlı: usedCount toplamı; süre bazlı: failed log sayısı
  const totalDone = habit.limitType === 'count'
    ? weekLogs.reduce((s, l) => s + (l.usedCount ?? 0), 0)
    : weekLogs.filter((l) => l.status === 'failed').length;
  const exceeded = Math.max(0, totalDone - habit.limitCount);

  const periodLabel = habit.limitPeriod === 'daily' ? i18n.daily :
    habit.limitPeriod === 'weekly' ? i18n.weekly : i18n.monthly;

  return (
    <HabitCardWrap onPress={onPress} onLongPress={onLongPress}>
      {/* Top row — same layout as DoneCard */}
      <View style={badStyles.topRow}>
        <View style={[badStyles.iconBox, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}>
          <HabitIcon icon={habit.icon} size={26} color="rgba(255,255,255,0.90)" />
        </View>
        <View style={badStyles.nameCol}>
          <Text style={[badStyles.name, { color: t.t1 }]}>{habit.name}</Text>
          <Text style={[badStyles.sub, { color: t.t2 }]}>
            {exceeded > 0 
              ? `🚫 ${i18n.limitExceeded} (${totalDone}/${habit.limitCount})` 
              : `✅ ${i18n.clean} · ${periodLabel} (${habit.limitCount} ${i18n.timesUnit})`}
          </Text>
        </View>
        {/* Limit badge — the only difference from DoneCard */}
        <View style={badStyles.limitBadge}>
          <Text style={badStyles.limitNum}>
            {totalDone}
          </Text>
          <Text style={badStyles.limitLabel}>
            {habit.limitType === 'count' || (!habit.limitType && habit.limitCount) 
              ? i18n.timesUnit 
              : i18n.minUnit}
          </Text>
        </View>
      </View>

      {/* Icon row */}
      <BadIconRow habit={habit} logs={logs} t={t} />

      {/* Exceeded pill — mirrors DoneCard's miss/skip pills */}
      {exceeded > 0 && (
        <View style={badStyles.pillRow}>
          <View style={badStyles.pill}>
            <Text style={badStyles.pillText}>{exceeded} {i18n.exceedLabel}</Text>
          </View>
        </View>
      )}
    </HabitCardWrap>
  );
}

const badStyles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  nameCol: { flex: 1 },
  name: { ...textStyles.headline, fontFamily: 'InriaSerif_700Bold' },   // 17pt semibold
  sub:  { ...textStyles.caption1, marginTop: 2 },                       // 12pt
  limitBadge: {
    minWidth: 52, height: 52, borderRadius: 14, paddingHorizontal: 8,
    backgroundColor: 'rgba(239,68,68,0.22)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  limitNum:   { ...textStyles.title3Semibold, color: '#f87171', fontFamily: 'InriaSerif_700Bold' }, // 20pt
  limitLabel: { ...textStyles.caption2Medium, color: 'rgba(248,113,113,0.65)', letterSpacing: 0.5 }, // 11pt
  row: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  cell: {
    flex: 1, aspectRatio: 1, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cellEmoji: { fontSize: 20 },
  cellX:     { ...textStyles.calloutSemibold, color: '#f87171' },          // 16pt
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  pill: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 99, borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  pillText: { ...textStyles.caption2Medium, color: '#f87171' },             // 11pt
});

// ─── Summary kartları ─────────────────────────────────────────────────────────
function TimeSummaryCard({ timeHabits, allLogs }: { timeHabits: TimeHabit[]; allLogs: HabitLog[] }) {
  const t = useAppTheme();
  const i18n = useTranslation();
  const totalMins = useMemo(() => {
    return timeHabits.reduce((sum, h) => {
      const habitLogs = allLogs.filter((l) => l.habitId === h.id && WEEK_DATES.includes(l.date));
      return sum + habitLogs.reduce((s, l) => s + (l.elapsedMinutes ?? 0), 0);
    }, 0);
  }, [timeHabits, allLogs]);

  return (
    <View style={[summaryStyles.card, { borderColor: t.cardBorder, shadowColor: t.cardShadow }]}>
      <BlurView intensity={22} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.cardGrad as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <View style={[summaryStyles.specular, { backgroundColor: t.specular }]} />
      <Text style={[summaryStyles.weekLabel, { color: t.t3 }]}>{i18n.thisWeek}</Text>
      <Text style={[summaryStyles.bigNum, { color: t.tAccent }]}>{fmtHM(totalMins, i18n)}</Text>
      <Text style={[summaryStyles.subLabel, { color: t.t2 }]}>{i18n.totalTrackedTime}</Text>
    </View>
  );
}

function BadSummaryCard({ badHabits, allLogs }: { badHabits: BadHabit[]; allLogs: HabitLog[] }) {
  const t = useAppTheme();
  const i18n = useTranslation();
  const { totalExceeded, successPct } = useMemo(() => {
    let exc = 0; let total = 0;
    badHabits.forEach((h) => {
      const wl = allLogs.filter((l) => l.habitId === h.id && WEEK_DATES.includes(l.date));
      exc += wl.filter((l) => l.status === 'failed').length;
      total += 7;
    });
    return { totalExceeded: exc, successPct: total > 0 ? Math.round(((total - exc) / total) * 100) : 100 };
  }, [badHabits, allLogs]);

  return (
    <View style={[summaryStyles.card, { borderColor: t.cardBorder, shadowColor: t.cardShadow }]}>
      <BlurView intensity={22} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.cardGrad as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <View style={[summaryStyles.specular, { backgroundColor: t.specular }]} />
      <View style={summaryStyles.badRow}>
        <View style={{ flex: 1 }}>
          <Text style={[summaryStyles.weekLabel, { color: t.t3 }]}>{i18n.thisWeek}</Text>
          <Text style={[summaryStyles.subLabel, { color: t.t2 }]}>{i18n.stayStrong}</Text>
        </View>
        <ProgressRing
          progress={successPct / 100}
          size={64} strokeWidth={6}
          color="#7c3aed" trackColor={t.rowBg}
        >
          <Text style={[summaryStyles.ringPct, { color: t.t1 }]}>{successPct}%</Text>
        </ProgressRing>
      </View>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  card: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 14,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40, shadowRadius: 20, elevation: 10,
  },
  specular: {
    position: 'absolute', top: 0, left: 16, right: 16, height: 1,
  },
  weekLabel: { ...textStyles.caption2Medium, letterSpacing: 1.5, marginBottom: 6 },   // 11pt caps
  bigNum:    { ...textStyles.largeTitleBold, fontFamily: 'InriaSerif_700Bold', letterSpacing: -0.5 }, // 34pt
  bigNumBad: { ...textStyles.title1Bold, fontFamily: 'InriaSerif_700Bold' },           // 28pt
  subLabel:  { ...textStyles.caption1, marginTop: 4 },                                 // 12pt
  badRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ringPct: { ...textStyles.caption1Medium, color: '#fff' },                // 12pt
});

// ─── Ana sayfa ────────────────────────────────────────────────────────────────
export default function HabitsScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const i18n = useTranslation();
  const { habits, logs, deleteHabit, filter, setFilter } = useHabitStore();
  const [activeTab, setActiveTab] = useState<Tab>('done');

  // Ana sayfadan alışkanlık kartına tıklandığında store'a yazılan filter'ı oku
  useEffect(() => {
    if (filter !== 'all') {
      setActiveTab(filter as Tab);
      setFilter('all'); // tek seferlik consume et
    }
  }, [filter]);

  const activeHabits = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);
  const doneHabits = useMemo(() => activeHabits.filter((h) => h.type === 'done') as DoneHabit[], [activeHabits]);
  const timeHabits = useMemo(() => {
    const list = activeHabits.filter((h) => h.type === 'time') as TimeHabit[];
    if (!list.some(h => h.id === SLEEP_HABIT_ID)) {
      list.unshift(SLEEP_HABIT);
    }
    return list;
  }, [activeHabits]);
  const badHabits = useMemo(() => activeHabits.filter((h) => h.type === 'bad') as BadHabit[], [activeHabits]);

  const getHabitLogs = useCallback((habitId: string) => logs.filter((l) => l.habitId === habitId), [logs]);

  const handleLongPress = useCallback((habit: typeof activeHabits[0]) => {
    Alert.alert(habit.name, i18n.whatToDo, [
      { text: i18n.edit, onPress: () => router.push(`/habit/edit/${habit.id}`) },
      {
        text: i18n.deleteLabel, style: 'destructive',
        onPress: () => Alert.alert(i18n.deleteHabitTitle, i18n.deleteHabitConfirm(habit.name), [
          { text: i18n.goBack, style: 'cancel' },
          { text: i18n.deleteLabel, style: 'destructive', onPress: () => deleteHabit(habit.id) },
        ]),
      },
      { text: i18n.goBack, style: 'cancel' },
    ]);
  }, [router, deleteHabit, i18n]);

  return (
    <View style={[s.container, { backgroundColor: t.screenBg }]}>
      <StatusBar barStyle={t.statusBar} />

      {/* Arka plan */}
      <LinearGradient
        colors={t.gradBg as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
      />
      <LinearGradient
        colors={t.orb1 as any}
        style={[StyleSheet.absoluteFillObject, s.orb1]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={t.orb2 as any}
        style={[StyleSheet.absoluteFillObject, s.orb2]}
        start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
      />

      <SafeAreaView style={s.safe} edges={['top']}>
        {/* Başlık */}
        <Text style={[s.title, { color: t.t1 }]}>{i18n.habitsTitle}</Text>

        {/* Tab seçici */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
        >
          {/* ── DONE ── */}
          {activeTab === 'done' && (
            <>
              {doneHabits.length === 0 && <EmptyMsg text={i18n.emptyDone} t={t} />}
              {doneHabits.map((h) => (
                <DoneCard
                  key={h.id} habit={h}
                  logs={getHabitLogs(h.id)}
                  onPress={() => router.push(`/habit/${h.id}`)}
                  onLongPress={() => handleLongPress(h)}
                />
              ))}
            </>
          )}

          {/* ── TIME ── */}
          {activeTab === 'time' && (
            <>
              {timeHabits.length > 0 && (
                <TimeSummaryCard timeHabits={timeHabits} allLogs={logs} />
              )}
              {timeHabits.length === 0 && <EmptyMsg text={i18n.emptyTime} t={t} />}
              {timeHabits.map((h) => (
                <TimeCard
                  key={h.id} habit={h}
                  logs={getHabitLogs(h.id)}
                  onPress={() => router.push(`/habit/${h.id}`)}
                  onLongPress={() => handleLongPress(h)}
                />
              ))}
            </>
          )}

          {/* ── BAD ── */}
          {activeTab === 'bad' && (
            <>
              {/* BadSummaryCard kaldırıldı */}
              {badHabits.length === 0 && <EmptyMsg text={i18n.emptyBad} t={t} />}
              {badHabits.map((h) => (
                <BadCard
                  key={h.id} habit={h}
                  logs={getHabitLogs(h.id)}
                  onPress={() => router.push(`/habit/${h.id}`)}
                  onLongPress={() => handleLongPress(h)}
                />
              ))}
            </>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function EmptyMsg({ text, t }: { text: string; t: ThemeTokens }) {
  const i18n = useTranslation();
  return (
    <View style={s.empty}>
      <Image
        source={require('@/assets/brand/favicon.png')}
        style={s.emptyLogo}
        resizeMode="contain"
      />
      <Text style={[s.emptyText, { color: t.t2 }]}>{text}</Text>
      <Text style={[s.emptyHint, { color: t.t3 }]}>{i18n.addHabitHint}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  orb1: { top: -100, left: -80, width: '85%', height: '55%', borderRadius: 400 },
  orb2: { top: -70, right: -50, width: '60%', height: '48%', borderRadius: 400 },
  title: {
    ...textStyles.largeTitleBold,          // 34pt bold — iOS large title
    fontFamily: 'InriaSerif_700Bold',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingTop: 8, paddingBottom: 16,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: LAYOUT.spacing.md, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyLogo: { width: 72, height: 72, marginBottom: 12 },
  emptyText:  { ...textStyles.calloutSemibold, marginBottom: 6 },     // 16pt semibold
  emptyHint:  { ...textStyles.footnote, textAlign: 'center' },         // 13pt
});
