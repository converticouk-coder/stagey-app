// ============================================================
// STAGEY MOBILE — SHOWS BROWSE
// Browse the show listings with a search field, quick date-range
// filters and a production-type filter. Tap a card → ShowDetail.
// ============================================================
import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Search as SearchIcon, MapPin, Calendar } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ShowsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Chip,
  Badge,
  useListBottomPadding,
  formatDateRange,
} from '../../components/ui';
import {
  TextStyles,
  Spacing,
  Radius,
  PrimaryGradient,
  PRODUCTION_TYPE_LABELS,
} from '../../constants';

type DateFilter = 'all' | 'week' | 'month' | 'upcoming';

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'upcoming', label: 'Upcoming' },
];

const PROD_FILTERS = ['amateur', 'youth', 'professional', 'semi_professional'];

function dateRange(filter: DateFilter): { startDate?: string; endDate?: string } {
  const now = new Date();
  const startDate = now.toISOString().slice(0, 10);
  if (filter === 'week') {
    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    return { startDate, endDate: end.toISOString().slice(0, 10) };
  }
  if (filter === 'month') {
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);
    return { startDate, endDate: end.toISOString().slice(0, 10) };
  }
  if (filter === 'upcoming') {
    return { startDate };
  }
  return {};
}

export default function ShowsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [prodType, setProdType] = useState<string | null>(null);

  const { startDate, endDate } = dateRange(dateFilter);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['shows', search, dateFilter, prodType],
    queryFn: () =>
      ShowsAPI.getAll({
        q: search || undefined,
        startDate,
        endDate,
        productionType: prodType || undefined,
        limit: 50,
      }),
  });

  const shows = data?.shows ?? [];

  return (
    <Screen>
      <View style={styles.controls}>
        <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <SearchIcon size={18} color={colors.mutedForeground} />
          <TextInput
            testID="input-shows-search"
            value={search}
            onChangeText={setSearch}
            placeholder="Search shows…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {DATE_FILTERS.map((f) => (
            <Chip
              key={f.key}
              testID={`chip-date-${f.key}`}
              label={f.label}
              active={dateFilter === f.key}
              onPress={() => setDateFilter(f.key)}
            />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Chip label="All types" active={prodType === null} onPress={() => setProdType(null)} testID="chip-prod-all" />
          {PROD_FILTERS.map((p) => (
            <Chip
              key={p}
              testID={`chip-prod-${p}`}
              label={PRODUCTION_TYPE_LABELS[p] ?? p}
              active={prodType === p}
              onPress={() => setProdType(p)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingState label="Loading shows…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : shows.length === 0 ? (
        <EmptyState
          title="No shows found"
          message="Try adjusting your filters or search."
          icon={<Calendar size={40} color={colors.mutedForeground} />}
          actionLabel={search || prodType || dateFilter !== 'all' ? 'Clear filters' : undefined}
          onAction={() => {
            setSearch('');
            setProdType(null);
            setDateFilter('all');
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
              testID={`card-show-${item.id}`}
              onPress={() => navigation.navigate('ShowDetail', { slug: item.slug })}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImg} contentFit="cover" />
              ) : (
                <LinearGradient colors={PrimaryGradient.colors} style={styles.cardImg} />
              )}
              <View style={{ padding: Spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: Spacing.xs }}>
                  {item.featured && <Badge label="Featured" color="#fff" bg={colors.primary} />}
                  {!!item.productionType && (
                    <Badge label={PRODUCTION_TYPE_LABELS[item.productionType] ?? item.productionType} />
                  )}
                </View>
                <Text numberOfLines={2} style={[TextStyles.h4, { color: colors.foreground }]}>
                  {item.title}
                </Text>
                {!!item.societyName && (
                  <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>
                    {item.societyName}
                  </Text>
                )}
                <View style={styles.metaRow}>
                  <Calendar size={14} color={colors.primary} />
                  <Text style={[TextStyles.caption, { color: colors.primary, marginLeft: 4 }]}>
                    {formatDateRange(item.startDate, item.endDate)}
                  </Text>
                </View>
                {!!(item.venue || item.location) && (
                  <View style={styles.metaRow}>
                    <MapPin size={14} color={colors.mutedForeground} />
                    <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                      {[item.venue, item.location].filter(Boolean).join(', ')}
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
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardImg: { width: '100%', height: 160 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
});
