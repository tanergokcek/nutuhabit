import { create } from 'zustand';
import { TimerSession } from '@/src/types/habit';
import { getTodayString } from '@/src/utils/date';

interface TimerState {
  activeHabitId: string | null;
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  sessions: TimerSession[];
  _intervalId: ReturnType<typeof setInterval> | null;

  // Actions
  startTimer: (habitId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => TimerSession | null;
  resetTimer: () => void;
  tick: () => void;
  getSessionsForHabit: (habitId: string) => TimerSession[];
  getTodayElapsedSeconds: (habitId: string) => number;
  resetTimerStore: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  activeHabitId: null,
  elapsedSeconds: 0,
  isRunning: false,
  isPaused: false,
  sessions: [],
  _intervalId: null,

  startTimer: (habitId: string) => {
    const { _intervalId, isRunning } = get();

    // Clear any existing interval
    if (_intervalId) {
      clearInterval(_intervalId);
    }

    if (isRunning && get().activeHabitId === habitId) {
      return; // Already running for this habit
    }

    set({
      activeHabitId: habitId,
      elapsedSeconds: 0,
      isRunning: true,
      isPaused: false,
    });
  },

  pauseTimer: () => {
    const { isRunning } = get();
    if (!isRunning) return;
    set({ isRunning: false, isPaused: true });
  },

  resumeTimer: () => {
    const { isPaused } = get();
    if (!isPaused) return;
    set({ isRunning: true, isPaused: false });
  },

  stopTimer: () => {
    // Firebase implementation will go here
    set({
      activeHabitId: null,
      elapsedSeconds: 0,
      isRunning: false,
      isPaused: false,
    });
    return null;
  },

  resetTimer: () => {
    set({
      elapsedSeconds: 0,
      isRunning: false,
      isPaused: false,
    });
  },

  tick: () => {
    const { isRunning } = get();
    if (!isRunning) return;
    set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
  },

  getSessionsForHabit: (habitId: string) => {
    const { sessions } = get();
    return sessions.filter((s) => s.habitId === habitId);
  },

  getTodayElapsedSeconds: (habitId: string) => {
    const { sessions } = get();
    const today = getTodayString();
    return sessions
      .filter((s) => s.habitId === habitId && s.date === today)
      .reduce((acc, s) => acc + s.durationSeconds, 0);
  },

  resetTimerStore: () => {
    const { _intervalId } = get();
    if (_intervalId) clearInterval(_intervalId);
    set({
      activeHabitId: null,
      elapsedSeconds: 0,
      isRunning: false,
      isPaused: false,
      sessions: [],
      _intervalId: null,
    });
  },
}));
