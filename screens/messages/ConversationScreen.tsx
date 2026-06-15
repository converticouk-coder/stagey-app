// ============================================================
// STAGEY MOBILE — CONVERSATION THREAD
// Direct message thread. Polls messages every 5s, marks read
// on open, sends new messages.
// ============================================================
import React, { useEffect, useMemo, useState } from 'react';
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
import Toast from 'react-native-toast-message';
import { Send } from 'lucide-react-native';
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
import { TextStyles, Spacing, Radius } from '../../constants';
import type { DirectMessage } from '../../types';

export default function ConversationScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const conversationId: number = route.params?.conversationId;
  const bottomPad = useListBottomPadding();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const q = useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: () => ConversationsAPI.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 5000,
  });

  // Mark read on open and whenever new messages arrive.
  useEffect(() => {
    if (!conversationId) return;
    ConversationsAPI.markRead(conversationId)
      .then(() => queryClient.invalidateQueries({ queryKey: ['conversations'] }))
      .catch(() => {});
  }, [conversationId, q.data?.length]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => ConversationsAPI.sendMessage(conversationId, content),
    onSuccess: () => {
      setText('');
      q.refetch();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Could not send message' }),
  });

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    sendMutation.mutate(content);
  };

  const messages = q.data ?? [];
  const ordered = useMemo(() => [...messages].reverse(), [messages]);

  if (q.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading…" />
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

  const renderMessage = ({ item }: { item: DirectMessage }) => {
    const isMine = item.senderId === user?.id;
    return (
      <View
        testID={`dm-${item.id}`}
        style={[styles.bubbleRow, { justifyContent: isMine ? 'flex-end' : 'flex-start' }]}
      >
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isMine ? colors.primary : colors.card,
              borderColor: colors.border,
              borderWidth: isMine ? 0 : StyleSheet.hairlineWidth,
            },
          ]}
        >
          <Text style={[TextStyles.body, { color: isMine ? '#fff' : colors.foreground }]}>{item.content}</Text>
          <Text
            style={[
              TextStyles.caption,
              { color: isMine ? 'rgba(255,255,255,0.7)' : colors.mutedForeground, marginTop: 4, textAlign: 'right' },
            ]}
          >
            {timeAgo(item.createdAt)}
          </Text>
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
          contentContainerStyle={{ padding: Spacing.screenPadding }}
          ListEmptyComponent={
            <View style={{ transform: [{ scaleY: -1 }], paddingTop: Spacing.huge }}>
              <EmptyState title="No messages yet" message="Say hello below." />
            </View>
          }
          renderItem={renderMessage}
        />

        <View style={[styles.composer, { borderColor: colors.border }]}>
          <TextInput
            testID="input-dm-message"
            value={text}
            onChangeText={setText}
            placeholder="Write a message…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={[
              styles.composerInput,
              { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground },
            ]}
          />
          <Pressable
            testID="button-send-dm"
            onPress={handleSend}
            disabled={sendMutation.isPending}
            style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: sendMutation.isPending ? 0.6 : 1 }]}
          >
            {sendMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Send size={18} color="#fff" />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bubbleRow: { flexDirection: 'row', marginBottom: Spacing.md },
  bubble: {
    maxWidth: '78%',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
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
