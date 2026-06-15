// ============================================================
// STAGEY MOBILE — DESIGN SYSTEM: SPACING, RADIUS, SHADOWS
// Drop this file into: constants/spacing.ts
// ============================================================
import { Platform } from 'react-native';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  screenPadding: 16,    // horizontal padding on all screens
  cardPadding: 16,      // padding inside cards
  sectionGap: 24,       // vertical gap between page sections
  itemGap: 12,          // vertical gap between list items
  inlineGap: 8,         // horizontal gap between inline elements
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,   // primary card radius
  xl: 20,   // modals, bottom sheets
  xxl: 24,
  full: 9999, // pills, avatars, FAB
} as const;

// Avatar sizes
export const AvatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
  xxl: 96,
} as const;

// Icon sizes (used with lucide-react-native)
export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Shadows — use spread syntax in StyleSheet: ...Shadows.card
export const Shadows = {
  none: {},
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
    },
    android: { elevation: 6 },
  }),
  // Purple shadow for FAB and primary buttons
  primary: Platform.select({
    ios: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
    android: { elevation: 12 },
  }),
} as const;

// Tab bar height (add safe area bottom inset on top of this)
export const TAB_BAR_HEIGHT = 64;
// Header height
export const HEADER_HEIGHT = 56;
// FAB size (the "+" create button in the tab bar)
export const FAB_SIZE = 52;
