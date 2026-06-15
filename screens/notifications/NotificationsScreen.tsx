// ============================================================
// STAGEY MOBILE — NOTIFICATIONS
// Modal panel listing notifications. Tap to mark read + route;
// "Mark all read" clears unread; close returns to previous screen.
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, BellOff, CheckCheck } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  useListBottomPadding,
  timeAgo,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';
import type { AppNotification } from '../../types';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const q = useQuery({
    queryKey: ['notifications'],
    queryFn: () => NotificationsAPI.getAll(),
    enabled: isAuthenticated,
  });

  const markRead = useMutation({
    mutationFn: (id: number) => NotificationsAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => NotificationsAPI.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const routeFor = (n: AppNotification) => {
    switch (n.relatedType) {
      case 'profile':
      case 'follow':
        if (n.actorName) navigation.navigate('UserProfile', { username: n.actorName });
        break;
      case 'conversation':
      case 'message':
        navigation.navigate('Conversation', { conversationId: n.relatedId });
        break;
      default:
        break;
    }
  };

  const onPressItem = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
    routeFor(n);
  };

  const notifications = q.data ?? [];
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <Screen>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <Text style={[TextStyles.h3, { color: colors.foreground }]}>Notifications</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.lg }}>
          {hasUnread && (
            <Pressable testID="button-mark-all-read" onPress={() => markAll.mutate()} hitSlop={8}>
              <CheckCheck size={20} color={colors.primary} />
            </Pressable>
          )}
          <Pressable testID="button-close-notifications" onPress={() => navigation.goBack()} hitSlop={8}>
            <X size={22} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {!isAuthenticated ? (
        <EmptyState
          title="Sign in to see notifications"
          actionLabel="Sign in"
          onAction={() => navigation.navigate('Login')}
        />
      ) : q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState onRetry={q.refetch} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          onRefresh={q.refetch}
          refreshing={q.isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          ListEmptyComponent={
            <EmptyState
              title="You're all caught up"
              message="New activity will appear here."
              icon={<BellOff size={40} color={colors.mutedForeground} />}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              testID={`notification-${item.id}`}
              onPress={() => onPressItem(item)}
              style={[
                styles.row,
                {
                  backgroundColor: item.read ? colors.card : colors.secondary,
                  borderColor: colors.border,
                },
              ]}
            >
              {!item.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
              <View style={{ flex: 1 }}>
                <Text style={[TextStyles.body, { color: colors.foreground }]}>
                  {item.actorName ? `${item.actorName} ` : ''}
                  <Text style={{ color: colors.mutedForeground }}>{item.message}</Text>
                </Text>
                <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 4 }]}>
                  {timeAgo(item.createdAt)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
