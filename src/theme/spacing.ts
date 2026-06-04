// Spacing scale — base unit: 4px
export const Spacing = {
  unit: 4,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,    // Standard container padding
  xl: 20,
  xxl: 24,   // Section margin
  xxxl: 32,
  huge: 40,
  giant: 48,
  gutter: 12,
};

// Border Radius
export const Radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,   // Product cards — friendly premium look
  button: 14,// Distinguishes interactive elements
  card: 20,
  full: 9999,// Pills, chips, avatar
};

// Elevation Shadows
import { Platform } from 'react-native';

export const Shadows = {
  none: {},
  xs: Platform.select({
    ios: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
    },
    android: { elevation: 1 },
    default: {},
  }),
  sm: Platform.select({
    ios: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.10,
      shadowRadius: 20,
    },
    android: { elevation: 8 },
    default: {},
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.14,
      shadowRadius: 28,
    },
    android: { elevation: 12 },
    default: {},
  }),
  // Orange glow — for primary CTA buttons
  primaryGlow: Platform.select({
    ios: {
      shadowColor: '#FF6B00',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: {},
  }),
  // Green glow — for online status / success
  successGlow: Platform.select({
    ios: {
      shadowColor: '#00B050',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
};

// Z-index layers
export const ZIndex = {
  base: 0,
  card: 1,
  sticky: 10,
  header: 50,
  modal: 100,
  toast: 200,
  overlay: 300,
};
