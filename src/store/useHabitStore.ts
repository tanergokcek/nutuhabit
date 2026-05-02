import { create } from 'zustand';
import { Habit, HabitLog, HabitType, TimeHabit, LogStatus } from '@/src/types/habit';
import { getTodayString } from '@/src/utils/date';
import { useAuthStore } from '@/src/store/useAuthStore';

const MOCK_USER_ID = 'mock-user-001';

export const SLEEP_HABIT_ID = 'habit-sleep';

export const SLEEP_HABIT: TimeHabit = {
  id: SLEEP_HABIT_ID,
  name: 'Uyku Takvimi',
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
    const newHabit: Habit = {
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      sortOrder: get().habits.length,
      userId: useAuthStore.getState().user?.id || 'local-user',
      ...habitData,
    } as Habit;
    set((state) => ({ habits: [newHabit, ...state.habits] }));
  },

  updateHabit: (id, updates) => {
    set((state) => ({
      habits: state.habits.map((h) => h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h)
    }));
  },

  deleteHabit: (id) => {
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id)
    }));
  },

  toggleLog: (habitId, date) => {
    // This is typically handled by updateLog or a dedicated service call
  },

  updateLog: (habitId, date, updates) => {
    set((state) => {
      const existing = state.logs.find(l => l.habitId === habitId && l.date === date);
      if (existing) {
        return {
          logs: state.logs.map(l => l.id === existing.id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l)
        };
      } else {
        const newLog: HabitLog = {
          id: `local-${Date.now()}`,
          habitId,
          date,
          userId: existing?.userId || 'local-user',
          status: updates.status || 'done',
          ...updates,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { logs: [...state.logs, newLog] };
      }
    });
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
