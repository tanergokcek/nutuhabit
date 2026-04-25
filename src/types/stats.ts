export interface DailyStats {
  date: string; // 'YYYY-MM-DD'
  totalHabits: number;
  completedHabits: number;
  completionRate: number; // 0-1
  totalTimeMinutes: number;
  failedHabits: number;
  excusedHabits: number;
}

export interface WeeklyStats {
  weekStart: string; // 'YYYY-MM-DD' Monday
  weekEnd: string;   // 'YYYY-MM-DD' Sunday
  days: DailyStats[];
  averageCompletionRate: number;
  bestDay: string | null;
  totalTimeMinutes: number;
  perfectDays: number;
}

export interface HabitStats {
  habitId: string;
  habitName: string;
  habitType: 'done' | 'time' | 'bad';
  totalLogs: number;
  completedCount: number;
  failedCount: number;
  excusedCount: number;
  completionRate: number; // 0-1
  currentStreak: number;
  longestStreak: number;
  totalTimeMinutes: number; // for time type
  averageTimeMinutes: number; // for time type
  thisWeekRate: number;
  thisMonthRate: number;
}
