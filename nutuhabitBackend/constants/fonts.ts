/**
 * fonts.ts — Bridge to the iOS HIG typography system.
 *
 * Sizes and weights are sourced from constants/typography.ts so every
 * component that imports FONTS automatically uses the HIG-calibrated values.
 *
 * Direct textStyle presets → import { textStyles } from '@/constants/typography'
 */
import { fontSizes, fontWeights } from './typography';

export const FONTS = {
  family: {
    serif: 'InriaSerif',
    serifBold: 'InriaSerif-Bold',
    serifItalic: 'InriaSerif-Italic',
    systemSerif: 'Georgia',
    systemSans: 'System',
  },
  // Mapped to iOS HIG text style sizes (body = 17pt anchor)
  size: {
    xs:    fontSizes.caption2,    // 11 — caption2
    sm:    fontSizes.footnote,    // 13 — footnote
    md:    fontSizes.subhead,     // 15 — subhead
    lg:    fontSizes.body,        // 17 — body / headline
    xl:    fontSizes.title3,      // 20 — title3
    '2xl': fontSizes.title2,      // 22 — title2
    '3xl': fontSizes.title1,      // 28 — title1
    '4xl': fontSizes.largeTitle,  // 34 — largeTitle
    '5xl': 48,                    // beyond HIG scale — display hero only
  },
  // Identical values as before; re-exported from typography for consistency
  weight: {
    regular:  fontWeights.regular,
    medium:   fontWeights.medium,
    semibold: fontWeights.semibold,
    bold:     fontWeights.bold,
  },
  // Relative line-height multipliers (use absolute lineHeights from typography for new code)
  lineHeight: {
    tight:   1.2,
    normal:  1.4,   // ≈ HIG body leading (17 × 1.41 = 24pt)
    relaxed: 1.75,
  },
};
