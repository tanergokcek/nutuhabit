import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';
import { getDayName } from '@/src/utils/date';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';

interface DayData {
  date: string;
  completionRate: number; // 0-1
}

interface WeeklyChartProps {
  data: DayData[];
  height?: number;
}

export function WeeklyChart({ data, height = 160 }: WeeklyChartProps) {
  const t = useAppTheme();
  const i18n = useTranslation();
  const chartPaddingBottom = 32;
  const chartPaddingTop = 16;
  const chartHeight = height - chartPaddingBottom - chartPaddingTop;
  const barWidth = 32;
  const barGap = 8;
  const totalWidth = data.length * (barWidth + barGap) - barGap;

  // Percent/label text color — dark in light mode, light in dark mode
  const labelFill = t.dark ? 'rgba(255,255,255,0.38)' : 'rgba(76,29,149,0.55)';
  const todayFill = t.dark ? '#c084fc' : '#6d28d9';
  const pctFill = t.dark ? 'rgba(255,255,255,0.50)' : 'rgba(76,29,149,0.65)';

  return (
    <View style={[styles.container, { borderColor: t.panelBorder, shadowColor: t.cardShadow }]}>
      <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.cardGrad as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <Text style={[styles.title, { color: t.t3 }]}>{i18n.weeklyCompletion}</Text>
      <View style={styles.chartWrapper}>
        <Svg width={totalWidth + 8} height={height}>
          <Defs>
            <SvgLinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#a855f7" stopOpacity="1" />
              <Stop offset="1" stopColor="#7c3aed" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="barGradDone" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#22C55E" stopOpacity="1" />
              <Stop offset="1" stopColor="#16a34a" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          {data.map((day, index) => {
            const x = index * (barWidth + barGap);
            const barH = Math.max(4, day.completionRate * chartHeight);
            const y = chartPaddingTop + chartHeight - barH;
            const isToday = index === data.length - 1;
            const fillId = day.completionRate >= 1 ? 'url(#barGradDone)' : 'url(#barGrad)';
            // Empty bar bg — themed
            const emptyFill = t.rowBg;

            return (
              <React.Fragment key={day.date}>
                {/* Background bar */}
                <Rect
                  x={x}
                  y={chartPaddingTop}
                  width={barWidth}
                  height={chartHeight}
                  rx={6}
                  fill={emptyFill}
                />
                {/* Value bar */}
                {day.completionRate > 0 ? (
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx={6}
                    fill={fillId}
                    opacity={isToday ? 1 : 0.85}
                  />
                ) : null}
                {/* Percentage text above bar */}
                {day.completionRate > 0 ? (
                  <SvgText
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize={9}
                    fill={pctFill}
                  >
                    {Math.round(day.completionRate * 100)}%
                  </SvgText>
                ) : null}
                {/* Day label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fill={isToday ? todayFill : labelFill}
                  fontWeight={isToday ? 'bold' : 'normal'}
                >
                  {getDayName(day.date)}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
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
  chartWrapper: {
    alignItems: 'center',
  },
});
