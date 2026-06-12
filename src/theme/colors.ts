// Blink Box — Brand Color Tokens
// Design System: "Hyperlocal Velocity" — Be Vietnam Pro + Orange #FF6B00

export const Colors = {
  // ─── Brand Primary ───────────────────────────────────────────
  primary: '#FF6B00',
  primaryDark: '#A04100',
  primaryDarker: '#572000',
  primaryLight: '#FFB693',
  primaryLighter: '#FFDBCC',
  primaryContainer: '#FFF1EB',

  // ─── Success / Fresh Green ────────────────────────────────────
  success: '#00B050',
  successDark: '#006E2F',
  successLight: '#6BFF8F',
  successContainer: '#E8F5E9',

  // ─── Error ───────────────────────────────────────────────────
  error: '#BA1A1A',
  errorDark: '#93000A',
  errorContainer: '#FFDAD6',

  // ─── Warning ─────────────────────────────────────────────────
  warning: '#F59E0B',
  warningContainer: '#FEF3C7',

  // ─── Backgrounds (Light — Customer App) ──────────────────────
  background: '#FFF8F6',
  surface: '#FFFFFF',
  surfaceElevated: '#FFF1EB',
  surfaceVariant: '#F8DDD2',
  surfaceContainer: '#FFEAE1',
  surfaceContainerHigh: '#FEE3D8',

  // ─── Text (Light) ─────────────────────────────────────────────
  textPrimary: '#261812',
  textSecondary: '#5A4136',
  textMuted: '#8E7164',
  textPlaceholder: '#B5A09A',
  textInverse: '#FFEDE6',

  // ─── Borders ─────────────────────────────────────────────────
  border: '#E2BFB0',
  borderLight: '#F0DDD5',

  // ─── Dark Theme (Rider App) ───────────────────────────────────
  dark: {
    background: '#0C0908',
    surface: '#1A1210',
    surfaceElevated: '#2A1F1A',
    card: 'rgba(255,255,255,0.05)',
    cardHover: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.08)',
    borderLight: 'rgba(255,255,255,0.04)',
    text: '#FFEDE6',
    textSecondary: '#B5A09A',
    textMuted: '#8E7164',
  },

  // ─── Category Colors ─────────────────────────────────────────
  category: {
    grocery: '#FFF3E0',
    fruits: '#FCE4EC',
    vegetables: '#E8F5E9',
    dairy: '#E3F2FD',
    medicines: '#EDE7F6',
    snacks: '#FFF8E1',
    beverages: '#E0F7FA',
    electronics: '#F3E5F5',
    stationery: '#E8EAF6',
    personalCare: '#FBE9E7',
  },

  // ─── Semantic ────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // ─── Order Status ─────────────────────────────────────────────
  statusPending: '#F59E0B',
  statusConfirmed: '#3B82F6',
  statusPreparing: '#8B5CF6',
  statusOutForDelivery: '#FF6B00',
  statusDelivered: '#00B050',
  statusCancelled: '#BA1A1A',
} as const;

export type ColorKey = keyof typeof Colors;
