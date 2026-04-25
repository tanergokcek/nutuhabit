import { useThemeStore } from '@/src/store/useThemeStore';
import { darkTokens, lightTokens, ThemeTokens } from '@/src/theme/tokens';

export function useAppTheme(): ThemeTokens {
  const theme = useThemeStore((s) => s.theme);
  return theme === 'dark' ? darkTokens : lightTokens;
}

export type { ThemeTokens };
