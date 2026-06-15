// ============================================================
// STAGEY MOBILE — DESIGN SYSTEM: COLOURS
// Drop this file into: constants/colors.ts
// ============================================================

export const Colors = {
  dark: {
    background: '#0A0A0F',
    foreground: '#FAFAFA',
    card: '#0F0F17',
    cardForeground: '#FAFAFA',
    popover: '#0F0F17',
    popoverForeground: '#FAFAFA',
    primary: '#8B5CF6',
    primaryForeground: '#FFFFFF',
    secondary: '#27272A',
    secondaryForeground: '#FAFAFA',
    muted: '#27272A',
    mutedForeground: '#A1A1AA',
    accent: '#27272A',
    accentForeground: '#FAFAFA',
    border: '#27272A',
    input: '#1C1C22',
    ring: '#D4D4D8',
    destructive: '#EF4444',
    destructiveForeground: '#FAFAFA',
    success: '#22C55E',
    successForeground: '#FFFFFF',
    warning: '#F59E0B',
    warningForeground: '#FFFFFF',
  },
  light: {
    background: '#FAFAFA',
    foreground: '#0A0A0F',
    card: '#FFFFFF',
    cardForeground: '#0A0A0F',
    popover: '#FFFFFF',
    popoverForeground: '#0A0A0F',
    primary: '#8B5CF6',
    primaryForeground: '#FFFFFF',
    secondary: '#F3EFFE',
    secondaryForeground: '#5B21B6',
    muted: '#F4F4F5',
    mutedForeground: '#71717A',
    accent: '#F3EFFE',
    accentForeground: '#8B5CF6',
    border: '#E4E4E7',
    input: '#E4E4E7',
    ring: '#8B5CF6',
    destructive: '#EF4444',
    destructiveForeground: '#FAFAFA',
    success: '#22C55E',
    successForeground: '#FFFFFF',
    warning: '#F59E0B',
    warningForeground: '#FFFFFF',
  },
  brand: {
    purple: '#8B47EB',
    purpleLight: '#A78BFA',
    blue: '#1269CF',
    gold: '#F59E0B',
    pink: '#EC4899',
    coral: '#F97316',
    teal: '#14B8A6',
    gradient: {
      start: '#8B5CF6',
      mid: '#A855F7',
      end: '#EC4899',
    },
  },
  // Category/badge colours used consistently across the app
  category: {
    costume: '#8B5CF6',
    props: '#F59E0B',
    staging: '#14B8A6',
    sound: '#3B82F6',
    lighting: '#F97316',
    other: '#71717A',
    lead: '#EAB308',
    supporting: '#3B82F6',
    ensemble: '#6B7280',
    featuredEnsemble: '#8B5CF6',
    easy: '#22C55E',
    medium: '#F59E0B',
    hard: '#EF4444',
  },
  // Transparent overlays
  overlay: {
    dark: 'rgba(0,0,0,0.5)',
    darker: 'rgba(0,0,0,0.7)',
    light: 'rgba(255,255,255,0.1)',
    primary: 'rgba(139,92,246,0.15)',
    primaryStrong: 'rgba(139,92,246,0.3)',
  },
  // Static (same in both modes)
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// The gradient used on: hero headings, FAB, CTA buttons, premium badges
export const PrimaryGradient = {
  colors: ['#8B5CF6', '#A855F7', '#EC4899'] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
};

export const PrimaryGradientVertical = {
  colors: ['#8B5CF6', '#A855F7', '#EC4899'] as const,
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
};

// Avatar fallback gradient (purple → pink) for users without profile photos
export const AvatarGradient = {
  colors: ['#8B5CF6', '#EC4899'] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

// Announcement banner colours by type
export const BannerColors = {
  info: { bg: '#1E3A5F', border: '#3B82F6', text: '#BFDBFE' },
  warning: { bg: '#451A03', border: '#F59E0B', text: '#FDE68A' },
  success: { bg: '#052E16', border: '#22C55E', text: '#BBF7D0' },
  announcement: { bg: '#2D1B69', border: '#8B5CF6', text: '#DDD6FE' },
  error: { bg: '#450A0A', border: '#EF4444', text: '#FECACA' },
} as const;

export type ColorScheme = 'dark' | 'light';
export type ThemeColors = typeof Colors.dark;
