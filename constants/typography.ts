// ============================================================
// STAGEY MOBILE — DESIGN SYSTEM: TYPOGRAPHY
// Drop this file into: constants/typography.ts
//
// Install fonts:
//   npx expo install @expo-google-fonts/dm-sans @expo-google-fonts/outfit
//   npx expo install expo-font
//
// In _layout.tsx or App.tsx:
//   import { useFonts } from 'expo-font';
//   import { DM_Sans_400Regular, DM_Sans_500Medium, DM_Sans_600SemiBold, DM_Sans_700Bold } from '@expo-google-fonts/dm-sans';
//   import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
// ============================================================

export const FontFamily = {
  // DM Sans — body text, UI, labels, metadata, buttons, descriptions
  sans: {
    regular: 'DM_Sans_400Regular',
    medium: 'DM_Sans_500Medium',
    semiBold: 'DM_Sans_600SemiBold',
    bold: 'DM_Sans_700Bold',
  },
  // Outfit — headings, screen titles, section headers, card titles, hero text
  heading: {
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semiBold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
  },
} as const;

// Use these font map keys with expo-font's useFonts()
export const FontMap = {
  DM_Sans_400Regular: require('@expo-google-fonts/dm-sans').DM_Sans_400Regular,
  DM_Sans_500Medium: require('@expo-google-fonts/dm-sans').DM_Sans_500Medium,
  DM_Sans_600SemiBold: require('@expo-google-fonts/dm-sans').DM_Sans_600SemiBold,
  DM_Sans_700Bold: require('@expo-google-fonts/dm-sans').DM_Sans_700Bold,
  Outfit_400Regular: require('@expo-google-fonts/outfit').Outfit_400Regular,
  Outfit_500Medium: require('@expo-google-fonts/outfit').Outfit_500Medium,
  Outfit_600SemiBold: require('@expo-google-fonts/outfit').Outfit_600SemiBold,
  Outfit_700Bold: require('@expo-google-fonts/outfit').Outfit_700Bold,
};

// Text style presets — import and spread these into StyleSheet styles
export const TextStyles = {
  // ── Headings (Outfit) ──
  h1: {
    fontFamily: FontFamily.heading.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: FontFamily.heading.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: FontFamily.heading.semiBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  h4: {
    fontFamily: FontFamily.heading.semiBold,
    fontSize: 17,
    lineHeight: 22,
  },
  h5: {
    fontFamily: FontFamily.heading.medium,
    fontSize: 15,
    lineHeight: 20,
  },
  // ── Body (DM Sans) ──
  bodyLarge: {
    fontFamily: FontFamily.sans.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: FontFamily.sans.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: FontFamily.sans.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  // ── UI Elements ──
  label: {
    fontFamily: FontFamily.sans.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  labelSmall: {
    fontFamily: FontFamily.sans.medium,
    fontSize: 11,
    lineHeight: 16,
  },
  button: {
    fontFamily: FontFamily.sans.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonSmall: {
    fontFamily: FontFamily.sans.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    fontFamily: FontFamily.sans.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  caption: {
    fontFamily: FontFamily.sans.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  // ── Special ──
  tabLabel: {
    fontFamily: FontFamily.sans.medium,
    fontSize: 10,
    lineHeight: 12,
  },
  sectionHeader: {
    fontFamily: FontFamily.heading.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  cardTitle: {
    fontFamily: FontFamily.heading.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  heroTitle: {
    fontFamily: FontFamily.heading.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  metaText: {
    fontFamily: FontFamily.sans.regular,
    fontSize: 12,
    lineHeight: 16,
  },
} as const;
