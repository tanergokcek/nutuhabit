import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/src/types/user';

const MOCK_USER: User = {
  id: 'mock-user-001',
  email: 'kullanici@nutuhabit.com',
  displayName: 'Ahmet',
  photoURL: null,
  isPremium: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  settings: {
    theme: 'system',
    notificationsEnabled: true,
    reminderTime: '09:00',
    weekStartsOn: 1,
    language: 'tr',
  },
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;

  // Actions
  signIn: (provider: 'google' | 'apple') => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
  setUser: (user: User | null, isAuthenticated: boolean) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: false,

      signIn: async (_provider: 'google' | 'apple') => {
        set({ isLoading: true });
        // TODO: connect real auth provider
        await new Promise((resolve) => setTimeout(resolve, 800));
        set({ user: MOCK_USER, isAuthenticated: true, isGuest: false, isLoading: false });
      },

      signInWithEmail: async (_email: string, _password: string) => {
        set({ isLoading: true });
        // TODO: connect real email/password auth
        await new Promise((resolve) => setTimeout(resolve, 800));
        set({ user: MOCK_USER, isAuthenticated: true, isGuest: false, isLoading: false });
      },

      continueAsGuest: () => {
        set({ user: null, isAuthenticated: true, isGuest: true });
      },

      signOut: async () => {
        // 1. Firebase Sign Out
        try {
          const { auth } = await import('@/src/firebaseConfig');
          await auth.signOut();
        } catch (error) {
          console.error("Firebase signOut error:", error);
        }

        // 2. Diğer bütün store'ları sıfırla (Bellek içi state temizliği)
        // Dinamik importlar ile döngüsel bağımlılıkları önlüyoruz
        const { useHabitStore } = await import('./useHabitStore');
        const { useTodoStore } = await import('./useTodoStore');
        const { useTimerStore } = await import('./useTimerStore');
        const { useLanguageStore } = await import('./useLanguageStore');
        const { useThemeStore } = await import('./useThemeStore');

        useHabitStore.getState().resetHabits();
        useTodoStore.getState().resetTodos();
        useTimerStore.getState().resetTimerStore();
        useLanguageStore.getState().resetLanguage();
        useThemeStore.getState().resetTheme();

        // 3. AsyncStorage'ı temizle (Kalıcı verileri sil)
        await AsyncStorage.clear();

        // 4. Auth state'ini sıfırla
        set({ user: null, isAuthenticated: false, isGuest: false });
      },

      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
      setUser: async (user, isAuthenticated) => {
        if (user && isAuthenticated) {
          // Giriş yapılıyorsa — önce eski kullanıcının verilerini temizle
          const { useHabitStore } = await import('./useHabitStore');
          const { useTodoStore } = await import('./useTodoStore');
          const { useTimerStore } = await import('./useTimerStore');
          const { useLanguageStore } = await import('./useLanguageStore');
          const { useThemeStore } = await import('./useThemeStore');

          useHabitStore.getState().resetHabits();
          useTodoStore.getState().resetTodos();
          useTimerStore.getState().resetTimerStore();
          useLanguageStore.getState().resetLanguage();
          useThemeStore.getState().resetTheme();

          // AsyncStorage'daki eski persist verilerini sil
          await AsyncStorage.multiRemove([
            'nutuhabit-auth-storage',
            'nutuhabit-language-storage',
            'nutuhabit-theme-storage',
          ]);
        }
        set({ user, isAuthenticated, isGuest: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'nutuhabit-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
      }),
    }
  )
);
