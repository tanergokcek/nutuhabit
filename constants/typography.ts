/**
 * typography.ts
 *
 * iOS-native typography system for React Native — NutuHabit
 * Based on Apple Human Interface Guidelines (HIG) — iOS 17
 *
 * Font rendering:
 *   iOS     → San Francisco (SF Pro Text < 20pt, SF Pro Display ≥ 20pt)
 *              Automatic optical size selection by iOS; we never hardcode
 *              "SF Pro" as Apple forbids it and it won't resolve on device.
 *   Android → Roboto (system default, undefined = auto)
 *
 * Size anchor: body = 17pt  (HIG baseline, iOS Settings/Notes/Reminders)
 * Weights used: regular(400) · medium(500) · semibold(600) · bold(700)
 *   — "Use a single typeface and a limited number of weights." (HIG)
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/typography
 * @see https://developer.apple.com/fonts/
 */

import { Platform, TextStyle } from 'react-native';

// Custom font mapping for Inria Serif
const getFontFamily = (weight?: TextStyle['fontWeight']) => {
  switch (weight) {
    case '300':
      return 'InriaSerif_300Light';
    case '600':
    case '700':
    case 'bold':
      return 'InriaSerif_700Bold';
    case '400':
    default:
      return 'InriaSerif_400Regular';
  }
};

// ─── System Font ──────────────────────────────────────────────────────────────
// Omitting fontFamily (undefined) triggers React Native's system font:
//   iOS     → SF Pro  (Text/Display auto-selected by size threshold at 20pt)
//   Android → Roboto
// Keep Platform.select for explicit intent + easy future override.
const SYSTEM_FONT = Platform.select<string | undefined>({
  ios: 'InriaSerif',
  android: 'InriaSerif',
  default: 'InriaSerif',
});

// ─── Font Weights ─────────────────────────────────────────────────────────────
// HIG: "Use a limited number of weights."
// These four cover all practical iOS UI needs without visual noise.
export const fontWeights = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

export type FontWeight = keyof typeof fontWeights;

// ─── Font Sizes ───────────────────────────────────────────────────────────────
// iOS 17 HIG text style defaults — "Large" Dynamic Type category baseline.
// < 20pt → SF Pro Text optical variant   (screen text, reading, UI)
// ≥ 20pt → SF Pro Display optical variant (headings, titles, hero)
// The switch is automatic; we just define sizes.
export const fontSizes = {
  largeTitle: 34,  // Hero headings, onboarding, modal titles
  title1:     28,  // Primary screen titles (NavigationBar large title)
  title2:     22,  // Section headers
  title3:     20,  // Sub-section headers                ← SF Display threshold
  headline:   17,  // Row/item headlines — semibold per HIG convention
  body:       17,  // Primary reading text — HIG body anchor
  callout:    16,  // Callouts, highlighted supporting text
  subhead:    15,  // Secondary descriptive text
  footnote:   13,  // Meta info, supplementary notes
  caption1:   12,  // Image captions, chip labels
  caption2:   11,  // Minimum legible (HIG min = 11pt), timestamps
} as const;

export type FontSizeKey = keyof typeof fontSizes;

// ─── Line Heights ─────────────────────────────────────────────────────────────
// Matching UIKit/SwiftUI default line-heights as closely as possible.
// Body ~1.41× (comfortable sustained reading), display sizes tighter ~1.2–1.27×.
export const lineHeights = {
  largeTitle: 41,  // 34 × 1.21 — tight, display context
  title1:     34,  // 28 × 1.21
  title2:     28,  // 22 × 1.27
  title3:     25,  // 20 × 1.25
  headline:   22,  // 17 × 1.29
  body:       24,  // 17 × 1.41 — HIG comfortable reading rhythm
  callout:    21,  // 16 × 1.31
  subhead:    20,  // 15 × 1.33
  footnote:   18,  // 13 × 1.38
  caption1:   16,  // 12 × 1.33
  caption2:   13,  // 11 × 1.18 — acceptable tight at minimum size
} as const;

// ─── Letter Spacing (Tracking) ────────────────────────────────────────────────
// SF Pro's optical tracking table published by Apple (values in pt = RN units on iOS).
// Text sizes (< 20pt): negative tracking tightens rhythm
// Display sizes (≥ 20pt): positive tracking opens up large glyphs
// Source: https://developer.apple.com/fonts/ → "SF Font Tracking" reference
export const letterSpacings = {
  largeTitle:  0.37,
  title1:      0.36,
  title2:      0.35,
  title3:      0.45,
  headline:   -0.43,
  body:       -0.43,
  callout:    -0.32,
  subhead:    -0.24,
  footnote:   -0.08,
  caption1:    0.00,
  caption2:    0.07,
} as const;

