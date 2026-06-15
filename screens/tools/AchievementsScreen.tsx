// ============================================================
// STAGEY MOBILE — ACHIEVEMENTS
// Shows all badges; for the logged-in user marks which are earned and
// surfaces total XP. NEW screen — registered as "Achievements".
// ============================================================
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Award, Lock, Star } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { AchievementsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Badge,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';

const RARITY_COLORS: Record<string, string> = {
  common: '#6B7280',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const bottomPad = useListBottomPadding();
  const { user, isAuthenticated } = useAuth();

  const { data: badges, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['achievement-badges'],
    queryFn: () => AchievementsAPI.getBadges(),
  });

  const { data: userAchievements } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: () => AchievementsAPI.getUserAchievements(user!.id),
    enabled: isAuthenticated && !!user?.id,
  });

  const earnedIds = useMemo(() => new Set((userAchievements ?? []).map((a) => a.badgeId)), [userAchievements]);
  const totalXp = useMemo(
    () =>
      (userAchievements ?? []).reduce((sum, a) => {
        const badge = badges?.find((b) => b.id === a.badgeId) ?? a.badge;
        return sum + (badge?.xpValue ?? 0);
      }, 0),
    [userAchievements, badges],
  );

  if (isLoading) return <Screen><LoadingState label="Loading badges…" /></Screen>;
  if (isError || !badges) return <Screen><ErrorState onRetry={refetch} /></Screen>;
  if (badges.length === 0) {
    return (
      <Screen>
        <EmptyState title="No badges yet" message="Check back soon." icon={<Award size={40} color={colors.mutedForeground} />} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={badges}
        keyExtractor={(item) => String(item.id)}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
        ListHeaderComponent={
          isAuthenticated ? (
            <View style={[styles.xpBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Star size={20} color="#F59E0B" />
              <Text style={[TextStyles.label, { color: colors.foreground, marginLeft: Spacing.sm, flex: 1 }]}>
                {earnedIds.size} of {badges.length} earned
              </Text>
              <Text style={[TextStyles.h4, { color: colors.primary }]}>{totalXp} XP</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const earned = earnedIds.has(item.id);
          const rarityColor = RARITY_COLORS[item.rarity] ?? colors.primary;
          return (
            <View
              testID={`card-badge-${item.id}`}
              style={[styles.card, { backgroundColor: colors.card, borderColor: earned ? rarityColor : colors.border, opacity: earned ? 1 : 0.6 }]}
            >
              <View style={[styles.iconCircle, { backgroundColor: earned ? rarityColor : colors.muted }]}>
                {earned ? (
                  <Text style={styles.iconEmoji}>{item.icon ?? '🏅'}</Text>
                ) : (
                  <Lock size={20} color={colors.mutedForeground} />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                  <Text style={[TextStyles.label, { color: colors.foreground, flex: 1 }]}>{item.name}</Text>
                  <Badge label={item.rarity} color="#fff" bg={rarityColor} />
                </View>
                <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>{item.description}</Text>
                {!!item.xpValue && (
                  <Text style={[TextStyles.caption, { color: colors.primary, marginTop: 2 }]}>+{item.xpValue} XP</Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  xpBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 22 },
});
