// ============================================================
// STAGEY MOBILE — MASTERCLASSES (browse)
// Browse paid & free coaching masterclasses. Tap → MasterclassDetail.
// ============================================================
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { GraduationCap, Star, Clock, User as UserIcon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MasterclassesAPI } from '../../services/api';
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

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

function priceLabel(price: string, isPaid?: boolean | null): string {
  const amount = parseFloat(price);
  if (!isPaid || isNaN(amount) || amount === 0) return 'Free';
  return `£${amount.toFixed(2).replace(/\.00$/, '')}`;
}

export default function MasterclassesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const [level, setLevel] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['masterclasses'],
    queryFn: () => MasterclassesAPI.getAll(),
  });

  const items = useMemo(
    () => (data ?? []).filter((m) => !level || m.level === level),
    [data, level],
  );

  return (
    <Screen>
      <View style={styles.controls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <Chip label="All" active={level === null} onPress={() => setLevel(null)} testID="chip-level-all" />
          {LEVELS.map((l) => (
            <Chip key={l} testID={`chip-level-${l}`} label={l} active={level === l} onPress={() => setLevel(l)} />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingState label="Loading masterclasses…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No masterclasses yet"
          message="Check back soon for expert coaching."
          icon={<GraduationCap size={40} color={colors.mutedForeground} />}
          actionLabel={level ? 'Clear filter' : undefined}
          onAction={() => setLevel(null)}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) => (
            <Pressable
              testID={`card-masterclass-${item.id}`}
              onPress={() => navigation.navigate('MasterclassDetail', { id: item.id })}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.cover} contentFit="cover" />
              ) : (
                <View style={[styles.cover, { backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }]}>
                  <GraduationCap size={32} color={colors.mutedForeground} />
                </View>
              )}
              <View style={{ padding: Spacing.cardPadding }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                  <Text numberOfLines={2} style={[TextStyles.h4, { color: colors.foreground, flex: 1 }]}>
                    {item.title}
                  </Text>
                  <Badge label={priceLabel(item.price, item.isPaid)} color="#fff" bg={colors.primary} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.md, flexWrap: 'wrap' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <UserIcon size={14} color={colors.mutedForeground} />
                    <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>{item.instructor}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Clock size={14} color={colors.mutedForeground} />
                    <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>{item.duration}</Text>
                  </View>
                  {!!item.rating && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Star size={14} color={colors.primary} fill={colors.primary} />
                      <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>{item.rating}</Text>
                    </View>
                  )}
                </View>
                <Badge label={item.level} />
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
  filterRow: { flexGrow: 0 },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cover: { width: '100%', height: 160 },
});
