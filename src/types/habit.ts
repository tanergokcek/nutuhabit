export type HabitType = 'done' | 'time' | 'bad';

export type LogStatus = 'done' | 'failed' | 'excused' | 'skipped';

export interface HabitBase {
  id: string;
  name: string;
  icon: string;
  color?: string;
  type: HabitType;
  createdAt: string; // ISO date string
  updatedAt: string;
  isArchived: boolean;
  sortOrder: number;
  userId: string;
}

export interface DoneHabit extends HabitBase {
  type: 'done';
}

export interface TimeHabit extends HabitBase {
  type: 'time';
  goalMinutes: number; // target duration in minutes
}

export type BadLimitType = 'time' | 'count';
export type BadLimitPeriod = 'daily' | 'weekly' | 'monthly';

export interface BadHabit extends HabitBase {
  type: 'bad';
  limitMinutes: number;           // max allowed minutes (used when limitType === 'time')
  limitType: BadLimitType;        // 'time' = süre (dk), 'count' = adet (kez)
  limitCount: number;             // max allowed count (used when limitType === 'count')
  limitPeriod: BadLimitPeriod;    // günlük / haftalık / aylık
}

export type Habit = DoneHabit | TimeHabit | BadHabit;

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // 'YYYY-MM-DD'
  status: LogStatus;
  // For 'done' type
  completedAt?: string;
  // For 'time' type
  elapsedMinutes?: number;
  // For 'bad' type
  usedMinutes?: number;
  usedCount?: number;   // count-based bad habit: kaç kez yapıldı
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimerSession {
  id: string;
  habitId: string;
  date: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  lastCompletedDate: string | null;
  isActiveToday: boolean;
}
