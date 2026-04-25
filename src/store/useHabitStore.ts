import { create } from 'zustand';
import { Habit, HabitLog, HabitType, TimeHabit, LogStatus } from '@/src/types/habit';
import { getTodayString } from '@/src/utils/date';
import { useAuthStore } from '@/src/store/useAuthStore';

const MOCK_USER_ID = 'mock-user-001';

export const SLEEP_HABIT_ID = 'habit-sleep';

const SLEEP_HABIT: TimeHabit = {
  id: SLEEP_HABIT_ID,
  name: 'Uyku',
  icon: '🌙',
  color: '#7C3AED',
  type: 'time',
  goalMinutes: 480, // 8 saat
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isArchived: false,
  sortOrder: 0,
  userId: MOCK_USER_ID,
};

export type HabitFilter = 'all' | 'done' | 'time' | 'bad';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  filter: HabitFilter;
  scrollToHabitId: string | null;
  lastUsedHabitId: string | null;
  // Actions
  setHabits: (habits: Habit[]) => void;
  setLogs: (logs: HabitLog[]) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'isArchived' | 'sortOrder'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleLog: (habitId: string, date: string) => void;
  updateLog: (habitId: string, date: string, updates: Partial<HabitLog>) => void;
  setFilter: (filter: HabitFilter) => void;
  setScrollToHabitId: (id: string | null) => void;
  setLastUsedHabitId: (id: string | null) => void;
  getFilteredHabits: () => Habit[];
  getTodayLog: (habitId: string) => HabitLog | undefined;
  getLogsForHabit: (habitId: string) => HabitLog[];
  resetHabits: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: [],
  filter: 'all',
  scrollToHabitId: null,
  lastUsedHabitId: null,

  setHabits: (habits) => set({ habits }),
  setLogs: (logs) => set({ logs }),

  addHabit: (habitData) => {
    // Firebase implementation will go here
  },

  updateHabit: (id, updates) => {
    // Firebase implementation will go here
  },

  deleteHabit: (id) => {
    // Firebase implementation will go here
  },

  toggleLog: (habitId, date) => {
    // Firebase implementation will go here
  },

  updateLog: (habitId, date, updates) => {
    // Firebase implementation will go here
  },

  setFilter: (filter) => set({ filter }),
  setScrollToHabitId: (id) => set({ scrollToHabitId: id }),
  setLastUsedHabitId: (id) => set({ lastUsedHabitId: id }),

  getFilteredHabits: () => {
    const { habits, filter } = get();
    const active = habits.filter((h) => !h.isArchived);
    if (filter === 'all') return active;
    return active.filter((h) => h.type === (filter as HabitType));
  },

  getTodayLog: (habitId) => {
    const { logs } = get();
    const today = getTodayString();
    return logs.find((l) => l.habitId === habitId && l.date === today);
  },

  getLogsForHabit: (habitId) => {
    const { logs } = get();
    return logs.filter((l) => l.habitId === habitId);
  },

  resetHabits: () => {
    set({
      habits: [],
      logs: [],
      filter: 'all',
      scrollToHabitId: null,
      lastUsedHabitId: null,
    });
  },
}));
