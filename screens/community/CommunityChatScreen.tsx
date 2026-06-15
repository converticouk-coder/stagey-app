// ============================================================
// STAGEY MOBILE — COMMUNITY CHAT LIST
// Lists the chats (threads) inside a category. Tap → thread.
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Pin, Lock, MessageCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { CommunityAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Badge,
  useListBottomPadding,
  timeAgo,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';
import type { CommunityChat } from '../../types';

const MODE_LABELS: Record<string, string> = {
  standard: 'Discussion',
  qa: 'Q&A',
  spotlight: 'Spotlight',
  daily: 'Daily',
};

export default function CommunityChatScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const categorySlug: string = route.params?.categorySlug;
  const bottomPad = useListBottomPadding();

  const q = useQuery({
    queryKey: ['community-chats', categorySlug],
    queryFn: () => CommunityAPI.getChats(categorySlug),
    enabled: !!categorySlug,
  });

  const chats = q.data ?? [];

  if (q.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading chats…" />
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

  const renderChat = ({ item }: { item: CommunityChat }) => (
    <Pressable
      testID={`card-chat-${item.slug}`}
      onPress={() =>
        navigation.navigate('CommunityChatThread', {
          categorySlug,
          chatSlug: item.slug,
          title: item.title,
        })
      }
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        {item.isPinned && <Pin size={14} color={colors.primary} />}
        {item.isLocked && <Lock size={14} color={colors.mutedForeground} />}
        <Text style={[TextStyles.h5, { color: colors.foreground, flex: 1 }]} numberOfLines={1}>
          {item.title}
        </Text>
        {!!item.mode && MODE_LABELS[item.mode] && (
          <Badge label={MODE_LABELS[item.mode]} color={colors.primary} bg={colors.secondary} />
        )}
      </View>
      {!!item.description && (
        <Text numberOfLines={2} style={[TextStyles.bodySmall, { color: colors.mutedForeground, marginTop: 4 }]}>
          {item.description}
        </Text>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MessageCircle size={13} color={colors.mutedForeground} />
          <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
            {item.messageCount ?? 0}
          </Text>
        </View>
        {!!item.lastActivityAt && (
          <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>
            {timeAgo(item.lastActivityAt)}
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <Screen>
      <FlatList
        data={chats}
        keyExtractor={(item) => String(item.id)}
        onRefresh={q.refetch}
        refreshing={q.isRefetching}
        contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
        ListEmptyComponent={<EmptyState title="No chats yet" message="Be the first to start a conversation here." />}
        renderItem={renderChat}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
});
