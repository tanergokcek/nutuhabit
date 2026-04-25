import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogStatus } from '@/src/types/habit';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

interface DoneToggleProps {
  status: LogStatus | undefined;
  onChange: (newStatus: LogStatus) => void;
  habitId: string;
  style?: ViewStyle;
  compact?: boolean;
}

const STATUS_CONFIG: Record<string, { emoji: string; label: string; bg: string; textColor: string; borderColor: string; isDone?: boolean }> = {
  undefined: {
    emoji: '○',
    label: 'Yaptım mı?',
    bg: 'rgba(255,255,255,0.08)',
    textColor: 'rgba(255,255,255,0.50)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  done: {
    emoji: '✅',
    label: 'Yaptım',
    bg: 'rgba(139,92,246,0.22)',
    textColor: '#c4b5fd',
    borderColor: 'rgba(139,92,246,0.45)',
    isDone: true,
  },
  failed: {
    emoji: '❌',
    label: 'Yapmadım',
    bg: 'rgba(239,68,68,0.15)',
    textColor: '#F87171',
    borderColor: 'rgba(239,68,68,0.30)',
  },
  excused: {
    emoji: '🔄',
    label: 'Mazeretli',
    bg: 'rgba(245,158,11,0.15)',
    textColor: '#FCD34D',
    borderColor: 'rgba(245,158,11,0.30)',
  },
  skipped: {
    emoji: '⏭',
    label: 'Atlandı',
    bg: 'rgba(255,255,255,0.08)',
    textColor: 'rgba(255,255,255,0.45)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
};

function getNextStatus(current: LogStatus | undefined): LogStatus {
  if (!current || current === 'skipped') return 'done';
  if (current === 'done') return 'failed';
  if (current === 'failed') return 'excused';
  return 'done';
}

export function DoneToggle({ status, onChange, compact = false }: DoneToggleProps) {
  const key = status ?? 'undefined';
  const config = STATUS_CONFIG[key] ?? STATUS_CONFIG['undefined'];

  const handlePress = () => {
    onChange(getNextStatus(status));
  };

  if (compact) {
    if (config.isDone) {
      return (
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.75}
          style={styles.compactDone}
        >
          <LinearGradient
            colors={['#9333ea', '#7c3aed']}
            style={styles.compactGradient}
          >
            <Text style={styles.compactEmoji}>{config.emoji}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.75}
        style={[
          styles.compactButton,
          { backgroundColor: config.bg, borderColor: config.borderColor },
        ]}
      >
        <Text style={styles.compactEmoji}>{config.emoji}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      style={[
        styles.button,
        { backgroundColor: config.bg, borderColor: config.borderColor },
      ]}
    >
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.label, { color: config.textColor }]}>{config.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: LAYOUT.radius.full,
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
  },
  compactButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactDone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 6,
  },
  compactGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactEmoji: {
    fontSize: 18,
  },
});
