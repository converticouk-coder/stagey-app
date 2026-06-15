// ============================================================
// STAGEY MOBILE — SHOW LIBRARY (browse)
// Encyclopaedia of musicals & plays. Tap a card → LibraryShow.
// ============================================================
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Search as SearchIcon, Library as LibraryIcon, Music, Star } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { LibraryAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Chip,
  Badge,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';

const TYPES = ['musical', 'play', 'opera', 'pantomime'];

export default function LibraryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['library'],
    queryFn: () => LibraryAPI.getAll(),
  });

  const ql = search.trim().toLowerCase();
  const shows = useMemo(
    () =>
      (data ?? [])
        .filter((s) => !type || s.type === type)
        .filter(
          (s) =>
            !ql ||
            s.title.toLowerCase().includes(ql) ||
            s.composer?.toLowerCase().includes(ql) ||
            s.lyricist?.toLowerCase().includes(ql),
        ),
    [data, ql, type],
  );

  return (
    <Screen>
      <View style={styles.controls}>
        <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <SearchIcon size={18} color={colors.mutedForeground} />
          <TextInput
            testID="input-library-search"
            value={search}
            onChangeText={setSearch}
            placeholder="Search shows…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Chip label="All" active={type === null} onPress={() => setType(null)} testID="chip-library-all" />
          {TYPES.map((t) => (
            <Chip
              key={t}
              testID={`chip-library-${t}`}
              label={t.charAt(0).toUpperCase() + t.slice(1)}
              active={type === t}
              onPress={() => setType(t)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingState label="Loading show library…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : shows.length === 0 ? (
        <EmptyState
          title="No shows found"
          message="Try a different search or type."
          icon={<LibraryIcon size={40} color={colors.mutedForeground} />}
          actionLabel={search || type ? 'Clear filters' : undefined}
          onAction={() => {
            setSearch('');
            setType(null);
          }}
        />
      ) : (
        <FlatList
          data={shows}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) => (
            <Pressable
              testID={`card-library-${item.id}`}
              onPress={() => navigation.navigate('LibraryShow', { slug: item.slug })}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {item.posterUrl || item.imageUrl ? (
                <Image source={{ uri: item.posterUrl || item.imageUrl! }} style={styles.poster} contentFit="cover" />
              ) : (
                <View style={[styles.poster, { backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }]}>
                  <Music size={28} color={colors.mutedForeground} />
                </View>
              )}
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                  <Text numberOfLines={2} style={[TextStyles.h4, { color: colors.foreground, flex: 1 }]}>
                    {item.title}
                  </Text>
                  {item.isFeatured && <Star size={16} color={colors.primary} fill={colors.primary} />}
                </View>
                {!!item.composer && (
                  <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>
                    {item.composer}
                  </Text>
                )}
                <View style={{ flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm, flexWrap: 'wrap' }}>
                  <Badge label={item.type} />
                  {item.originalProductionYear ? <Badge label={String(item.originalProductionYear)} /> : null}
                </View>
                {!!item.previewText && (
                  <Text numberOfLines={2} style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: Spacing.sm, fontStyle: 'italic' }]}>
                    {item.previewText}
                  </Text>
                )}
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: Spacing.sm, ...TextStyles.body },
  filterRow: { marginTop: Spacing.md, flexGrow: 0 },
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
  poster: { width: 72, height: 96, borderRadius: Radius.md },
});
