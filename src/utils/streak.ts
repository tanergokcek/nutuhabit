import { Habit, HabitLog, HabitType, StreakInfo, TimeHabit } from '@/src/types/habit';
import { getTodayString, addDays } from './date';
import { isDayActiveForHabit } from './frequency';

export function calculateStreak(logs: HabitLog[], habit: Habit, referenceDate?: string): StreakInfo {
  const { type } = habit;
  const today = referenceDate || getTodayString();

  // Filter logs to only include those on or before the reference date
  const relevantLogs = logs.filter(l => l.date <= today);

  if (relevantLogs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      lastCompletedDate: null,
      isActiveToday: false,
    };
  }

  // Sadece başarılı veya mazeretli olan logları seri say
  const completedLogs = relevantLogs.filter((log) => {
    if (log.status === 'excused') return true;
    
    if (type === 'done') return log.status === 'done';
    if (type === 'time') {
      const goal = (habit as TimeHabit).goalMinutes || 0;
      const elapsed = log.elapsedMinutes || 0;
      // Eğer hedef süreye ulaşıldıysa streak saysın (mazeretli durumu yukarıda kontrol ediliyor)
      return elapsed >= goal;
    }
    if (type === 'bad') return log.status === 'done';
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

  const isActiveToday = lastCompletedDate === today;
  const dateSet = new Set(uniqueDates);

  // ── Current Streak (frequency-aware) ──────────────────────────────────────
  let currentStreak = 0;

  // Find the starting point: today or the last active day before today
  let checkDate = today;

  // Walk backwards to find a suitable starting point
  // If today is not active and not completed, skip to the previous active day
  const todayActive = isDayActiveForHabit(habit, today);
  const todayCompleted = dateSet.has(today);

  if (todayCompleted) {
    // Start from today
    checkDate = today;
  } else if (todayActive) {
    // Today is active but not completed — check if it's still "today" (streak can start from yesterday)
    checkDate = addDays(today, -1);
  } else {
    // Today is not an active day — skip backwards to find the last active day
    checkDate = addDays(today, -1);
  }

  // Count streak backwards
  // First, move checkDate back to find a completed active day
  let maxLookback = 14; // don't look more than 2 weeks back
  let found = false;
  let startDate = checkDate;

  if (todayCompleted) {
    found = true;
    startDate = today;
  } else {
    for (let i = 0; i < maxLookback; i++) {
      const d = addDays(today, -(i + 1));
      if (isDayActiveForHabit(habit, d)) {
        if (dateSet.has(d)) {
          found = true;
          startDate = d;
          break;
        } else {
          // Active day not completed — streak is broken
          break;
        }
      }
      // Non-active day — skip (doesn't break streak)
    }
  }

  if (found) {
    // Count the streak from startDate going backwards
    let d = startDate;
    while (true) {
      if (isDayActiveForHabit(habit, d)) {
        if (dateSet.has(d)) {
          currentStreak++;
        } else {
          break; // Active day not completed — streak ends
        }
      }
      // Move to previous day (non-active days are simply skipped)
      d = addDays(d, -1);
      // Safety: don't go back more than 365 days
      if (currentStreak > 365) break;
    }
  }

  // ── Longest Streak (frequency-aware) ──────────────────────────────────────
  // Sort ascending
  const ascDates = [...uniqueDates].sort();
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < ascDates.length; i++) {
    const prev = ascDates[i - 1];
    const curr = ascDates[i];

    // Check if all active days between prev and curr are covered
    let streakContinues = true;
    let d = addDays(prev, 1);
    while (d < curr) {
      if (isDayActiveForHabit(habit, d)) {
        // There's an active day between prev and curr that has no log — streak broken
        streakContinues = false;
        break;
      }
      d = addDays(d, 1);
    }

    if (streakContinues) {
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
