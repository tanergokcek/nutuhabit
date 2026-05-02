import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '@/src/i18n/translations';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  resetLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'tr',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set({ language: get().language === 'tr' ? 'en' : 'tr' }),
      resetLanguage: () => set({ language: 'tr' }),
    }),
    {
      name: 'nutuhabit-language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
