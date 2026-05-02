import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';

interface HabitTypeDonutProps {
  doneCount: number;
  timeCount: number;
  badCount: number;
}

const TYPE_COLOR = {
  done: '#22c55e',
  time: '#a855f7',
  bad: '#f97316',
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const clampedEnd = endAngle - startAngle >= 360 ? startAngle + 359.99 : endAngle;
  const outerStart = polarToCartesian(cx, cy, outerR, clampedEnd);
  const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, clampedEnd);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = clampedEnd - startAngle > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

export function HabitTypeDonut({ doneCount, timeCount, badCount }: HabitTypeDonutProps) {
  const t = useAppTheme();
  const i18n = useTranslation();

  const total = doneCount + timeCount + badCount;
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 56;
  const innerR = 34;

  const segments = [
    { key: 'done' as const, count: doneCount, label: i18n.tabDone },
    { key: 'time' as const, count: timeCount, label: i18n.tabTime },
    { key: 'bad' as const, count: badCount, label: i18n.tabBad },
  ];

  const centerNumFill = t.dark ? 'rgba(255,255,255,0.88)' : 'rgba(76,29,149,0.85)';
  const centerLabelFill = t.dark ? 'rgba(255,255,255,0.40)' : 'rgba(76,29,149,0.55)';

  return (
    <View style={[styles.container, { borderColor: t.panelBorder, shadowColor: t.cardShadow }]}>
      <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.cardGrad as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Text style={[styles.title, { color: t.t3 }]}>{i18n.habitDistribution}</Text>

      {total === 0 ? (
        <Text style={[styles.noData, { color: t.t3 }]}>{i18n.notEnoughData}</Text>
      ) : (
        <View style={styles.content}>
          <Svg width={size} height={size}>
            {segments.map((seg, idx) => {
              if (seg.count === 0) return null;
              let startAngle = 0;
              for (let i = 0; i < idx; i++) {
                startAngle += (segments[i].count / total) * 360;
              }
              const sweep = (seg.count / total) * 360;
              return (
                <Path
                  key={seg.key}
                  d={arcPath(cx, cy, outerR, innerR, startAngle, startAngle + sweep)}
                  fill={TYPE_COLOR[seg.key]}
                  opacity={0.88}
                />
              );
            })}
            <SvgText
              x={cx}
              y={cy - 5}
              textAnchor="middle"
              fontSize={22}
              fontWeight="bold"
              fill={centerNumFill}
            >
              {total}
            </SvgText>
            <SvgText
              x={cx}
              y={cy + 11}
              textAnchor="middle"
              fontSize={9}
              fill={centerLabelFill}
            >
              {i18n.habitsCount}
            </SvgText>
          </Svg>

          <View style={styles.legend}>
            {segments.map((item) => (
              <View key={item.key} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: TYPE_COLOR[item.key] }]} />
                <Text style={[styles.legendLabel, { color: t.t2 }]} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={[styles.legendCount, { color: t.tAccent }]}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  noData: {
    fontSize: FONTS.size.sm,
    textAlign: 'center',
    paddingVertical: 32,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  legend: {
    flex: 1,
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: FONTS.size.sm,
  },
  legendCount: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
  },
});
