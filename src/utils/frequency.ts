/**
 * Frequency-aware utilities for habit scheduling.
 *
 * Day indices follow Monday-based week:
 *   0=Pt, 1=Sa, 2=Ça, 3=Pe, 4=Cu, 5=Ct, 6=Pz
 */

import { Habit, HabitFrequency } from '@/src/types/habit';

/**
 * Returns a 7-element boolean array [Pt, Sa, Ça, Pe, Cu, Ct, Pz]
 * indicating which days the habit is active.
 */
export function getActiveDays(habit: Habit): boolean[] {
  const freq: HabitFrequency = (habit.frequency as HabitFrequency) || 'Her gün';

  switch (freq) {
    case 'Hafta içi':
      // Pt, Sa, Ça, Pe, Cu = aktif  |  Ct, Pz = pasif
      return [true, true, true, true, true, false, false];
    case 'Hafta sonu':
      // Pt-Cu = pasif  |  Ct, Pz = aktif
      return [false, false, false, false, false, true, true];
    case 'Özel':
      if (habit.customDays && habit.customDays.length === 7) {
        return habit.customDays;
      }
      // fallback: tüm günler aktif
      return Array(7).fill(true);
    case 'Her gün':
    default:
      return Array(7).fill(true);
  }
}

/**
 * Converts a date string (YYYY-MM-DD) to a Monday-based index:
 *   0=Pt, 1=Sa, 2=Ça, 3=Pe, 4=Cu, 5=Ct, 6=Pz
 */
export function getMondayBasedDayIndex(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const jsDay = d.getDay(); // 0=Sun, 1=Mon...6=Sat
  // Convert: Mon=0, Tue=1, ..., Sat=5, Sun=6
  return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Checks whether a specific date is an "active" day for the given habit.
 */
export function isDayActiveForHabit(habit: Habit, dateStr: string): boolean {
  const activeDays = getActiveDays(habit);
  const dayIdx = getMondayBasedDayIndex(dateStr);
  return activeDays[dayIdx];
}
