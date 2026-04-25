import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TimeHabit, HabitLog } from '@/src/types/habit';
import { useTimerStore } from '@/src/store/useTimerStore';
import { useHabitStore } from '@/src/store/useHabitStore';
import { formatSeconds, formatMinutes } from '@/src/utils/formatTime';
import { getTodayString } from '@/src/utils/date';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

interface TimeTrackerProps {
  habit: TimeHabit;
  log: HabitLog | undefined;
}

export function TimeTracker({ habit, log }: TimeTrackerProps) {
  const {
    activeHabitId,
    elapsedSeconds,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tick,
  } = useTimerStore();

  const updateLog = useHabitStore((state) => state.updateLog);

  const isActive = activeHabitId === habit.id;
  const currentElapsed = isActive ? elapsedSeconds : 0;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const existingMinutes = log?.elapsedMinutes ?? 0;
  const totalElapsedMinutes = existingMinutes + (isActive ? Math.floor(currentElapsed / 60) : 0);
  const progress = Math.min(1, totalElapsedMinutes / habit.goalMinutes);
  const isGoalMet = totalElapsedMinutes >= habit.goalMinutes;

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isRunning, tick]);

  const handleStart = () => {
    startTimer(habit.id);
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = () => {
    resumeTimer();
  };

  const handleStop = () => {
    const session = stopTimer();
    if (session) {
      const totalMin = existingMinutes + Math.floor(session.durationSeconds / 60);
      updateLog(habit.id, getTodayString(), {
        elapsedMinutes: totalMin,
        status: totalMin >= habit.goalMinutes ? 'done' : 'failed',
      });
    }
  };

  const progressBarWidth = `${Math.round(progress * 100)}%` as `${number}%`;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={isGoalMet ? ['#22C55E', '#16a34a'] : ['#a855f7', '#7c3aed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: progressBarWidth }]}
        />
      </View>

      <View style={styles.row}>
        {/* Time info */}
        <View>
          <Text style={[styles.elapsed, { color: isGoalMet ? '#4ade80' : COLORS.primary[300] }]}>
            {isActive ? formatSeconds(currentElapsed) : formatMinutes(existingMinutes)}
          </Text>
          <Text style={styles.goal}>/ {formatMinutes(habit.goalMinutes)}</Text>
        </View>

        {/* Control button */}
        <View style={styles.controls}>
          {!isActive ? (
            <TouchableOpacity
              onPress={handleStart}
              style={styles.controlBtnWrapper}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#9333ea', '#7c3aed']}
                style={styles.controlBtn}
              >
                <Text style={styles.controlIcon}>▶</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : isRunning ? (
            <>
              <TouchableOpacity
                onPress={handlePause}
                style={[styles.controlBtn, { backgroundColor: 'rgba(245,158,11,0.25)', borderRadius: 18 }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.controlIcon, { color: '#FCD34D' }]}>⏸</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleStop}
                style={[styles.controlBtn, { backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 18 }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.controlIcon, { color: 'rgba(255,255,255,0.60)' }]}>■</Text>
              </TouchableOpacity>
            </>
          ) : isPaused ? (
            <>
              <TouchableOpacity
                onPress={handleResume}
                style={styles.controlBtnWrapper}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#9333ea', '#7c3aed']}
                  style={styles.controlBtn}
                >
                  <Text style={styles.controlIcon}>▶</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleStop}
                style={[styles.controlBtn, { backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 18 }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.controlIcon, { color: 'rgba(255,255,255,0.60)' }]}>■</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  elapsed: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
  },
  goal: {
    fontSize: FONTS.size.xs,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 1,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlBtnWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  controlBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    fontSize: 14,
    color: COLORS.neutral[0],
    fontWeight: FONTS.weight.bold,
  },
});
