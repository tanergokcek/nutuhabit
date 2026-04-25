import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, {
  Rect,
  Path,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { useHabitStore } from '@/src/store/useHabitStore';
import { useAppTheme, ThemeTokens } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';
import { LAYOUT } from '@/constants/layout';
import { textStyles } from '@/constants/typography';
import { Habit, HabitLog } from '@/src/types/habit';
import { HabitIcon } from '@/components/ui/HabitIcon';

type HabitTypeTab = 'done' | 'time' | 'bad';
type Period = 'D' | 'W' | 'M' | 'Y';

// Chart layout constants (module-level to avoid re-computation)
const PAD_L = 38;
const PAD_R = 8;
const PAD_T = 16;
const PAD_B = 28;
const SVG_W = LAYOUT.screen.width - LAYOUT.spacing.md * 4;
const SVG_H = 190;
const CW = SVG_W - PAD_L - PAD_R;
const CH = SVG_H - PAD_T - PAD_B;

function toDs(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function computeValue(
  type: HabitTypeTab,
  habits: Habit[],
  logs: HabitLog[],
  dates: string[]
): number {
  if (!habits.length || !dates.length) return 0;
  const hIds = new Set(habits.map((h) => h.id));

  if (type === 'time') {
    return logs
      .filter((l) => dates.includes(l.date) && hIds.has(l.habitId))
      .reduce((s, l) => s + (l.elapsedMinutes ?? 0), 0);
  }
  if (type === 'done') {
    let completed = 0, total = 0;
    for (const date of dates) {
      for (const h of habits) {
        const log = logs.find((l) => l.date === date && l.habitId === h.id);
        if (log) { total++; if (log.status === 'done') completed++; }
      }
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }
  // bad: home/habits sayfalarıyla tutarlı şekilde status === 'failed' say
  let exceeded = 0;
  for (const date of dates) {
    for (const h of habits) {
      if (h.type !== 'bad') continue;
      const log = logs.find((l) => l.date === date && l.habitId === h.id);
      if (log?.status === 'failed') exceeded++;
    }
  }
  return exceeded;
}

function buildPoints(
  period: Period,
  type: HabitTypeTab,
  selectedId: string | null,
  habits: Habit[],
  logs: HabitLog[]
): { label: string; value: number }[] {
  const active = selectedId
    ? habits.filter((h) => h.id === selectedId)
    : habits.filter((h) => !h.isArchived && h.type === type);
  const today = new Date();

  if (period === 'D') {
    const abbr = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return { label: abbr[d.getDay()], value: computeValue(type, active, logs, [toDs(d)]) };
    });
  }
  if (period === 'W') {
    return Array.from({ length: 4 }, (_, wi) => {
      const dates: string[] = [];
      for (let d = 6; d >= 0; d--) {
        const dt = new Date(today);
        dt.setDate(dt.getDate() - (3 - wi) * 7 - d);
        dates.push(toDs(dt));
      }
      return { label: `H${wi + 1}`, value: computeValue(type, active, logs, dates) };
    });
  }
  const count = period === 'M' ? 6 : 12;
  return Array.from({ length: count }, (_, mi) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (count - 1 - mi), 1);
    const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const dates = Array.from({ length: dim }, (_, i) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
    );
    const label = d.toLocaleDateString('tr-TR', { month: 'short' });
    return { label, value: computeValue(type, active, logs, dates) };
  });
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    const cpx = ((p0.x + p1.x) / 2).toFixed(1);
    d += ` C ${cpx},${p0.y.toFixed(1)} ${cpx},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
  }
  return d;
}

function areaPath(pts: { x: number; y: number }[], bottomY: number): string {
  if (pts.length < 2) return '';
  return `${smoothPath(pts)} L ${pts[pts.length - 1].x},${bottomY} L ${pts[0].x},${bottomY} Z`;
}

function getAllDatesForPeriod(period: Period): string[] {
  const today = new Date();
  const dates: string[] = [];
  if (period === 'D') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(toDs(d));
    }
  } else if (period === 'W') {
    for (let wi = 0; wi < 4; wi++) {
      for (let d = 6; d >= 0; d--) {
        const dt = new Date(today);
        dt.setDate(dt.getDate() - (3 - wi) * 7 - d);
        dates.push(toDs(dt));
      }
    }
  } else {
    const count = period === 'M' ? 6 : 12;
    for (let mi = 0; mi < count; mi++) {
      const d = new Date(today.getFullYear(), today.getMonth() - (count - 1 - mi), 1);
      const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= dim; i++) {
        dates.push(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        );
      }
    }
  }
  return dates;
}

// ─── Donut helpers ────────────────────────────────────────────────────────────
function polarToCart(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutArcPath(cx: number, cy: number, outerR: number, innerR: number, startDeg: number, endDeg: number): string {
  const e = endDeg - startDeg >= 360 ? startDeg + 359.99 : endDeg;
  const os = polarToCart(cx, cy, outerR, e);
  const oe = polarToCart(cx, cy, outerR, startDeg);
  const is = polarToCart(cx, cy, innerR, e);
  const ie = polarToCart(cx, cy, innerR, startDeg);
  const lg = e - startDeg > 180 ? 1 : 0;
  return [`M ${os.x} ${os.y}`, `A ${outerR} ${outerR} 0 ${lg} 0 ${oe.x} ${oe.y}`, `L ${ie.x} ${ie.y}`, `A ${innerR} ${innerR} 0 ${lg} 1 ${is.x} ${is.y}`, 'Z'].join(' ');
}

function makeStyles(t: ThemeTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.screenBg },
    safeArea: { flex: 1 },
    content: { padding: LAYOUT.spacing.md, gap: LAYOUT.spacing.md, paddingBottom: 100 },
    header: { paddingTop: LAYOUT.spacing.sm },
    title: {
      ...textStyles.largeTitleBold,                                        // 34pt bold — habits ile aynı
      fontFamily: 'InriaSerif_700Bold',
      color: t.t1,
      paddingTop: 8,
      paddingBottom: 4,
    },
    subtitle: { ...textStyles.footnote, color: t.t3, marginTop: 2 },      // 13pt
    typeBar: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: t.panelBg,
      borderRadius: 16,
      padding: 4,
      borderWidth: 1,
      borderColor: t.panelBorder,
    },
    typeTab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
      overflow: 'hidden',
    },
    typeTabText: { ...textStyles.footnoteSemibold, color: t.t3 },          // 13pt semibold
    typeTabTextActive: { color: '#fff' },
    chipsRow: { flexGrow: 0 },
    chipsContent: { gap: 8, paddingVertical: 2 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: t.rowBg,
      borderWidth: 1,
      borderColor: t.panelBorder,
      overflow: 'hidden',
    },
    chipActive: { borderColor: 'rgba(147,51,234,0.60)' },
    chipEmoji: { fontSize: 14 },
    chipText: { ...textStyles.footnoteMedium, color: t.t2 },               // 13pt medium
    chipTextActive: { color: '#e9d5ff' },
    periodRow: { flexDirection: 'row', gap: 8 },
    periodPill: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: t.rowBg,
      borderWidth: 1,
      borderColor: t.panelBorder,
      overflow: 'hidden',
    },
    periodPillActive: { borderColor: 'rgba(147,51,234,0.55)' },
    periodText: { ...textStyles.footnoteSemibold, color: t.t3 },           // 13pt semibold
    periodTextActive: { color: '#e9d5ff' },
    card: {
      borderRadius: 22,
      overflow: 'hidden',
      padding: LAYOUT.spacing.md,
      borderWidth: 1,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 24,
      elevation: 10,
    },
    summaryCard: {
      borderRadius: 22,
      overflow: 'hidden',
      padding: LAYOUT.spacing.md,
      borderWidth: 1,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.20,
      shadowRadius: 18,
      elevation: 8,
    },
    summaryRow: { flexDirection: 'row', alignItems: 'center' },
    summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
    summaryValue: { ...textStyles.title2Bold },                            // 22pt bold
    summaryLabel: { ...textStyles.caption2, textAlign: 'center' },         // 11pt
    summaryDivider: { width: 1, height: 40, opacity: 0.4 },
    chartTitle: {
      ...textStyles.caption2Semibold,                                       // 11pt semibold
      letterSpacing: 1.2,
      textTransform: 'uppercase' as const,
      marginBottom: LAYOUT.spacing.sm,
    },
    breakdownRows: { gap: 12 },
    breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    breakdownIcon: { fontSize: 18, width: 26, textAlign: 'center' as const },
    breakdownTrack: { flex: 1, gap: 4 },
    breakdownNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' as const },
    breakdownName: { ...textStyles.caption2Medium, flex: 1, marginRight: 4 },     // 11pt medium
    breakdownVal: { ...textStyles.caption2Bold, minWidth: 44, textAlign: 'right' as const }, // 11pt bold
    breakdownBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' as const },
    breakdownBarFill: { height: 8, borderRadius: 4, opacity: 0.85 },
    noDataText: { ...textStyles.footnote, textAlign: 'center' as const, paddingVertical: 20 }, // 13pt
    pieContent: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: LAYOUT.spacing.md },
    pieLegend: { flex: 1, gap: 10 },
    pieLegendRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
    pieLegendDot: { width: 10, height: 10, borderRadius: 5 },
    pieLegendLabel: { ...textStyles.footnote, flex: 1 },                   // 13pt
    pieLegendPct: { ...textStyles.footnoteBold, minWidth: 36, textAlign: 'right' as const }, // 13pt bold
  });
}

export default function GraphPage() {
  const t = useAppTheme();
  const i18n = useTranslation();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { habits, logs } = useHabitStore();

  const [habitType, setHabitType] = useState<HabitTypeTab>('time');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('D');

  const filteredHabits = useMemo(
    () => habits.filter((h) => !h.isArchived && h.type === habitType),
    [habits, habitType]
  );

  const activeId = useMemo(
    () => (filteredHabits.find((h) => h.id === selectedId) ? selectedId : null),
    [filteredHabits, selectedId]
  );

  const chartPoints = useMemo(
    () => buildPoints(period, habitType, activeId, habits, logs),
    [period, habitType, activeId, habits, logs]
  );

  const maxVal = useMemo(() => {
    if (habitType === 'done') return 100;
    const m = Math.max(...chartPoints.map((p) => p.value), habitType === 'time' ? 30 : 5);
    return Math.ceil(m / 10) * 10;
  }, [chartPoints, habitType]);

  const svgPts = useMemo(() => {
    if (chartPoints.length < 2) return [];
    const xStep = CW / (chartPoints.length - 1);
    return chartPoints.map((p, i) => ({
      x: PAD_L + i * xStep,
      y: PAD_T + CH - (maxVal > 0 ? (p.value / maxVal) * CH : 0),
    }));
  }, [chartPoints, maxVal]);

  const summary = useMemo(() => {
    const values = chartPoints.map((p) => p.value);
    const total = values.reduce((s, v) => s + v, 0);
    const nonZero = values.filter((v) => v > 0).length;
    if (habitType === 'time') {
      const avg = Math.round(total / Math.max(chartPoints.length, 1));
      return {
        primary: `${total} dk`,
        primaryLabel: i18n.totalMinsLabel,
        secondary: `${avg} dk`,
        secondaryLabel: i18n.avgPerDayLabel,
      };
    }
    if (habitType === 'done') {
      const avg = Math.round(total / Math.max(chartPoints.length, 1));
      return {
        primary: `${avg}%`,
        primaryLabel: i18n.completionRateLabel,
        secondary: `${nonZero}/${chartPoints.length}`,
        secondaryLabel: i18n.completedDaysLabel,
      };
    }
    const clean = values.filter((v) => v === 0).length;
    return {
      primary: `${total}`,
      primaryLabel: i18n.totalExcLabel,
      secondary: `${clean}/${chartPoints.length}`,
      secondaryLabel: i18n.cleanDaysLabel,
    };
  }, [chartPoints, habitType, i18n]);

  const breakdownData = useMemo(() => {
    const allDates = getAllDatesForPeriod(period);
    return filteredHabits.map((h) => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      value: computeValue(habitType, [h], logs, allDates),
    }));
  }, [filteredHabits, habitType, logs, period]);

  const maxBreakdown = useMemo(() => {
    if (habitType === 'done') return 100;
    const m = Math.max(...(breakdownData.length ? breakdownData.map((d) => d.value) : [0]), habitType === 'time' ? 30 : 5);
    return Math.ceil(m / 10) * 10;
  }, [breakdownData, habitType]);

  const pieData = useMemo((): { key: string; label: string; value: number; color: string }[] => {
    const allDates = getAllDatesForPeriod(period);
    const TIME_COLORS = ['#a855f7', '#818cf8', '#c084fc', '#7c3aed', '#e879f9', '#6d28d9'];

    if (habitType === 'done') {
      let doneC = 0, failedC = 0, excusedC = 0;
      for (const h of filteredHabits) {
        for (const log of logs.filter((l) => allDates.includes(l.date) && l.habitId === h.id)) {
          if (log.status === 'done') doneC++;
          else if (log.status === 'failed') failedC++;
          else if (log.status === 'excused') excusedC++;
        }
      }
      return [
        { key: 'done', label: i18n.pieDone, value: doneC, color: '#22c55e' },
        { key: 'failed', label: i18n.pieFailed, value: failedC, color: '#ef4444' },
        { key: 'excused', label: i18n.pieExcused, value: excusedC, color: '#f97316' },
      ].filter((s) => s.value > 0);
    }

    if (habitType === 'time') {
      return filteredHabits
        .map((h, i) => ({
          key: h.id,
          label: h.name,
          value: logs
            .filter((l) => allDates.includes(l.date) && l.habitId === h.id)
            .reduce((s, l) => s + (l.elapsedMinutes ?? 0), 0),
          color: TIME_COLORS[i % TIME_COLORS.length],
        }))
        .filter((s) => s.value > 0);
    }

    // bad: home/habits sayfalarıyla tutarlı — status === 'failed' = aşıldı
    let cleanC = 0, exceededC = 0;
    for (const h of filteredHabits) {
      for (const log of logs.filter((l) => allDates.includes(l.date) && l.habitId === h.id)) {
        if (log.status === 'failed') exceededC++;
        else cleanC++;
      }
    }
    return [
      { key: 'clean', label: i18n.pieClean, value: cleanC, color: '#22c55e' },
      { key: 'exceeded', label: i18n.pieExceeded, value: exceededC, color: '#f97316' },
    ].filter((s) => s.value > 0);
  }, [filteredHabits, habitType, logs, period, i18n]);

  const gridLabels = habitType === 'time'
    ? ['0', `${Math.round(maxVal * 0.5)}`, `${maxVal}`]
    : ['0%', '50%', '100%'];

  const handleTypeChange = (type: HabitTypeTab) => {
    setHabitType(type);
    setSelectedId(null);
  };

  const TYPE_LABELS: Record<HabitTypeTab, string> = {
    done: i18n.tabDone,
    time: i18n.tabTime,
    bad: i18n.tabBad,
  };
  const PERIOD_LABELS: Record<Period, string> = {
    D: i18n.periodDay,
    W: i18n.periodWeek,
    M: i18n.periodMonth,
    Y: i18n.periodYear,
  };

  const gridColor = t.dark ? 'rgba(255,255,255,0.08)' : 'rgba(109,40,217,0.12)';
  const axisLabelFill = t.dark ? 'rgba(255,255,255,0.30)' : 'rgba(76,29,149,0.45)';
  const barEmptyFill = t.rowBg;

  const breakdownBarColor = habitType === 'done' ? '#22c55e' : habitType === 'time' ? '#a855f7' : '#f97316';
  const breakdownValFormat = (v: number) =>
    habitType === 'done' ? `${v}%` : habitType === 'time' ? `${v} dk` : `${v}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={t.statusBar} />
      <LinearGradient colors={t.gradBg as any} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.orb1 as any}
        style={[StyleSheet.absoluteFillObject, { top: -80 }]}
        start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 0.5 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={t.orb2 as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 1, y: 0.3 }} end={{ x: 0.3, y: 0.8 }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.graphsTitle}</Text>
            <Text style={styles.subtitle}>{i18n.graphSubtitle}</Text>
          </View>

          {/* Type tab bar */}
          <View style={styles.typeBar}>
            {(['done', 'time', 'bad'] as HabitTypeTab[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.typeTab}
                onPress={() => handleTypeChange(type)}
                activeOpacity={0.8}
              >
                {habitType === type && (
                  <LinearGradient
                    colors={['#9333ea', '#6d28d9']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  />
                )}
                <Text style={[styles.typeTabText, habitType === type && styles.typeTabTextActive]}>
                  {TYPE_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Habit chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsRow}
            contentContainerStyle={styles.chipsContent}
          >
            {filteredHabits.map((h) => (
              <TouchableOpacity
                key={h.id}
                style={[styles.chip, activeId === h.id && styles.chipActive]}
                onPress={() => setSelectedId(activeId === h.id ? null : h.id)}
                activeOpacity={0.8}
              >
                {activeId === h.id && (
                  <LinearGradient
                    colors={['rgba(147,51,234,0.55)', 'rgba(109,40,217,0.45)']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  />
                )}
                <HabitIcon icon={h.icon} size={16} color="rgba(255,255,255,0.80)" />
                <Text style={[styles.chipText, activeId === h.id && styles.chipTextActive]}>
                  {h.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Period pills */}
          <View style={styles.periodRow}>
            {(['D', 'W', 'M', 'Y'] as Period[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodPill, period === p && styles.periodPillActive]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.8}
              >
                {period === p && (
                  <LinearGradient
                    colors={['rgba(147,51,234,0.65)', 'rgba(109,40,217,0.55)']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  />
                )}
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                  {PERIOD_LABELS[p]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Area chart card */}
          <View style={[styles.card, { borderColor: t.panelBorder, shadowColor: t.cardShadow }]}>
            <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
            <LinearGradient
              colors={t.cardGrad as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />
            <Svg width={SVG_W} height={SVG_H}>
              <Defs>
                <SvgLinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#9333ea" stopOpacity="0.50" />
                  <Stop offset="1" stopColor="#9333ea" stopOpacity="0.02" />
                </SvgLinearGradient>
              </Defs>

              {/* Y-axis grid + labels */}
              {[0, 0.5, 1].map((frac, gi) => {
                const y = PAD_T + CH * (1 - frac);
                return (
                  <React.Fragment key={gi}>
                    <Line
                      x1={PAD_L} y1={y} x2={PAD_L + CW} y2={y}
                      stroke={gridColor} strokeWidth={1} strokeDasharray="4,4"
                    />
                    <SvgText x={PAD_L - 4} y={y + 4} textAnchor="end" fontSize={8} fill={axisLabelFill}>
                      {gridLabels[gi]}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* Area fill + line */}
              {svgPts.length >= 2 && (
                <>
                  <Path d={areaPath(svgPts, PAD_T + CH)} fill="url(#areaFill)" />
                  <Path
                    d={smoothPath(svgPts)}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Data points + x-axis labels */}
              {svgPts.map((p, i) => (
                <React.Fragment key={i}>
                  <Circle cx={p.x} cy={p.y} r={4} fill="#a855f7" opacity={0.9} />
                  <Circle cx={p.x} cy={p.y} r={2} fill="#ffffff" />
                  <SvgText x={p.x} y={SVG_H - 6} textAnchor="middle" fontSize={8} fill={axisLabelFill}>
                    {chartPoints[i]?.label}
                  </SvgText>
                </React.Fragment>
              ))}
            </Svg>
          </View>

          {/* Summary card */}
          <View style={[styles.summaryCard, { borderColor: t.panelBorder, shadowColor: t.cardShadow }]}>
            <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
            <LinearGradient
              colors={t.cardGrad as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: t.tAccent }]}>{summary.primary}</Text>
                <Text style={[styles.summaryLabel, { color: t.t3 }]}>{summary.primaryLabel}</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: t.panelBorder }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: t.tAccent }]}>{summary.secondary}</Text>
                <Text style={[styles.summaryLabel, { color: t.t3 }]}>{summary.secondaryLabel}</Text>
              </View>
            </View>
          </View>

          {/* ── Çubuk Grafik ─────────────────────────────── */}
          <View style={[styles.card, { borderColor: t.panelBorder, shadowColor: t.cardShadow }]}>
            <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
            <LinearGradient
              colors={t.cardGrad as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />
            <Text style={[styles.chartTitle, { color: t.t3 }]}>{i18n.barChartTitle}</Text>
            <Svg width={SVG_W} height={SVG_H}>
              <Defs>
                <SvgLinearGradient id="barFillGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#c084fc" stopOpacity="1" />
                  <Stop offset="1" stopColor="#7c3aed" stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>

              {/* Y-axis grid + labels */}
              {[0, 0.5, 1].map((frac, gi) => {
                const y = PAD_T + CH * (1 - frac);
                return (
                  <React.Fragment key={gi}>
                    <Line
                      x1={PAD_L} y1={y} x2={PAD_L + CW} y2={y}
                      stroke={gridColor} strokeWidth={1} strokeDasharray="4,4"
                    />
                    <SvgText x={PAD_L - 4} y={y + 4} textAnchor="end" fontSize={8} fill={axisLabelFill}>
                      {gridLabels[gi]}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* Vertical bars */}
              {chartPoints.map((p, i) => {
                const xStep = CW / chartPoints.length;
                const barW = Math.max(10, xStep - 8);
                const barH = maxVal > 0 ? Math.max(0, (p.value / maxVal) * CH) : 0;
                const x = PAD_L + i * xStep + (xStep - barW) / 2;
                const y = PAD_T + CH - barH;
                return (
                  <React.Fragment key={i}>
                    <Rect x={x} y={PAD_T} width={barW} height={CH} rx={5} fill={barEmptyFill} />
                    {barH > 0 && (
                      <Rect x={x} y={y} width={barW} height={Math.max(barH, 4)} rx={5} fill="url(#barFillGrad)" opacity={0.88} />
                    )}
                    <SvgText x={x + barW / 2} y={SVG_H - 6} textAnchor="middle" fontSize={8} fill={axisLabelFill}>
                      {p.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>

          {/* ── Alışkanlık Bazlı ─────────────────────────── */}
          <View style={[styles.card, { borderColor: t.panelBorder, shadowColor: t.cardShadow }]}>
            <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
            <LinearGradient
              colors={t.cardGrad as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />
            <Text style={[styles.chartTitle, { color: t.t3 }]}>{i18n.habitBreakdownTitle}</Text>

            {filteredHabits.length === 0 ? (
              <Text style={[styles.noDataText, { color: t.t3 }]}>{i18n.notEnoughData}</Text>
            ) : (
              <View style={styles.breakdownRows}>
                {breakdownData.map((item) => {
                  const pct = maxBreakdown > 0 ? Math.min(item.value / maxBreakdown, 1) : 0;
                  return (
                    <View key={item.id} style={styles.breakdownRow}>
                      <HabitIcon icon={item.icon} size={18} color="rgba(255,255,255,0.80)" />
                      <View style={styles.breakdownTrack}>
                        <View style={styles.breakdownNameRow}>
                          <Text style={[styles.breakdownName, { color: t.t2 }]} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={[styles.breakdownVal, { color: t.tAccent }]}>
                            {breakdownValFormat(item.value)}
                          </Text>
                        </View>
                        <View style={[styles.breakdownBarBg, { backgroundColor: barEmptyFill }]}>
                          <View
                            style={[
                              styles.breakdownBarFill,
                              {
                                width: `${Math.round(pct * 100)}%` as any,
                                backgroundColor: breakdownBarColor,
                              },
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
          {/* ── Pasta Grafik ─────────────────────────────── */}
          <View style={[styles.card, { borderColor: t.panelBorder, shadowColor: t.cardShadow }]}>
            <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
            <LinearGradient
              colors={t.cardGrad as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />
            <Text style={[styles.chartTitle, { color: t.t3 }]}>{i18n.pieChartTitle}</Text>

            {pieData.length === 0 ? (
              <Text style={[styles.noDataText, { color: t.t3 }]}>{i18n.notEnoughData}</Text>
            ) : (() => {
              const pieTotal = pieData.reduce((s, d) => s + d.value, 0);
              const centerNum = habitType === 'time' ? `${pieTotal} dk` : `${pieTotal}`;
              const centerFill = t.dark ? 'rgba(255,255,255,0.88)' : 'rgba(76,29,149,0.85)';
              const centerSub  = t.dark ? 'rgba(255,255,255,0.38)' : 'rgba(76,29,149,0.50)';
              return (
                <View style={styles.pieContent}>
                  <Svg width={140} height={140}>
                    {pieData.map((seg, idx) => {
                      let startAngle = 0;
                      for (let i = 0; i < idx; i++) startAngle += (pieData[i].value / pieTotal) * 360;
                      const sweep = (seg.value / pieTotal) * 360;
                      return (
                        <Path
                          key={seg.key}
                          d={donutArcPath(70, 70, 58, 36, startAngle, startAngle + sweep)}
                          fill={seg.color}
                          opacity={0.88}
                        />
                      );
                    })}
                    <SvgText x={70} y={65} textAnchor="middle" fontSize={habitType === 'time' ? 13 : 20} fontWeight="bold" fill={centerFill}>
                      {centerNum}
                    </SvgText>
                    <SvgText x={70} y={80} textAnchor="middle" fontSize={8} fill={centerSub}>
                      toplam
                    </SvgText>
                  </Svg>

                  <View style={styles.pieLegend}>
                    {pieData.map((seg) => {
                      const pct = Math.round((seg.value / pieTotal) * 100);
                      return (
                        <View key={seg.key} style={styles.pieLegendRow}>
                          <View style={[styles.pieLegendDot, { backgroundColor: seg.color }]} />
                          <Text style={[styles.pieLegendLabel, { color: t.t2 }]} numberOfLines={1}>
                            {seg.label}
                          </Text>
                          <Text style={[styles.pieLegendPct, { color: t.tAccent }]}>{pct}%</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })()}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
