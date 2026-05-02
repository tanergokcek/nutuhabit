export interface ThemeTokens {
  dark: boolean;
  statusBar: 'light-content' | 'dark-content';
  blurTint: 'dark' | 'light';
  screenBg: string;
  gradBg: readonly [string, string, string, string];
  orb1: readonly [string, string];
  orb2: readonly [string, string];
  cardGrad: readonly [string, string];
  cardBorder: string;
  cardShadow: string;
  glassOverlay: string;
  specular: string;
  t1: string;
  t2: string;
  t3: string;
  tLabel: string;
  tAccent: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  divider: string;
  tabBg: string;
  tabBorder: string;
  tabActive: string;
  tabInactive: string;
  rowBg: string;
  rowBorder: string;
  panelBg: string;
  panelBorder: string;
}

export const darkTokens: ThemeTokens = {
  dark: true,
  statusBar: 'light-content',
  blurTint: 'dark',
  screenBg: '#0e0428',
  gradBg: ['#0e0428', '#180840', '#0d1040', '#060318'],
  orb1: ['rgba(120,40,220,0.70)', 'transparent'],
  orb2: ['rgba(200,50,200,0.45)', 'transparent'],
  cardGrad: ['rgba(30,15,80,0.70)', 'rgba(10,5,40,0.65)'],
  cardBorder: 'rgba(168,85,247,0.22)',
  cardShadow: '#3d0f8f',
  glassOverlay: 'rgba(255,255,255,0.05)',
  specular: 'rgba(255,255,255,0.18)',
  t1: 'rgba(255,255,255,0.95)',
  t2: 'rgba(255,255,255,0.60)',
  t3: 'rgba(255,255,255,0.35)',
  tLabel: 'rgba(192,132,252,0.80)',
  tAccent: 'rgba(192,132,252,0.65)',
  inputBg: 'rgba(255,255,255,0.08)',
  inputBorder: 'rgba(192,132,252,0.35)',
  inputText: 'rgba(255,255,255,0.92)',
  inputPlaceholder: 'rgba(192,132,252,0.35)',
  divider: 'rgba(255,255,255,0.12)',
  tabBg: 'rgba(18,12,48,0.92)',
  tabBorder: 'rgba(255,255,255,0.10)',
  tabActive: 'rgba(255,255,255,0.95)',
  tabInactive: 'rgba(255,255,255,0.35)',
  rowBg: 'rgba(255,255,255,0.07)',
  rowBorder: 'rgba(255,255,255,0.09)',
  panelBg: 'rgba(255,255,255,0.06)',
  panelBorder: 'rgba(255,255,255,0.09)',
};

export const lightTokens: ThemeTokens = {
  dark: false,
  statusBar: 'dark-content',
  blurTint: 'light',

  // Arka plan — derin lavanta, gradient derinlik
  screenBg: '#C8B8FF',
  gradBg: ['#BBA8FF', '#D4C2FF', '#C0CAFF', '#DACFFF'],

  // Orblar — güçlü derin mor, ışık kaynağı etkisi
  orb1: ['rgba(99,34,210,0.60)', 'transparent'],
  orb2: ['rgba(155,100,255,0.42)', 'transparent'],

  // Kartlar — liquid glass: mor tonlu buzlu cam
  cardGrad: ['rgba(255,255,255,0.72)', 'rgba(222,208,255,0.55)'],
  cardBorder: 'rgba(109,40,217,0.50)',
  cardShadow: '#5b21b6',
  glassOverlay: 'rgba(139,92,246,0.08)',   // hafif mor tint — saf beyaz değil
  specular: 'rgba(255,255,255,0.85)',

  // Metin — koyu mor, yüksek kontrast
  t1: '#0D0030',                             // birincil — çok koyu mor-siyah
  t2: '#4C1D95',                             // ikincil — derin mor
  t3: 'rgba(76,29,149,0.68)',               // soluk / yardımcı
  tLabel: '#6D28D9',                         // etiketler
  tAccent: '#7C3AED',                        // vurgu

  // Input — cam efektli
  inputBg: 'rgba(109,40,217,0.11)',
  inputBorder: 'rgba(109,40,217,0.42)',
  inputText: '#0D0030',
  inputPlaceholder: 'rgba(109,40,217,0.48)',

  // Ayırıcı / sıralar — mor tonlu
  divider: 'rgba(109,40,217,0.20)',
  rowBg: 'rgba(139,92,246,0.13)',
  rowBorder: 'rgba(109,40,217,0.22)',

  // Panel — buzlu lavanta cam
  panelBg: 'rgba(240,234,255,0.86)',
  panelBorder: 'rgba(109,40,217,0.28)',

  // Tab bar — buzlu cam
  tabBg: 'rgba(248,244,255,0.93)',
  tabBorder: 'rgba(109,40,217,0.24)',
  tabActive: '#5b21b6',
  tabInactive: 'rgba(109,40,217,0.38)',
};
