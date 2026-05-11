import { useMemo } from 'react';
import { HabitLog, HabitType, StreakInfo, Habit } from '@/src/types/habit';
import { calculateStreak } from '@/src/utils/streak';
import { useHabitStore } from '@/src/store/useHabitStore';

export function useStreak(habitId: string, referenceDate?: string): StreakInfo {
  const allLogs = useHabitStore((state) => state.logs);
  const habits = useHabitStore((state) => state.habits);

  return useMemo(() => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return { currentStreak: 0, longestStreak: 0, totalDays: 0, lastCompletedDate: null, isActiveToday: false };
    
    const logs = allLogs.filter((l) => l.habitId === habitId);
    return calculateStreak(logs, habit, referenceDate);
  }, [allLogs, habitId, habits, referenceDate]);
}

export function useStreakFromLogs(logs: HabitLog[], habit: Habit, referenceDate?: string): StreakInfo {
  return useMemo(() => {
    return calculateStreak(logs, habit, referenceDate);
  }, [logs, habit, referenceDate]);
}
