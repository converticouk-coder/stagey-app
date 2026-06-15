// ============================================================
// STAGEY MOBILE — COMPETITIONS (browse)
// Browse active & past competitions. Tap → CompetitionDetail.
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Trophy, Users as UsersIcon, Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { CompetitionsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Badge,
  useListBottomPadding,
  formatDate,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';

const STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  ended: '#6B7280',
  cancelled: '#EF4444',
  draft: '#F59E0B',
};

export default function CompetitionsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['competitions'],
    queryFn: () => CompetitionsAPI.getAll(),
  });

  return (
    <Screen>
      {isLoading ? (
        <LoadingState label="Loading competitions…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No competitions right now"
          message="Check back soon for your chance to win."
          icon={<Trophy size={40} color={colors.mutedForeground} />}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) => (
            <Pressable
              testID={`card-competition-${item.id}`}
              onPress={() => navigation.navigate('CompetitionDetail', { slug: item.slug })}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.cover} contentFit="cover" />}
              <View style={{ padding: Spacing.cardPadding }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                  <Text numberOfLines={2} style={[TextStyles.h4, { color: colors.foreground, flex: 1 }]}>
                    {item.title}
                  </Text>
                  <Badge label={item.status} color="#fff" bg={STATUS_COLORS[item.status] ?? colors.primary} />
                </View>
                {!!item.shortDescription && (
                  <Text numberOfLines={2} style={[TextStyles.body, { color: colors.mutedForeground, marginTop: Spacing.xs }]}>
                    {item.shortDescription}
                  </Text>
                )}
                <View style={styles.footRow}>
                  {!!item.endsAt && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Clock size={14} color={colors.mutedForeground} />
                      <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                        {item.status === 'active' ? `Closes ${formatDate(item.endsAt)}` : `Ended ${formatDate(item.endsAt)}`}
                      </Text>
                    </View>
                  )}
                  {item.totalEntries != null && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <UsersIcon size={14} color={colors.mutedForeground} />
                      <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                        {item.totalEntries} entries
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cover: { width: '100%', height: 150 },
  footRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
