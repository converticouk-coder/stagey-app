// ============================================================
// STAGEY MOBILE — COMMUNITY HUB
// Lists community categories. Tap a category → its chats.
// (Registered as both CommunityHub and CommunityCategories.)
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { CommunityAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';

export default function CommunityHubScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();

  const q = useQuery({
    queryKey: ['community-categories'],
    queryFn: () => CommunityAPI.getCategories(),
  });

  const categories = q.data ?? [];

  if (q.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading community…" />
      </Screen>
    );
  }
  if (q.isError) {
    return (
      <Screen>
        <ErrorState onRetry={q.refetch} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        onRefresh={q.refetch}
        refreshing={q.isRefetching}
        contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
        ListEmptyComponent={
          <EmptyState title="No categories yet" message="Check back soon for community chats." />
        }
        renderItem={({ item }) => (
          <Pressable
            testID={`card-category-${item.slug}`}
            onPress={() => navigation.navigate('CommunityChat', { categorySlug: item.slug, title: item.name })}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
              <MessageSquare size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={[TextStyles.h4, { color: colors.foreground }]}>{item.name}</Text>
              {!!item.description && (
                <Text numberOfLines={2} style={[TextStyles.bodySmall, { color: colors.mutedForeground, marginTop: 2 }]}>
                  {item.description}
                </Text>
              )}
              {(item.messageCount != null || item.memberCount != null) && (
                <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 4 }]}>
                  {item.messageCount != null ? `${item.messageCount} messages` : ''}
                  {item.messageCount != null && item.memberCount != null ? ' · ' : ''}
                  {item.memberCount != null ? `${item.memberCount} members` : ''}
                </Text>
              )}
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
