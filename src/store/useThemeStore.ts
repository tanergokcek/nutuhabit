import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  isPremium: boolean;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setPremium: (value: boolean) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      isPremium: false,

      toggleTheme: () => {
        const { theme } = get();
        set({ theme: theme === 'light' ? 'dark' : 'light' });
      },

      setTheme: (theme: ThemeMode) => {
        set({ theme });
      },

      setPremium: (value: boolean) => {
        set({ isPremium: value });
      },

      resetTheme: () => {
        set({ theme: 'dark', isPremium: false });
      },
    }),
    {
      name: 'nutuhabit-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
