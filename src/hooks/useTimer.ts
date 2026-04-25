import { useEffect, useRef, useCallback } from 'react';
import { useTimerStore } from '@/src/store/useTimerStore';
import { formatSeconds } from '@/src/utils/formatTime';
import { useHabitStore } from '@/src/store/useHabitStore';
import { getTodayString } from '@/src/utils/date';

interface UseTimerReturn {
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  formattedTime: string;
  start: (habitId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useTimer(): UseTimerReturn {
  const {
    elapsedSeconds,
    isRunning,
    isPaused,
    activeHabitId,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tick,
  } = useTimerStore();

  const updateLog = useHabitStore((state) => state.updateLog);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
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
  }, [isRunning, tick]);

  const start = useCallback((habitId: string) => {
    startTimer(habitId);
  }, [startTimer]);

  const pause = useCallback(() => {
    pauseTimer();
  }, [pauseTimer]);

  const resume = useCallback(() => {
    resumeTimer();
  }, [resumeTimer]);

  const stop = useCallback(() => {
    // Capture activeHabitId BEFORE calling stopTimer (which clears it)
    const habitId = activeHabitId;
    const session = stopTimer();
    if (session && habitId) {
      const elapsedMinutes = Math.floor(session.durationSeconds / 60);
      updateLog(habitId, getTodayString(), {
        elapsedMinutes,
        status: 'done',
      });
    }
  }, [stopTimer, activeHabitId, updateLog]);

  return {
    elapsedSeconds,
    isRunning,
    isPaused,
    formattedTime: formatSeconds(elapsedSeconds),
    start,
    pause,
    resume,
    stop,
  };
}
