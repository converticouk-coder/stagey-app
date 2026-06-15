// ============================================================
// STAGEY MOBILE — PLACEHOLDER SCREEN
// Every route in the scaffold renders one of these until the real
// screen is built. Screen NAMES (registered in navigation) match
// types/index.ts exactly and must not be renamed.
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { TextStyles, Spacing, TAB_BAR_HEIGHT } from '../constants';

export function PlaceholderScreen({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + Spacing.xxl },
        ]}
      >
        <Text
          testID="text-screen-title"
          style={[TextStyles.h1, styles.title, { color: colors.foreground }]}
        >
          {title}
        </Text>
        <Text
          testID="text-screen-subtitle"
          style={[
            TextStyles.body,
            styles.subtitle,
            { color: colors.mutedForeground },
          ]}
        >
          {subtitle ?? 'This screen is a placeholder in the mobile scaffold.'}
        </Text>
      </ScrollView>
    </View>
  );
}

/** Factory that binds a title to a placeholder for navigator registration. */
export function makePlaceholder(title: string, subtitle?: string) {
  return function Placeholder() {
    return <PlaceholderScreen title={title} subtitle={subtitle} />;
  };
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.screenPadding,
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: Spacing.sm, maxWidth: 320 },
});
