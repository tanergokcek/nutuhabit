import { useMemo } from 'react';
import { useHabitStore, HabitFilter } from '@/src/store/useHabitStore';
import { getTodayString } from '@/src/utils/date';
import { Habit, HabitLog, TimeHabit, BadHabit } from '@/src/types/habit';

interface HabitProgress {
  completedCount: number;
  totalCount: number;
  completionRate: number; // 0-1
  completedHabitIds: string[];
}

function isHabitCompletedToday(habit: Habit, log: HabitLog | undefined): boolean {
  if (!log) return false;

  if (habit.type === 'done') {
    return log.status === 'done';
  }

  if (habit.type === 'time') {
    const timeHabit = habit as TimeHabit;
    const elapsed = log.elapsedMinutes ?? 0;
    return elapsed >= timeHabit.goalMinutes;
  }

  if (habit.type === 'bad') {
    const badHabit = habit as BadHabit;
    const used = log.usedMinutes ?? 0;
    return used <= badHabit.limitMinutes;
  }

  return false;
}

export function useHabitProgress(filter?: HabitFilter): HabitProgress {
  const habits = useHabitStore((state) => state.habits);
  const logs = useHabitStore((state) => state.logs);
  const storeFilter = useHabitStore((state) => state.filter);

  const activeFilter = filter ?? storeFilter;

  return useMemo(() => {
    const today = getTodayString();
    const activeHabits = habits.filter((h) => !h.isArchived);
    const filtered = activeFilter === 'all'
      ? activeHabits
      : activeHabits.filter((h) => h.type === activeFilter);

    const totalCount = filtered.length;
    if (totalCount === 0) {
      return { completedCount: 0, totalCount: 0, completionRate: 0, completedHabitIds: [] };
    }

    const completedHabitIds: string[] = [];

    for (const habit of filtered) {
      const log = logs.find((l) => l.habitId === habit.id && l.date === today);
      if (isHabitCompletedToday(habit, log)) {
        completedHabitIds.push(habit.id);
      }
    }

    const completedCount = completedHabitIds.length;
    const completionRate = completedCount / totalCount;

    return {
      completedCount,
      totalCount,
      completionRate,
      completedHabitIds,
    };
  }, [habits, logs, activeFilter]);
}
