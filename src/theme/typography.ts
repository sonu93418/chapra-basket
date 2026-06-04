import { Platform } from 'react-native';

export const FontFamily = {
  regular: 'BeVietnamPro-Regular',
  medium: 'BeVietnamPro-Medium',
  semiBold: 'BeVietnamPro-SemiBold',
  bold: 'BeVietnamPro-Bold',
  extraBold: 'BeVietnamPro-ExtraBold',
};

export const FontSize = {
  micro: 10,
  labelBold: 12,
  bodySm: 14,
  bodyLg: 16,
  h3: 20,
  h2: 24,
  h1Mobile: 26,
  h1: 32,
  display: 40,
};

export const LineHeight = {
  micro: 14,
  labelBold: 16,
  bodySm: 20,
  bodyLg: 24,
  h3: 28,
  h2: 32,
  h1Mobile: 32,
  h1: 40,
  display: 48,
};

export const LetterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

// Pre-composed text style presets
export const TextStyles = {
  display: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.display,
    lineHeight: LineHeight.display,
    letterSpacing: LetterSpacing.tighter,
  },
  h1: {
    fontFamily: FontFamily.bold,
    fontSize: Platform.OS === 'web' ? FontSize.h1 : FontSize.h1Mobile,
    lineHeight: LineHeight.h1Mobile,
    letterSpacing: LetterSpacing.tight,
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.h2,
    lineHeight: LineHeight.h2,
    letterSpacing: LetterSpacing.tight,
  },
  h3: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.h3,
    lineHeight: LineHeight.h3,
    letterSpacing: LetterSpacing.normal,
  },
  bodyLg: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.bodyLg,
    lineHeight: LineHeight.bodyLg,
  },
  bodyLgSemiBold: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.bodyLg,
    lineHeight: LineHeight.bodyLg,
  },
  bodySm: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.bodySm,
    lineHeight: LineHeight.bodySm,
  },
  bodySmSemiBold: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.bodySm,
    lineHeight: LineHeight.bodySm,
  },
  labelBold: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.labelBold,
    lineHeight: LineHeight.labelBold,
    letterSpacing: LetterSpacing.wide,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.labelBold,
    lineHeight: LineHeight.labelBold,
  },
  micro: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.micro,
    lineHeight: LineHeight.micro,
  },
  price: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.bodyLg,
    lineHeight: LineHeight.bodyLg,
  },
  priceHero: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.h1Mobile,
    lineHeight: LineHeight.h1Mobile,
  },
};
