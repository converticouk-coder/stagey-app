// ============================================================
// STAGEY MOBILE — CASTINGS BROWSE
// Browse open casting calls with search + performer/role filters.
// Tap a card → CastingDetail.
// ============================================================
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Search as SearchIcon, MapPin, Drama, Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { CastingsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Chip,
  Badge,
  useListBottomPadding,
  formatDate,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';

const PERFORMER_TYPES = ['Vocalist', 'Actor', 'Dancer', 'Musician', 'Crew'];

export default function CastingsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const [search, setSearch] = useState('');
  const [performerType, setPerformerType] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['castings', performerType],
    queryFn: () => CastingsAPI.getAll({ performerType: performerType || undefined }),
  });

  const ql = search.trim().toLowerCase();
  const castings = useMemo(
    () =>
      (data ?? [])
        .filter((c) => c.isOpen)
        .filter(
          (c) =>
            !ql ||
            c.title?.toLowerCase().includes(ql) ||
            c.showName?.toLowerCase().includes(ql) ||
            c.societyName?.toLowerCase().includes(ql),
        ),
    [data, ql],
  );

  return (
    <Screen>
      <View style={styles.controls}>
        <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <SearchIcon size={18} color={colors.mutedForeground} />
          <TextInput
            testID="input-castings-search"
            value={search}
            onChangeText={setSearch}
            placeholder="Search castings…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Chip label="All" active={performerType === null} onPress={() => setPerformerType(null)} testID="chip-performer-all" />
          {PERFORMER_TYPES.map((p) => (
            <Chip
              key={p}
              testID={`chip-performer-${p}`}
              label={p}
              active={performerType === p}
              onPress={() => setPerformerType(p)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingState label="Loading castings…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : castings.length === 0 ? (
        <EmptyState
          title="No open castings"
          message="Check back soon — new casting calls are posted regularly."
          icon={<Drama size={40} color={colors.mutedForeground} />}
          actionLabel={search || performerType ? 'Clear filters' : undefined}
          onAction={() => {
            setSearch('');
            setPerformerType(null);
          }}
        />
      ) : (
        <FlatList
          data={castings}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) => (
            <Pressable
              testID={`card-casting-${item.id}`}
              onPress={() => navigation.navigate('CastingDetail', { id: item.id })}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={{ flexDirection: 'row' }}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }]}>
                    <Drama size={24} color={colors.mutedForeground} />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text numberOfLines={2} style={[TextStyles.h4, { color: colors.foreground }]}>
                    {item.title}
                  </Text>
                  {!!(item.societyName || item.company || item.showName) && (
                    <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>
                      {[item.societyName ?? item.company, item.showName].filter(Boolean).join(' • ')}
                    </Text>
                  )}
                  <View style={{ flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm, flexWrap: 'wrap' }}>
                    {!!item.roleType && <Badge label={item.roleType} />}
                    {!!item.performerType && <Badge label={item.performerType} />}
                  </View>
                </View>
              </View>
              <View style={styles.footRow}>
                {!!item.location && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MapPin size={14} color={colors.mutedForeground} />
                    <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                      {item.location}
                    </Text>
                  </View>
                )}
                {!!item.deadline && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Clock size={14} color={colors.warning} />
                    <Text style={[TextStyles.caption, { color: colors.warning, marginLeft: 4 }]}>
                      Closes {formatDate(item.deadline)}
                    </Text>
                  </View>
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
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
  thumb: { width: 64, height: 64, borderRadius: Radius.md },
  footRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
