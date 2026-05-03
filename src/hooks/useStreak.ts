import { useMemo } from 'react';
import { HabitLog, HabitType, StreakInfo } from '@/src/types/habit';
import { calculateStreak } from '@/src/utils/streak';
import { useHabitStore } from '@/src/store/useHabitStore';

export function useStreak(habitId: string): StreakInfo {
  const allLogs = useHabitStore((state) => state.logs);
  const habits = useHabitStore((state) => state.habits);

  return useMemo(() => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return { currentStreak: 0, longestStreak: 0, totalDays: 0, lastCompletedDate: null, isActiveToday: false };
    
    const logs = allLogs.filter((l) => l.habitId === habitId);
    return calculateStreak(logs, habit);
  }, [allLogs, habitId, habits]);
}

export function useStreakFromLogs(logs: HabitLog[], habit: Habit): StreakInfo {
  return useMemo(() => {
    return calculateStreak(logs, habit);
  }, [logs, habit]);
}
