// ============================================================
// STAGEY MOBILE — COMMUNITY CHAT THREAD
// Message stream for a single chat. Polls every 5s. Supports
// like / applaud / spotlight reactions and @mentions.
// ============================================================
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { ThumbsUp, Hand, Star, Send, Lock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CommunityAPI, ProfilesAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  useListBottomPadding,
  timeAgo,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, AvatarSize, PrimaryGradient } from '../../constants';
import type { CommunityMessage, CommunityReactionType, PublicProfile } from '../../types';

const REACTIONS: { type: CommunityReactionType; Icon: any }[] = [
  { type: 'like', Icon: ThumbsUp },
  { type: 'applaud', Icon: Hand },
  { type: 'spotlight', Icon: Star },
];

function countFor(m: CommunityMessage, type: CommunityReactionType): number {
  if (m.reactionCounts) return m.reactionCounts[type] ?? 0;
  if (type === 'like') return m.likeCount ?? 0;
  if (type === 'applaud') return m.applaudCount ?? 0;
  return m.spotlightCount ?? 0;
}

export default function CommunityChatThreadScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const chatSlug: string = route.params?.chatSlug;
  const bottomPad = useListBottomPadding();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [text, setText] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const mentionsRef = useRef<Record<string, string>>({});

  const chatQ = useQuery({
    queryKey: ['community-chat', chatSlug],
    queryFn: () => CommunityAPI.getChat(chatSlug),
    enabled: !!chatSlug,
  });

  const messagesQ = useQuery({
    queryKey: ['community-messages', chatSlug],
    queryFn: () => CommunityAPI.getMessages(chatSlug),
    enabled: !!chatSlug,
    refetchInterval: 5000,
  });

  const mentionResultsQ = useQuery({
    queryKey: ['mention-search', mentionQuery],
    queryFn: () => ProfilesAPI.search({ q: mentionQuery ?? '', limit: 6 }),
    enabled: mentionQuery != null && mentionQuery.length >= 1,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => {
      const mentionedUserIds = Object.entries(mentionsRef.current)
        .filter(([uname]) => content.includes(`@${uname}`))
        .map(([, id]) => id);
      return CommunityAPI.sendMessage(chatSlug, { content, mentionedUserIds });
    },
    onSuccess: () => {
      setText('');
      mentionsRef.current = {};
      messagesQ.refetch();
    },
    onError: () => Toast.show({ type: 'error', text1: 'Could not send message' }),
  });

  const reactMutation = useMutation({
    mutationFn: ({ id, type, active }: { id: number; type: CommunityReactionType; active: boolean }) =>
      active ? CommunityAPI.removeReaction(id, type) : CommunityAPI.addReaction(id, type),
    onSuccess: () => messagesQ.refetch(),
    onError: () => Toast.show({ type: 'error', text1: 'Could not react' }),
  });

  const onChangeText = (value: string) => {
    setText(value);
    const match = /(?:^|\s)@(\w*)$/.exec(value);
    setMentionQuery(match ? match[1] : null);
  };

  const pickMention = (p: PublicProfile) => {
    mentionsRef.current[p.username] = p.id;
    setText((prev) => prev.replace(/(^|\s)@(\w*)$/, `$1@${p.username} `));
    setMentionQuery(null);
  };

  const handleSend = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    const content = text.trim();
    if (!content) return;
    sendMutation.mutate(content);
  };

  const locked = chatQ.data?.isLocked;
  const messages = messagesQ.data ?? [];
  const ordered = useMemo(() => [...messages].reverse(), [messages]);

  if (messagesQ.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading messages…" />
      </Screen>
    );
  }
  if (messagesQ.isError) {
    return (
      <Screen>
        <ErrorState onRetry={messagesQ.refetch} />
      </Screen>
    );
  }

  const renderMessage = ({ item }: { item: CommunityMessage }) => {
    const isMine = item.authorId === user?.id;
    return (
      <View style={styles.msgRow} testID={`message-${item.id}`}>
        {item.authorProfileImageUrl ? (
          <Image source={{ uri: item.authorProfileImageUrl }} style={styles.msgAvatar} contentFit="cover" />
        ) : (
          <LinearGradient colors={PrimaryGradient.colors} style={styles.msgAvatar} />
        )}
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Pressable
              onPress={() =>
                item.authorUsername && navigation.navigate('UserProfile', { username: item.authorUsername })
              }
            >
              <Text style={[TextStyles.h5, { color: colors.foreground }]}>
                {item.authorUsername ? `@${item.authorUsername}` : 'Member'}
                {isMine ? ' (you)' : ''}
              </Text>
            </Pressable>
            <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>{timeAgo(item.createdAt)}</Text>
          </View>
          <Text style={[TextStyles.body, { color: colors.foreground, marginTop: 2 }]}>{item.content}</Text>
          {(item.imageUrls ?? []).map((url, i) => (
            <Image key={i} source={{ uri: url }} style={styles.msgImage} contentFit="cover" />
          ))}
          <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm }}>
            {REACTIONS.map(({ type, Icon }) => {
              const count = countFor(item, type);
              return (
                <Pressable
                  key={type}
                  testID={`button-react-${type}-${item.id}`}
                  onPress={() => reactMutation.mutate({ id: item.id, type, active: false })}
                  style={[styles.reactBtn, { borderColor: colors.border }]}
                >
                  <Icon size={14} color={colors.mutedForeground} />
                  {count > 0 && (
                    <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>{count}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={ordered}
          inverted
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: Spacing.md }}
          ListEmptyComponent={
            <View style={{ transform: [{ scaleY: -1 }], paddingTop: Spacing.huge }}>
              <EmptyState title="No messages yet" message="Start the conversation below." />
            </View>
          }
          renderItem={renderMessage}
        />

        {/* @mention suggestions */}
        {mentionQuery != null && (mentionResultsQ.data?.length ?? 0) > 0 && (
          <View style={[styles.mentionBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {(mentionResultsQ.data ?? []).map((p) => (
              <Pressable
                key={p.id}
                testID={`mention-${p.username}`}
                onPress={() => pickMention(p)}
                style={styles.mentionItem}
              >
                <Text style={[TextStyles.body, { color: colors.foreground }]}>@{p.username}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {locked ? (
          <View style={[styles.lockedBar, { borderColor: colors.border }]}>
            <Lock size={16} color={colors.mutedForeground} />
            <Text style={[TextStyles.bodySmall, { color: colors.mutedForeground, marginLeft: Spacing.sm }]}>
              This chat is locked.
            </Text>
          </View>
        ) : (
          <View style={[styles.composer, { borderColor: colors.border, paddingBottom: bottomPad ? Spacing.md : Spacing.md }]}>
            <TextInput
              testID="input-community-message"
              value={text}
              onChangeText={onChangeText}
              placeholder={isAuthenticated ? 'Write a message…' : 'Sign in to post'}
              placeholderTextColor={colors.mutedForeground}
              editable={isAuthenticated}
              multiline
              style={[
                styles.composerInput,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground },
              ]}
            />
            <Pressable
              testID="button-send-community"
              onPress={handleSend}
              disabled={sendMutation.isPending}
              style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: sendMutation.isPending ? 0.6 : 1 }]}
            >
              {sendMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Send size={18} color="#fff" />}
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  msgRow: { flexDirection: 'row', marginBottom: Spacing.lg },
  msgAvatar: { width: AvatarSize.md, height: AvatarSize.md, borderRadius: Radius.full },
  msgImage: { width: '100%', height: 160, borderRadius: Radius.md, marginTop: Spacing.sm },
  reactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  mentionBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    maxHeight: 180,
  },
  mentionItem: { paddingVertical: Spacing.sm },
  lockedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  composerInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxHeight: 120,
    ...TextStyles.body,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
