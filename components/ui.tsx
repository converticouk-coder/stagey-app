// ============================================================
// STAGEY MOBILE — SHARED UI PRIMITIVES
// Reusable building blocks used across the discovery screens:
// screen container, loading / empty / error states, badges,
// chips, section headers, cards and small formatting helpers.
// ============================================================
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, Inbox } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { TextStyles, Spacing, Radius, TAB_BAR_HEIGHT } from '../constants';

// ── Screen container ──────────────────────────────────────────
export function Screen({
  children,
  style,
  padded,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.background },
        padded && { paddingHorizontal: Spacing.screenPadding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Bottom padding so content clears the tab bar + safe area. */
export function useListBottomPadding() {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR_HEIGHT + Spacing.xxl;
}

// ── Loading ───────────────────────────────────────────────────
export function LoadingState({ label }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.centre} testID="state-loading">
      <ActivityIndicator size="large" color={colors.primary} />
      {!!label && (
        <Text style={[TextStyles.body, { color: colors.mutedForeground, marginTop: Spacing.md }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

// ── Error ─────────────────────────────────────────────────────
export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.centre} testID="state-error">
      <AlertCircle size={40} color={colors.destructive} />
      <Text
        style={[TextStyles.h4, { color: colors.foreground, marginTop: Spacing.md, textAlign: 'center' }]}
      >
        Something went wrong
      </Text>
      <Text
        style={[
          TextStyles.body,
          { color: colors.mutedForeground, marginTop: Spacing.xs, textAlign: 'center', maxWidth: 320 },
        ]}
      >
        {message ?? 'Please check your connection and try again.'}
      </Text>
      {!!onRetry && (
        <Pressable
          onPress={onRetry}
          testID="button-retry"
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[TextStyles.button, { color: '#fff' }]}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Empty ─────────────────────────────────────────────────────
export function EmptyState({
  title,
  message,
  icon,
  actionLabel,
  onAction,
}: {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.centre} testID="state-empty">
      {icon ?? <Inbox size={40} color={colors.mutedForeground} />}
      <Text
        style={[TextStyles.h4, { color: colors.foreground, marginTop: Spacing.md, textAlign: 'center' }]}
      >
        {title}
      </Text>
      {!!message && (
        <Text
          style={[
            TextStyles.body,
            { color: colors.mutedForeground, marginTop: Spacing.xs, textAlign: 'center', maxWidth: 320 },
          ]}
        >
          {message}
        </Text>
      )}
      {!!actionLabel && !!onAction && (
        <Pressable
          onPress={onAction}
          testID="button-empty-action"
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[TextStyles.button, { color: '#fff' }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Badge / pill ──────────────────────────────────────────────
export function Badge({
  label,
  color,
  bg,
  testID,
}: {
  label: string;
  color?: string;
  bg?: string;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      testID={testID}
      style={[styles.badge, { backgroundColor: bg ?? colors.secondary }]}
    >
      <Text style={[TextStyles.badge, { color: color ?? colors.secondaryForeground }]}>{label}</Text>
    </View>
  );
}

// ── Chip (selectable) ─────────────────────────────────────────
export function Chip({
  label,
  active,
  onPress,
  testID,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.secondary,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          TextStyles.label,
          { color: active ? '#fff' : colors.foreground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ── Section header ────────────────────────────────────────────
export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[TextStyles.sectionHeader, { color: colors.foreground }]}>{title}</Text>
      {!!actionLabel && !!onAction && (
        <Pressable onPress={onAction} testID={`button-section-${title}`}>
          <Text style={[TextStyles.label, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({
  children,
  onPress,
  style,
  testID,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const { colors } = useTheme();
  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} testID={testID}>
        {content}
      </Pressable>
    );
  }
  return content;
}

// ── Primary button ────────────────────────────────────────────
export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  testID,
  icon,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  icon?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      style={[
        styles.primaryBtn,
        { backgroundColor: colors.primary, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon}
          <Text style={[TextStyles.button, { color: '#fff', marginLeft: icon ? Spacing.sm : 0 }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Scrollable centred message (for full-screen states) ───────
export function CentredScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

// ── Formatting helpers ────────────────────────────────────────
export function formatDate(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateRange(start?: string | null, end?: string | null): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e && s !== e) return `${s} – ${e}`;
  return s || e || 'Date TBC';
}

export function timeAgo(value?: string | null): string {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (isNaN(then)) return '';
  const secs = Math.floor((Date.now() - then) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return formatDate(value);
}

export function formatPrice(price?: number | null, isFree?: boolean, saleType?: string): string {
  if (isFree || saleType === 'free') return 'Free';
  if (price == null) return 'POA';
  const amount = `£${(price / 100).toFixed(2).replace(/\.00$/, '')}`;
  return saleType === 'hire' ? `${amount} / hire` : amount;
}

const styles = StyleSheet.create({
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    minHeight: 240,
  },
  retryBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
  },
  primaryBtn: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
