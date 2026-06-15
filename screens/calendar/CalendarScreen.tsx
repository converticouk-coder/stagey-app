// ============================================================
// STAGEY MOBILE — CALENDAR
// Upcoming events for the signed-in user, grouped by date.
// ============================================================
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPin } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';
import type { CalendarEvent } from '../../types';

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function CalendarScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const { isAuthenticated } = useAuth();

  const q = useQuery({
    queryKey: ['calendar-upcoming'],
    queryFn: () => CalendarAPI.getUpcoming(50),
    enabled: isAuthenticated,
  });

  const sections = useMemo(() => {
    const events = q.data ?? [];
    const groups: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      const key = dayKey(e.startAt);
      (groups[key] ??= []).push(e);
    }
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [q.data]);

  if (!isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          title="Sign in to view your calendar"
          message="Your rehearsals, shows and events appear here."
          actionLabel="Sign in"
          onAction={() => navigation.navigate('Login')}
        />
      </Screen>
    );
  }

  if (q.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading calendar…" />
      </Screen>
    );
  }
  if (q.isError) {
    return (
      <Screen>
        <ErrorState onRetry={q.refetch} />
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        onRefresh={q.refetch}
        refreshing={q.isRefetching}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
        ListEmptyComponent={
          <EmptyState
            title="No upcoming events"
            message="Events from your societies and shows will show up here."
            icon={<CalendarDays size={40} color={colors.mutedForeground} />}
          />
        }
        renderSectionHeader={({ section }) => (
          <Text style={[TextStyles.sectionHeader, { color: colors.foreground, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View testID={`event-${item.id}`} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.timeChip, { backgroundColor: colors.secondary }]}>
              <Text style={[TextStyles.labelSmall, { color: colors.primary }]}>{timeLabel(item.startAt)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={[TextStyles.h5, { color: colors.foreground }]}>{item.title}</Text>
              {!!item.description && (
                <Text numberOfLines={2} style={[TextStyles.bodySmall, { color: colors.mutedForeground, marginTop: 2 }]}>
                  {item.description}
                </Text>
              )}
              <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 4 }]}>
                {item.sourceType}
              </Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
  timeChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
});
