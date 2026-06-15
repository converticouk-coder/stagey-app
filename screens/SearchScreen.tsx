// ============================================================
// STAGEY MOBILE — GLOBAL SEARCH MODAL
// Full-screen search across All / Marketplace / Societies /
// Shows / Castings / Community / News. Each category queries its
// own endpoint; "All" fans out across the core entity endpoints.
// ============================================================
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  ShowsAPI,
  SocietiesAPI,
  CastingsAPI,
  MarketplaceAPI,
  NewsAPI,
  CommunityAPI,
} from '../services/api';
import { LoadingState, EmptyState, ErrorState } from '../components/ui';
import { TextStyles, Spacing, Radius } from '../constants';

type Category = 'All' | 'Shows' | 'Societies' | 'Castings' | 'Marketplace' | 'Community' | 'News';
const CATEGORIES: Category[] = ['All', 'Shows', 'Societies', 'Castings', 'Marketplace', 'Community', 'News'];

interface ResultRow {
  key: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  category: string;
  onPress: () => void;
}

function useDebounced(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const debouncedQuery = useDebounced(query.trim());
  const enabled = debouncedQuery.length >= 2;

  const wants = (c: Category) => category === 'All' || category === c;

  const showsQ = useQuery({
    queryKey: ['search', 'shows', debouncedQuery],
    queryFn: () => ShowsAPI.getAll({ q: debouncedQuery, limit: 20 }),
    enabled: enabled && wants('Shows'),
  });
  const societiesQ = useQuery({
    queryKey: ['search', 'societies', debouncedQuery],
    queryFn: () => SocietiesAPI.getAll({ q: debouncedQuery, limit: 20 }),
    enabled: enabled && wants('Societies'),
  });
  const castingsQ = useQuery({
    queryKey: ['search', 'castings', debouncedQuery],
    queryFn: () => CastingsAPI.getAll(),
    enabled: enabled && wants('Castings'),
  });
  const marketplaceQ = useQuery({
    queryKey: ['search', 'marketplace', debouncedQuery],
    queryFn: () => MarketplaceAPI.getAll({ q: debouncedQuery, limit: 20 }),
    enabled: enabled && wants('Marketplace'),
  });
  const newsQ = useQuery({
    queryKey: ['search', 'news', debouncedQuery],
    queryFn: () => NewsAPI.getAll(),
    enabled: enabled && wants('News'),
  });
  const communityQ = useQuery({
    queryKey: ['search', 'community', debouncedQuery],
    queryFn: () => CommunityAPI.getCategories(),
    enabled: enabled && wants('Community'),
  });

  const activeQueries = [
    wants('Shows') && showsQ,
    wants('Societies') && societiesQ,
    wants('Castings') && castingsQ,
    wants('Marketplace') && marketplaceQ,
    wants('News') && newsQ,
    wants('Community') && communityQ,
  ].filter(Boolean) as { isLoading: boolean; isError: boolean; refetch: () => void }[];

  const isLoading = enabled && activeQueries.some((q) => q.isLoading);
  const isError = enabled && activeQueries.length > 0 && activeQueries.every((q) => q.isError);

  const ql = debouncedQuery.toLowerCase();
  const results = useMemo<ResultRow[]>(() => {
    if (!enabled) return [];
    const rows: ResultRow[] = [];

    if (wants('Shows')) {
      (showsQ.data?.shows ?? []).forEach((s) =>
        rows.push({
          key: `show-${s.id}`,
          title: s.title,
          subtitle: s.societyName ?? s.venue ?? 'Show',
          imageUrl: s.imageUrl,
          category: 'Show',
          onPress: () => navigation.navigate('ShowDetail', { slug: s.slug }),
        }),
      );
    }
    if (wants('Societies')) {
      (societiesQ.data?.societies ?? []).forEach((s) =>
        rows.push({
          key: `society-${s.id}`,
          title: s.name,
          subtitle: s.location ?? 'Society',
          imageUrl: s.logoUrl,
          category: 'Society',
          onPress: () => navigation.navigate('SocietyProfile', { slug: s.slug }),
        }),
      );
    }
    if (wants('Castings')) {
      (castingsQ.data ?? [])
        .filter(
          (c) =>
            c.title?.toLowerCase().includes(ql) ||
            c.showName?.toLowerCase().includes(ql) ||
            c.societyName?.toLowerCase().includes(ql),
        )
        .forEach((c) =>
          rows.push({
            key: `casting-${c.id}`,
            title: c.title,
            subtitle: c.societyName ?? c.company ?? 'Casting call',
            imageUrl: c.imageUrl,
            category: 'Casting',
            onPress: () => navigation.navigate('CastingDetail', { id: c.id }),
          }),
        );
    }
    if (wants('Marketplace')) {
      (marketplaceQ.data ?? []).forEach((m) =>
        rows.push({
          key: `market-${m.id}`,
          title: m.title,
          subtitle: m.location ?? 'Marketplace',
          imageUrl: m.imageUrls?.[0],
          category: 'Marketplace',
          onPress: () => navigation.navigate('MarketplaceItem', { slug: m.slug }),
        }),
      );
    }
    if (wants('Community')) {
      (communityQ.data ?? [])
        .filter(
          (c) =>
            c.name?.toLowerCase().includes(ql) ||
            c.description?.toLowerCase().includes(ql),
        )
        .forEach((c) =>
          rows.push({
            key: `community-${c.id}`,
            title: c.name,
            subtitle: c.description ?? 'Community',
            category: 'Community',
            onPress: () => navigation.navigate('CommunityCategories'),
          }),
        );
    }
    if (wants('News')) {
      (newsQ.data ?? [])
        .filter((n) => n.title?.toLowerCase().includes(ql))
        .forEach((n) =>
          rows.push({
            key: `news-${n.id}`,
            title: n.title,
            subtitle: 'News',
            imageUrl: n.imageUrl,
            category: 'News',
            onPress: () => navigation.navigate('Article', { slug: n.slug }),
          }),
        );
    }
    return rows;
  }, [enabled, category, ql, showsQ.data, societiesQ.data, castingsQ.data, marketplaceQ.data, communityQ.data, newsQ.data, navigation]);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Search bar */}
      <View style={styles.header}>
        <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <SearchIcon size={18} color={colors.mutedForeground} />
          <TextInput
            testID="input-search"
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Search Stagey…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable testID="button-clear-search" onPress={() => setQuery('')}>
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
        <Pressable testID="button-close-search" onPress={() => navigation.goBack()} style={{ paddingLeft: Spacing.md }}>
          <Text style={[TextStyles.button, { color: colors.primary }]}>Cancel</Text>
        </Pressable>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={{ flexGrow: 0 }}
      >
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            testID={`tab-search-${c}`}
            onPress={() => setCategory(c)}
            style={[
              styles.tab,
              {
                backgroundColor: category === c ? colors.primary : colors.secondary,
                borderColor: category === c ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[TextStyles.label, { color: category === c ? '#fff' : colors.foreground }]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results */}
      {!enabled ? (
        <EmptyState
          title="Search Stagey"
          message="Type at least 2 characters to search shows, societies, castings, marketplace and more."
          icon={<SearchIcon size={40} color={colors.mutedForeground} />}
        />
      ) : isLoading ? (
        <LoadingState label="Searching…" />
      ) : isError ? (
        <ErrorState onRetry={() => activeQueries.forEach((q) => q.refetch())} />
      ) : results.length === 0 ? (
        <EmptyState title="No results" message={`Nothing found for "${debouncedQuery}".`} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.key}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
          renderItem={({ item }) => (
            <Pressable
              testID={`result-${item.key}`}
              onPress={item.onPress}
              style={[styles.row, { borderBottomColor: colors.border }]}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, { backgroundColor: colors.secondary }]} />
              )}
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text numberOfLines={1} style={[TextStyles.cardTitle, { color: colors.foreground }]}>
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground }]}>
                  {item.subtitle}
                </Text>
              </View>
              <View style={[styles.catBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[TextStyles.badge, { color: colors.mutedForeground }]}>{item.category}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: Spacing.sm, ...TextStyles.body },
  tabs: { paddingHorizontal: Spacing.screenPadding, paddingBottom: Spacing.md, gap: Spacing.sm },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 48, height: 48, borderRadius: Radius.sm },
  catBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
  },
});
