// ============================================================
// STAGEY MOBILE — MARKETPLACE BROWSE
// Two-column grid of listings with search, category chips and a
// sale-type filter. Tap → MarketplaceItem.
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
import { Search as SearchIcon, ShoppingBag, MapPin } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Chip,
  Badge,
  useListBottomPadding,
  formatPrice,
} from '../../components/ui';
import { MarketplaceAPI } from '../../services/api';
import {
  TextStyles,
  Spacing,
  Radius,
  MARKETPLACE_CATEGORIES,
  SALE_TYPE_LABELS,
} from '../../constants';

const SALE_TYPES = ['buy', 'hire', 'free'];

export default function MarketplaceScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const [search, setSearch] = useState('');
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [saleType, setSaleType] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['marketplace', search, saleType],
    queryFn: () =>
      MarketplaceAPI.getAll({
        q: search || undefined,
        saleType: saleType || undefined,
        limit: 60,
      }),
  });

  const category = MARKETPLACE_CATEGORIES[categoryIdx];
  const items = useMemo(() => {
    const all = data ?? [];
    if (!category?.types) return all;
    const set = new Set(category.types as readonly string[]);
    return all.filter((i) => set.has(i.type));
  }, [data, category]);

  return (
    <Screen>
      <View style={styles.controls}>
        <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <SearchIcon size={18} color={colors.mutedForeground} />
          <TextInput
            testID="input-marketplace-search"
            value={search}
            onChangeText={setSearch}
            placeholder="Search marketplace…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {MARKETPLACE_CATEGORIES.map((c, i) => (
            <Chip
              key={c.label}
              testID={`chip-category-${c.label}`}
              label={c.label}
              active={categoryIdx === i}
              onPress={() => setCategoryIdx(i)}
            />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Chip label="Any" active={saleType === null} onPress={() => setSaleType(null)} testID="chip-saletype-any" />
          {SALE_TYPES.map((s) => (
            <Chip
              key={s}
              testID={`chip-saletype-${s}`}
              label={SALE_TYPE_LABELS[s] ?? s}
              active={saleType === s}
              onPress={() => setSaleType(s)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingState label="Loading marketplace…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          message="No listings match your filters."
          icon={<ShoppingBag size={40} color={colors.mutedForeground} />}
          actionLabel={search || saleType || categoryIdx !== 0 ? 'Clear filters' : undefined}
          onAction={() => {
            setSearch('');
            setSaleType(null);
            setCategoryIdx(0);
          }}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: Spacing.md }}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad, gap: Spacing.md }}
          renderItem={({ item }) => (
            <Pressable
              testID={`card-marketplace-${item.id}`}
              onPress={() => navigation.navigate('MarketplaceItem', { slug: item.slug })}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {item.imageUrls && item.imageUrls.length > 0 ? (
                <Image source={{ uri: item.imageUrls[0] }} style={styles.cardImg} contentFit="cover" />
              ) : (
                <View style={[styles.cardImg, { backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }]}>
                  <ShoppingBag size={28} color={colors.mutedForeground} />
                </View>
              )}
              <View style={{ padding: Spacing.md }}>
                <Text numberOfLines={2} style={[TextStyles.cardTitle, { color: colors.foreground }]}>
                  {item.title}
                </Text>
                <Text style={[TextStyles.h5, { color: colors.primary, marginTop: 4 }]}>
                  {formatPrice(item.price, item.isFree, item.saleType)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: Spacing.xs, flexWrap: 'wrap' }}>
                  <Badge label={SALE_TYPE_LABELS[item.saleType] ?? item.saleType} />
                  {!!item.condition && <Badge label={item.condition} />}
                </View>
                {!!item.location && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <MapPin size={12} color={colors.mutedForeground} />
                    <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                      {item.location}
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
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardImg: { width: '100%', height: 130 },
});
