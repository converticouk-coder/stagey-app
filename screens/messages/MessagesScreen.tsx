// ============================================================
// STAGEY MOBILE — MESSAGES (conversation list)
// Lists direct/marketplace conversations. Polls every 10s.
// ============================================================
import React, { useLayoutEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageSquarePlus, MessagesSquare } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  useListBottomPadding,
  timeAgo,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, AvatarSize, PrimaryGradient } from '../../constants';
import type { Conversation, ConversationParticipant } from '../../types';

export default function MessagesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const { user, isAuthenticated } = useAuth();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          testID="button-new-message"
          onPress={() => navigation.navigate('ProfileSearch')}
          hitSlop={10}
          style={{ marginRight: Spacing.md }}
        >
          <MessageSquarePlus size={22} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, colors.primary]);

  const q = useQuery({
    queryKey: ['conversations'],
    queryFn: () => ConversationsAPI.getAll(),
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  if (!isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          title="Sign in to view messages"
          message="Log in to chat with the community."
          actionLabel="Sign in"
          onAction={() => navigation.navigate('Login')}
        />
      </Screen>
    );
  }

  if (q.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading messages…" />
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

  const conversations = q.data ?? [];

  const otherParticipant = (c: Conversation): ConversationParticipant | undefined =>
    c.participants?.find((p) => p.userId !== user?.id) ?? c.participants?.[0];

  const titleFor = (c: Conversation): string => {
    if (c.title) return c.title;
    const other = otherParticipant(c);
    return other?.username ? `@${other.username}` : 'Conversation';
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const other = otherParticipant(item);
    const unread = item.unreadCount > 0;
    return (
      <Pressable
        testID={`card-conversation-${item.id}`}
        onPress={() => navigation.navigate('Conversation', { conversationId: item.id, title: titleFor(item) })}
        style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {other?.profileImageUrl ? (
          <Image source={{ uri: other.profileImageUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <LinearGradient colors={PrimaryGradient.colors} style={styles.avatar} />
        )}
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              numberOfLines={1}
              style={[TextStyles.h5, { color: colors.foreground, flex: 1, fontFamily: unread ? TextStyles.button.fontFamily : undefined }]}
            >
              {titleFor(item)}
            </Text>
            <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: Spacing.sm }]}>
              {timeAgo(item.lastMessageAt ?? item.lastMessage?.createdAt)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Text
              numberOfLines={1}
              style={[
                TextStyles.bodySmall,
                { color: unread ? colors.foreground : colors.mutedForeground, flex: 1 },
              ]}
            >
              {item.lastMessage?.content ?? 'No messages yet'}
            </Text>
            {unread && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={[TextStyles.caption, { color: '#fff' }]}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <Screen>
      <FlatList
        data={conversations}
        keyExtractor={(item) => String(item.id)}
        onRefresh={q.refetch}
        refreshing={q.isRefetching}
        contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
        ListEmptyComponent={
          <EmptyState
            title="No messages yet"
            message="Start a conversation from someone's profile."
            icon={<MessagesSquare size={40} color={colors.mutedForeground} />}
            actionLabel="Find people"
            onAction={() => navigation.navigate('ProfileSearch')}
          />
        }
        renderItem={renderItem}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
  avatar: { width: AvatarSize.md, height: AvatarSize.md, borderRadius: Radius.full },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: Spacing.sm,
  },
});