// ─── Semantic Text Colors ─────────────────────────────────────────────────────
// Dark-mode optimised — designed for NutuHabit's deep-purple dark backgrounds.
// Maps to iOS semantic label hierarchy (label / secondaryLabel / tertiaryLabel).
export const textColors = {
  primary:    'rgba(255,255,255,0.95)',  // label           — main content
  secondary:  'rgba(255,255,255,0.60)',  // secondaryLabel  — supporting info
  tertiary:   'rgba(255,255,255,0.35)',  // tertiaryLabel   — placeholders, hints
  quaternary: 'rgba(255,255,255,0.18)',  // quaternaryLabel — decorative only
  tint:       '#A78BFA',                 // brand purple (primary.400) — interactive
  destructive:'#FF453A',                 // iOS 17 dark-mode red
  disabled:   'rgba(255,255,255,0.28)', // non-interactive state
} as const;

export type TextColor = keyof typeof textColors;

// ─── Base Style Factory ───────────────────────────────────────────────────────
// Internal helper — constructs a full TextStyle from a size key + weight.
const make = (
  key: FontSizeKey,
  weight: TextStyle['fontWeight'],
  extra?: Partial<TextStyle>,
): TextStyle => ({
  fontFamily:    getFontFamily(weight),
  fontSize:      fontSizes[key],
  lineHeight:    lineHeights[key],
  letterSpacing: letterSpacings[key],
  fontWeight:    weight,
  ...extra,
});

// ─── Text Style Presets ───────────────────────────────────────────────────────
// Ready-to-spread TextStyle objects — mirrors iOS text style catalogue.
// Variants are named [style][Weight] for clarity.
//
// Usage:  <Text style={textStyles.body}>...</Text>
//         <Text style={[textStyles.body, { color: textColors.secondary }]}>...</Text>
export const textStyles = {

  // ── Display (SF Pro Display, ≥ 20pt) ───────────────────────────────────────
  largeTitle:         make('largeTitle', fontWeights.regular),
  largeTitleBold:     make('largeTitle', fontWeights.bold),

  title1:             make('title1', fontWeights.regular),
  title1Bold:         make('title1', fontWeights.bold),

  title2:             make('title2', fontWeights.regular),
  title2Bold:         make('title2', fontWeights.bold),

  title3:             make('title3', fontWeights.regular),
  title3Semibold:     make('title3', fontWeights.semibold),

  // ── Text (SF Pro Text, < 20pt) ─────────────────────────────────────────────
  // HIG: headline is ALWAYS semibold — never alter this convention.
  headline:           make('headline', fontWeights.semibold),

  body:               make('body', fontWeights.regular),
  bodyMedium:         make('body', fontWeights.medium),
  bodySemibold:       make('body', fontWeights.semibold),
  bodyBold:           make('body', fontWeights.bold),

  callout:            make('callout', fontWeights.regular),
  calloutMedium:      make('callout', fontWeights.medium),
  calloutSemibold:    make('callout', fontWeights.semibold),

  subhead:            make('subhead', fontWeights.regular),
  subheadSemibold:    make('subhead', fontWeights.semibold),

  // ── Small ──────────────────────────────────────────────────────────────────
  footnote:           make('footnote', fontWeights.regular),
  footnoteMedium:     make('footnote', fontWeights.medium),
  footnoteSemibold:   make('footnote', fontWeights.semibold),
  footnoteBold:       make('footnote', fontWeights.bold),

  caption1:           make('caption1', fontWeights.regular),
  caption1Medium:     make('caption1', fontWeights.medium),
  caption1Semibold:   make('caption1', fontWeights.semibold),

  caption2:           make('caption2', fontWeights.regular),
  caption2Medium:     make('caption2', fontWeights.medium),
  caption2Semibold:   make('caption2', fontWeights.semibold),
  caption2Bold:       make('caption2', fontWeights.bold),

} as const satisfies Record<string, TextStyle>;

export type TextStyleKey = keyof typeof textStyles;

// ─── Utility: createTextStyle ─────────────────────────────────────────────────
// Merge a preset with targeted overrides without repeating base properties.
// Keeps components clean and type-safe.
//
// @example
//   createTextStyle('body', { color: textColors.secondary, textAlign: 'center' })
export function createTextStyle(
  base: TextStyleKey,
  overrides?: Partial<TextStyle>,
): TextStyle {
  return { ...textStyles[base], ...overrides };
}

// ─── Dynamic Type Scaling (optional) ─────────────────────────────────────────
// Multiply font sizes by a user-controlled scale factor.
// Plug into your ThemeStore or AccessibilityStore if needed.
// Default scale = 1.0 (no scaling).
//
// @example
//   const scaledBody = scaledTextStyle('body', 1.2); // 20.4pt
export function scaledTextStyle(
  base: TextStyleKey,
  scale: number,
): TextStyle {
  const style = textStyles[base];
  return {
    ...style,
    fontSize:   (style.fontSize   ?? 17) * scale,
    lineHeight: (style.lineHeight ?? 24) * scale,
  };
}

// ─── Default Export ───────────────────────────────────────────────────────────
const Typography = {
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacings,
  textStyles,
  textColors,
  createTextStyle,
  scaledTextStyle,
} as const;

export default Typography;
