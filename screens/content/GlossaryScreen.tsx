// ============================================================
// STAGEY MOBILE — THEATRE GLOSSARY
// Searchable A–Z of theatre terms with category filters.
// ============================================================
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, BookOpen } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { GlossaryAPI } from '../../services/api';
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

export default function GlossaryScreen() {
  const { colors } = useTheme();
  const bottomPad = useListBottomPadding();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['glossary'],
    queryFn: () => GlossaryAPI.getAll(),
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((t) => t.category && set.add(t.category));
    return Array.from(set).sort();
  }, [data]);

  const ql = search.trim().toLowerCase();
  const terms = useMemo(
    () =>
      (data ?? [])
        .filter((t) => !category || t.category === category)
        .filter(
          (t) =>
            !ql ||
            t.term.toLowerCase().includes(ql) ||
            t.definition.toLowerCase().includes(ql),
        )
        .sort((a, b) => a.term.localeCompare(b.term)),
    [data, ql, category],
  );

  return (
    <Screen>
      <View style={styles.controls}>
        <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <SearchIcon size={18} color={colors.mutedForeground} />
          <TextInput
            testID="input-glossary-search"
            value={search}
            onChangeText={setSearch}
            placeholder="Search terms…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <Chip label="All" active={category === null} onPress={() => setCategory(null)} testID="chip-glossary-all" />
            {categories.map((c) => (
              <Chip
                key={c}
                testID={`chip-glossary-${c}`}
                label={c}
                active={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {isLoading ? (
        <LoadingState label="Loading glossary…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : terms.length === 0 ? (
        <EmptyState
          title="No terms found"
          message="Try a different search or category."
          icon={<BookOpen size={40} color={colors.mutedForeground} />}
          actionLabel={search || category ? 'Clear filters' : undefined}
          onAction={() => {
            setSearch('');
            setCategory(null);
          }}
        />
      ) : (
        <FlatList
          data={terms}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) => (
            <View
              testID={`card-glossary-${item.id}`}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.termRow}>
                <Text style={[TextStyles.h4, { color: colors.foreground, flex: 1 }]}>{item.term}</Text>
                {!!item.category && <Badge label={item.category} />}
              </View>
              <Text style={[TextStyles.body, { color: colors.mutedForeground, marginTop: Spacing.xs }]}>
                {item.definition}
              </Text>
              {!!item.relatedTerms?.length && (
                <Text style={[TextStyles.caption, { color: colors.primary, marginTop: Spacing.sm }]}>
                  See also: {item.relatedTerms.join(', ')}
                </Text>
              )}
            </View>
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
  termRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
