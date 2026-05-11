import { Habit, HabitLog, HabitType, StreakInfo } from '@/src/types/habit';
import { getTodayString, addDays } from './date';

export function calculateStreak(logs: HabitLog[], habit: Habit, referenceDate?: string): StreakInfo {
  const { type } = habit;
  if (logs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      lastCompletedDate: null,
      isActiveToday: false,
    };
  }

  // Sadece başarılı veya mazeretli olan logları seri say
  const completedLogs = logs.filter((log) => {
    if (type === 'done') return log.status === 'done' || log.status === 'excused';
    if (type === 'time') return log.status === 'done' || log.status === 'excused';
    if (type === 'bad') return log.status === 'done' || log.status === 'excused';
    return false;
  });

  // Sort by date descending
  const sortedDates = completedLogs
    .map((l) => l.date)
    .sort((a, b) => (a > b ? -1 : 1));

  const uniqueDates = Array.from(new Set(sortedDates.map(d => d.trim())));
  const totalDays = uniqueDates.length;

  if (totalDays === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      lastCompletedDate: null,
      isActiveToday: false,
    };
  }

  const lastCompletedDate = uniqueDates[0];
  const today = referenceDate || getTodayString();
  const yesterday = addDays(today, -1);

  const isActiveToday = lastCompletedDate === today;

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = isActiveToday ? today : yesterday;

  // Only start streak if last completed is today or yesterday
  if (lastCompletedDate === today || lastCompletedDate === yesterday) {
    const dateSet = new Set(uniqueDates);
    let current = checkDate;
    while (dateSet.has(current)) {
      currentStreak++;
      current = addDays(current, -1);
    }
  }

  // Calculate longest streak
  // Sort ascending
  const ascDates = [...uniqueDates].sort();
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < ascDates.length; i++) {
    const prev = ascDates[i - 1];
    const curr = ascDates[i];
    const prevDate = new Date(prev);
    const currDate = new Date(curr);
    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    totalDays,
    lastCompletedDate,
    isActiveToday,
  };
}
