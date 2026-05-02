import { useLanguageStore } from '@/src/store/useLanguageStore';
import { tr, en, Translations } from '@/src/i18n/translations';

export function useTranslation(): Translations {
  const language = useLanguageStore((s) => s.language);
  return language === 'tr' ? tr : en;
}

export type { Translations };
