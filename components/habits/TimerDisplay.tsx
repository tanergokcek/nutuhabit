import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TimeHabit, TimerSession } from '@/src/types/habit';
import { useTimerStore } from '@/src/store/useTimerStore';
import { useHabitStore } from '@/src/store/useHabitStore';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { formatSeconds, formatMinutes } from '@/src/utils/formatTime';
import { getTodayString } from '@/src/utils/date';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

interface TimerDisplayProps {
  habit: TimeHabit;
  selectedDate: string;
  onFutureError?: () => void;
}

export function TimerDisplay({ habit, selectedDate, onFutureError }: TimerDisplayProps) {
  const {
    activeHabitId,
    elapsedSeconds,
    isRunning,
    isPaused,
    sessions,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tick,
  } = useTimerStore();

  const getTodayLog = useHabitStore((state) => state.getTodayLog);
  const updateLog = useHabitStore((state) => state.updateLog);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActive = activeHabitId === habit.id;

  const todayLog = getTodayLog(habit.id);
  const existingMinutes = todayLog?.elapsedMinutes ?? 0;
  const totalElapsedSeconds = isActive
    ? existingMinutes * 60 + elapsedSeconds
    : existingMinutes * 60;

  const goalSeconds = habit.goalMinutes * 60;
  const progress = Math.min(1, totalElapsedSeconds / goalSeconds);
  const isGoalMet = totalElapsedSeconds >= goalSeconds;

  const todaySessions = sessions.filter(
    (s) => s.habitId === habit.id && s.date === getTodayString()
  );

  useEffect(() => {
    if (isActive && isRunning) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isRunning, tick]);

  const handleStart = () => {
    if (selectedDate > getTodayString()) {
      onFutureError?.();
      return;
    }
    startTimer(habit.id);
  };
  const handlePause = () => pauseTimer();
  const handleResume = () => resumeTimer();

  const handleStop = () => {
    const session = stopTimer();
    if (session) {
      const totalMin = existingMinutes + Math.floor(session.durationSeconds / 60);
      updateLog(habit.id, selectedDate, {
        elapsedMinutes: totalMin,
        status: totalMin >= habit.goalMinutes ? 'done' : 'failed',
      });
    }
  };

  const displaySeconds = totalElapsedSeconds;
  const remainingSeconds = Math.max(0, goalSeconds - displaySeconds);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main timer ring */}
      <View style={styles.ringContainer}>
        <ProgressRing
          progress={progress}
          size={220}
          strokeWidth={14}
          color={isGoalMet ? '#22C55E' : '#a855f7'}
          trackColor="rgba(255,255,255,0.10)"
        >
          <View style={styles.ringContent}>
            <Text style={styles.timerText}>
              {isActive ? formatSeconds(elapsedSeconds) : formatSeconds(totalElapsedSeconds)}
            </Text>
            <Text style={[styles.timerSubtext, { color: isGoalMet ? '#4ade80' : COLORS.primary[300] }]}>
              {isGoalMet
                ? '🎉 Tamamlandı!'
                : `${formatMinutes(Math.ceil(remainingSeconds / 60))} kaldı`}
            </Text>
            <Text style={styles.goalText}>Hedef: {formatMinutes(habit.goalMinutes)}</Text>
          </View>
        </ProgressRing>
      </View>

      {/* Control buttons */}
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity
            onPress={handleStart}
            style={styles.mainButtonWrapper}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#9333ea', '#7c3aed', '#6d28d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.mainButton}
            >
              <Text style={styles.mainButtonText}>▶  Başla</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : isRunning ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handlePause}
              style={[styles.secondaryButton, { backgroundColor: 'rgba(245,158,11,0.20)', borderColor: 'rgba(245,158,11,0.35)' }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryButtonText, { color: '#FCD34D' }]}>⏸  Duraklat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStop}
              style={[styles.secondaryButton, { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryButtonText, { color: 'rgba(255,255,255,0.65)' }]}>■  Bitir</Text>
            </TouchableOpacity>
          </View>
        ) : isPaused ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleResume}
              style={styles.mainButtonWrapper}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#9333ea', '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.secondaryButton, { borderColor: 'transparent' }]}
              >
                <Text style={styles.secondaryButtonText}>▶  Devam Et</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStop}
              style={[styles.secondaryButton, { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryButtonText, { color: 'rgba(255,255,255,0.65)' }]}>■  Bitir</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Today's sessions */}
      {todaySessions.length > 0 ? (
        <View style={styles.sessions}>
          <Text style={styles.sessionsTitle}>Bugünkü Seanslar</Text>
          {todaySessions.map((session: TimerSession, index: number) => (
            <View key={session.id} style={styles.sessionItem}>
              <Text style={styles.sessionNumber}>#{index + 1}</Text>
              <Text style={styles.sessionDuration}>
                {formatSeconds(session.durationSeconds)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: LAYOUT.spacing.lg,
    gap: LAYOUT.spacing.xl,
  },
  ringContainer: {
    marginTop: LAYOUT.spacing.lg,
  },
  ringContent: {
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: FONTS.size['4xl'],
    fontWeight: FONTS.weight.bold,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 2,
  },
  timerSubtext: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
  },
  goalText: {
    fontSize: FONTS.size.xs,
    color: 'rgba(255,255,255,0.35)',
  },
  controls: {
    width: '100%',
    gap: LAYOUT.spacing.sm,
  },
  mainButtonWrapper: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 8,
  },
  mainButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: LAYOUT.radius.xl,
  },
  mainButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.neutral[0],
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: LAYOUT.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.neutral[0],
  },
  sessions: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: LAYOUT.spacing.md,
    gap: LAYOUT.spacing.sm,
  },
  sessionsTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    color: 'rgba(255,255,255,0.50)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  sessionNumber: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.40)',
  },
  sessionDuration: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.primary[300],
  },
});
