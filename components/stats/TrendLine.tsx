import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';

interface DataPoint {
  label: string;
  value: number; // 0-100 (percentage)
}

interface TrendLineProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  title?: string;
}

export function TrendLine({
  data,
  height = 120,
  color = COLORS.primary[400],
  title = 'Trend',
}: TrendLineProps) {
  const t = useAppTheme();
  const i18n = useTranslation();

  const gridStroke = t.dark ? 'rgba(255,255,255,0.10)' : 'rgba(109,40,217,0.15)';
  const labelFill = t.dark ? 'rgba(255,255,255,0.35)' : 'rgba(76,29,149,0.55)';

  if (data.length < 2) {
    return (
      <View style={[styles.container, { borderColor: t.panelBorder, shadowColor: t.cardShadow }]}>
        <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={t.cardGrad as any}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        />
        <View style={[styles.specular, { backgroundColor: t.specular }]} />
        <Text style={[styles.title, { color: t.t3 }]}>{title}</Text>
        <Text style={[styles.noData, { color: t.t3 }]}>{i18n.notEnoughData}</Text>
      </View>
    );
  }

  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 24;

  const chartWidth = LAYOUT.screen.width - LAYOUT.spacing.md * 2 - LAYOUT.spacing.md * 2 - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = 100;
  const minVal = 0;

  const xStep = chartWidth / (data.length - 1);

  const points = data.map((d, i) => {
    const x = paddingLeft + i * xStep;
    const y = paddingTop + chartHeight - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, ...d };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  const svgWidth = paddingLeft + chartWidth + paddingRight;
  const svgHeight = height;

  return (
    <View style={[styles.container, { borderColor: t.panelBorder, shadowColor: t.cardShadow }]}>
      <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.cardGrad as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <View style={[styles.specular, { backgroundColor: t.specular }]} />

      <Text style={[styles.title, { color: t.t3 }]}>{title}</Text>
      <Svg width={svgWidth} height={svgHeight}>
        <Defs>
          <SvgLinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#c084fc" stopOpacity="1" />
            <Stop offset="1" stopColor="#818cf8" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = paddingTop + chartHeight - (v / 100) * chartHeight;
          return (
            <React.Fragment key={v}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + chartWidth}
                y2={y}
                stroke={gridStroke}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText
                x={paddingLeft - 4}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill={labelFill}
              >
                {v}%
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Line */}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <React.Fragment key={i}>
            <Circle cx={p.x} cy={p.y} r={4} fill={color} opacity={0.9} />
            <Circle cx={p.x} cy={p.y} r={2} fill={t.dark ? 'rgba(255,255,255,0.95)' : '#fff'} />
            {/* X-axis label */}
            <SvgText
              x={p.x}
              y={svgHeight - 4}
              textAnchor="middle"
              fontSize={9}
              fill={labelFill}
            >
              {p.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    padding: LAYOUT.spacing.md,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  specular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  title: {
    fontSize: 10,
    fontWeight: FONTS.weight.semibold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: LAYOUT.spacing.sm,
  },
  noData: {
    fontSize: FONTS.size.sm,
    textAlign: 'center',
    paddingVertical: 32,
  },
});
