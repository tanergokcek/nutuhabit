import { useMemo } from 'react';
import { HabitLog, HabitType, StreakInfo } from '@/src/types/habit';
import { calculateStreak } from '@/src/utils/streak';
import { useHabitStore } from '@/src/store/useHabitStore';

export function useStreak(habitId: string, type: HabitType): StreakInfo {
  const allLogs = useHabitStore((state) => state.logs);

  const streakInfo = useMemo(() => {
    const logs = allLogs.filter((l) => l.habitId === habitId);
    return calculateStreak(logs, type);
  }, [allLogs, habitId, type]);

  return streakInfo;
}

export function useStreakFromLogs(logs: HabitLog[], type: HabitType): StreakInfo {
  return useMemo(() => {
    return calculateStreak(logs, type);
  }, [logs, type]);
}
