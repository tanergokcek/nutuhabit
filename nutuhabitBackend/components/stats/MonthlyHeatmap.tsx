import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';

interface DayData {
  date: string; // 'YYYY-MM-DD'
  completionRate: number; // 0-1
}

interface MonthlyHeatmapProps {
  data: DayData[];
  year: number;
  month: number; // 1-12
}

const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function getRateColor(rate: number, isDark: boolean): string {
  if (rate === 0) return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(139,92,246,0.10)';
  if (rate < 0.25) return 'rgba(168,85,247,0.22)';
  if (rate < 0.5) return 'rgba(168,85,247,0.40)';
  if (rate < 0.75) return 'rgba(139,92,246,0.58)';
  if (rate < 1) return 'rgba(124,58,237,0.76)';
  return '#7c3aed';
}

export function MonthlyHeatmap({ data, year, month }: MonthlyHeatmapProps) {
  const t = useAppTheme();
  const i18n = useTranslation();
  const monthDate = new Date(year, month - 1, 1);
  const monthName = monthDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(year, month, 0).getDate();

  const rateMap: Record<string, number> = {};
  for (const d of data) {
    rateMap[d.date] = d.completionRate;
  }

  const firstDayRaw = new Date(year, month - 1, 1).getDay();
  const firstDayMon = firstDayRaw === 0 ? 6 : firstDayRaw - 1;

  const cells: (number | null)[] = [
    ...Array(firstDayMon).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const emptyBg = t.dark ? 'rgba(255,255,255,0.04)' : 'rgba(139,92,246,0.08)';
  const dayNumColor = t.dark ? 'rgba(255,255,255,0.45)' : 'rgba(76,29,149,0.60)';
  const dayLabelColor = t.dark ? 'rgba(255,255,255,0.30)' : 'rgba(109,40,217,0.45)';
  const legendLabelColor = t.dark ? 'rgba(255,255,255,0.30)' : 'rgba(109,40,217,0.45)';
  const todayBorderColor = t.dark ? '#c084fc' : '#7c3aed';
  const todayTextColor = t.dark ? '#c084fc' : '#6d28d9';

  return (
    <View style={[styles.container, { borderColor: t.panelBorder, shadowColor: t.cardShadow }]}>
      <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.cardGrad as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <Text style={[styles.title, { color: t.t3 }]}>{i18n.monthlyView}</Text>
      <Text style={[styles.monthLabel, { color: t.t2 }]}>{monthName}</Text>

      {/* Day labels */}
      <View style={styles.row}>
        {DAY_LABELS.map((d) => (
          <View key={d} style={styles.dayLabelCell}>
            <Text style={[styles.dayLabelText, { color: dayLabelColor }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Weeks */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.row}>
              {week.map((day, di) => {
                if (day === null) {
                  return <View key={di} style={styles.cell} />;
                }
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const rate = rateMap[dateStr] ?? -1;
                const isToday = dateStr === todayStr;
                const bgColor = rate < 0 ? emptyBg : getRateColor(rate, t.dark);

                return (
                  <View
                    key={di}
                    style={[
                      styles.cell,
                      { backgroundColor: bgColor },
                      isToday && { borderWidth: 1.5, borderColor: todayBorderColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        { color: dayNumColor },
                        isToday && { color: todayTextColor, fontWeight: FONTS.weight.bold },
                        rate >= 0.5 && styles.lightText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: legendLabelColor }]}>{i18n.less}</Text>
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
          <View
            key={i}
            style={[styles.legendDot, { backgroundColor: getRateColor(r, t.dark) }]}
          />
        ))}
        <Text style={[styles.legendLabel, { color: legendLabelColor }]}>{i18n.full}</Text>
      </View>
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
    shadowOpacity: 0.20,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  monthLabel: {
    fontSize: FONTS.size.sm,
    marginBottom: LAYOUT.spacing.sm,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  row: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  dayLabelCell: {
    width: 36,
    alignItems: 'center',
  },
  dayLabelText: {
    fontSize: 10,
    fontWeight: FONTS.weight.medium,
  },
  cell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 11,
    fontWeight: FONTS.weight.medium,
  },
  lightText: {
    color: 'rgba(255,255,255,0.92)',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: LAYOUT.spacing.sm,
    justifyContent: 'flex-end',
  },
  legendLabel: {
    fontSize: 10,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
});
