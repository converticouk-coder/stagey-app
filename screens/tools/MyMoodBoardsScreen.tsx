// ============================================================
// STAGEY MOBILE — MY MOOD BOARDS
// List a user's mood boards, create new ones, delete, open detail.
// ============================================================
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { LayoutGrid, Plus, Trash2, ImageOff } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { MoodBoardsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  PrimaryButton,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';

export default function MyMoodBoardsScreen() {
  const { colors } = useTheme();
  const bottomPad = useListBottomPadding();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['mood-boards'],
    queryFn: () => MoodBoardsAPI.getAll(),
    enabled: isAuthenticated,
  });

  async function create() {
    if (!newName.trim()) {
      Toast.show({ type: 'error', text1: 'Name your board first' });
      return;
    }
    setCreating(true);
    try {
      const board = await MoodBoardsAPI.create(newName.trim());
      setNewName('');
      await queryClient.invalidateQueries({ queryKey: ['mood-boards'] });
      navigation.navigate('MoodBoardDetail', { id: board.id });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not create', text2: e?.message });
    } finally {
      setCreating(false);
    }
  }

  function confirmDelete(id: number, name: string) {
    Alert.alert('Delete board?', `"${name}" will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await MoodBoardsAPI.delete(id);
            await queryClient.invalidateQueries({ queryKey: ['mood-boards'] });
          } catch (e: any) {
            Toast.show({ type: 'error', text1: 'Could not delete', text2: e?.message });
          }
        },
      },
    ]);
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          title="Sign in to use mood boards"
          message="Create a free account to start collecting inspiration."
          icon={<LayoutGrid size={40} color={colors.mutedForeground} />}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: Spacing.sm, padding: Spacing.screenPadding, paddingBottom: 0 }}>
        <TextInput
          testID="input-new-board"
          value={newName}
          onChangeText={setNewName}
          placeholder="New board name"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
        />
        <Pressable testID="button-create-board" onPress={create} disabled={creating} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Plus size={20} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingState label="Loading boards…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No boards yet"
          message="Create your first mood board above."
          icon={<LayoutGrid size={40} color={colors.mutedForeground} />}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) => {
            const cover = item.items?.[0]?.imageUrl;
            return (
              <Pressable
                testID={`card-board-${item.id}`}
                onPress={() => navigation.navigate('MoodBoardDetail', { id: item.id })}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                {cover ? (
                  <Image source={{ uri: cover }} style={styles.cover} contentFit="cover" />
                ) : (
                  <View style={[styles.cover, styles.coverEmpty, { backgroundColor: colors.muted }]}>
                    <ImageOff size={28} color={colors.mutedForeground} />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <View style={{ flex: 1 }}>
                    <Text style={[TextStyles.label, { color: colors.foreground }]}>{item.name}</Text>
                    <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>
                      {item.items?.length ?? 0} {(item.items?.length ?? 0) === 1 ? 'image' : 'images'}
                    </Text>
                  </View>
                  <Pressable testID={`button-delete-board-${item.id}`} onPress={() => confirmDelete(item.id, item.name)} style={styles.iconBtn}>
                    <Trash2 size={18} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...TextStyles.body,
  },
  addBtn: {
    width: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cover: { width: '100%', height: 140 },
  coverEmpty: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flexDirection: 'row', alignItems: 'center', padding: Spacing.cardPadding },
  iconBtn: { padding: Spacing.xs },
});
