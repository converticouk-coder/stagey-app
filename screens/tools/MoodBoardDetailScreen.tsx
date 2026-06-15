// ============================================================
// STAGEY MOBILE — MOOD BOARD DETAIL
// View a board's images in a grid, add (upload) images, remove images.
// ============================================================
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Alert, useWindowDimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { ImagePlus, Trash2, ImageOff } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MoodBoardsAPI, UploadAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';

export default function MoodBoardDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const boardId = route.params?.id as number;
  const bottomPad = useListBottomPadding();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const [uploading, setUploading] = useState(false);

  const gap = Spacing.sm;
  const cols = 2;
  const tileSize = (width - Spacing.screenPadding * 2 - gap * (cols - 1)) / cols;

  const { data: board, isLoading, isError, refetch } = useQuery({
    queryKey: ['mood-board', boardId],
    queryFn: async () => {
      const all = await MoodBoardsAPI.getAll();
      return all.find((b) => b.id === boardId) ?? null;
    },
    enabled: boardId != null,
  });

  async function addImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    setUploading(true);
    try {
      const url = await UploadAPI.uploadImage(result.assets[0].uri);
      await MoodBoardsAPI.addItem(boardId, url);
      await queryClient.invalidateQueries({ queryKey: ['mood-board', boardId] });
      Toast.show({ type: 'success', text1: 'Image added' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not add image', text2: e?.message });
    } finally {
      setUploading(false);
    }
  }

  function confirmRemove(itemId: number) {
    Alert.alert('Remove image?', 'This image will be removed from the board.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await MoodBoardsAPI.removeItem(boardId, itemId);
            await queryClient.invalidateQueries({ queryKey: ['mood-board', boardId] });
          } catch (e: any) {
            Toast.show({ type: 'error', text1: 'Could not remove', text2: e?.message });
          }
        },
      },
    ]);
  }

  if (isLoading) return <Screen><LoadingState label="Loading board…" /></Screen>;
  if (isError || !board) return <Screen><ErrorState onRetry={refetch} /></Screen>;

  const items = [...(board.items ?? [])].sort((a, b) => a.order - b.order);

  return (
    <Screen>
      <FlatList
        data={items}
        numColumns={cols}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={{ gap }}
        contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad, gap }}
        ListHeaderComponent={
          <View style={{ marginBottom: Spacing.md }}>
            <Text style={[TextStyles.h2, { color: colors.foreground }]}>{board.name}</Text>
            <Pressable
              testID="button-add-image"
              onPress={addImage}
              disabled={uploading}
              style={[styles.addBtn, { borderColor: colors.primary }]}
            >
              <ImagePlus size={18} color={colors.primary} />
              <Text style={[TextStyles.label, { color: colors.primary, marginLeft: Spacing.sm }]}>
                {uploading ? 'Uploading…' : 'Add image'}
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No images yet"
            message="Add your first image to this board."
            icon={<ImageOff size={40} color={colors.mutedForeground} />}
          />
        }
        renderItem={({ item }) => (
          <View testID={`tile-image-${item.id}`} style={[styles.tile, { width: tileSize, height: tileSize }]}>
            <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <Pressable
              testID={`button-remove-image-${item.id}`}
              onPress={() => confirmRemove(item.id)}
              style={styles.removeBtn}
            >
              <Trash2 size={16} color="#fff" />
            </Pressable>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  tile: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: '#00000010',
  },
  removeBtn: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: '#00000088',
    borderRadius: Radius.full,
    padding: 6,
  },
});
