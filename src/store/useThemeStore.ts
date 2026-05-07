import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';
type HomeLayoutMode = 'stacked' | 'tabs';

interface ThemeState {
  theme: ThemeMode;
  homeLayout: HomeLayoutMode;
  isPremium: boolean;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleHomeLayout: () => void;
  setHomeLayout: (layout: HomeLayoutMode) => void;
  setPremium: (value: boolean) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      homeLayout: 'tabs',
      isPremium: false,

      toggleTheme: () => {
        const { theme } = get();
        set({ theme: theme === 'light' ? 'dark' : 'light' });
      },

      setTheme: (theme: ThemeMode) => {
        set({ theme });
      },

      toggleHomeLayout: () => {
        const { homeLayout } = get();
        set({ homeLayout: homeLayout === 'stacked' ? 'tabs' : 'stacked' });
      },

      setHomeLayout: (homeLayout: HomeLayoutMode) => {
        set({ homeLayout });
      },

      setPremium: (value: boolean) => {
        set({ isPremium: value });
      },

      resetTheme: () => {
        set({ theme: 'dark', homeLayout: 'tabs', isPremium: false });
      },
    }),
    {
      name: 'nutuhabit-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
