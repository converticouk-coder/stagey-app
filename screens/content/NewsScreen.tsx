// ============================================================
// STAGEY MOBILE — NEWS (editorial)
// Stagey's own articles. Tap → Article. Link to curated NewsFeed.
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Newspaper, Rss } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { NewsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Badge,
  useListBottomPadding,
  timeAgo,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';

export default function NewsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['news'],
    queryFn: () => NewsAPI.getAll(),
  });

  return (
    <Screen>
      <Pressable
        testID="button-news-feed"
        onPress={() => navigation.navigate('NewsFeed')}
        style={[styles.feedLink, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Rss size={18} color={colors.primary} />
        <Text style={[TextStyles.label, { color: colors.foreground, flex: 1, marginLeft: Spacing.sm }]}>
          Theatre news from around the web
        </Text>
        <Text style={[TextStyles.caption, { color: colors.primary }]}>View feed →</Text>
      </Pressable>

      {isLoading ? (
        <LoadingState label="Loading news…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No articles yet"
          message="Check back soon for the latest from Stagey."
          icon={<Newspaper size={40} color={colors.mutedForeground} />}
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
              testID={`card-article-${item.id}`}
              onPress={() => navigation.navigate('Article', { slug: item.slug })}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.cover} contentFit="cover" />
              )}
              <View style={{ padding: Spacing.cardPadding }}>
                <View style={{ flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.xs, flexWrap: 'wrap' }}>
                  {item.isSponsored && <Badge label={item.sponsorLabel || 'Sponsored'} color="#fff" bg={colors.primary} />}
                  {item.isFeatured && <Badge label="Featured" />}
                </View>
                <Text numberOfLines={2} style={[TextStyles.h4, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: Spacing.xs }]}>
                  {[item.authorFirstName, item.authorLastName].filter(Boolean).join(' ') || 'Stagey'}
                  {item.publishedAt ? ` • ${timeAgo(item.publishedAt)}` : ''}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  feedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.screenPadding,
    marginBottom: 0,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cover: { width: '100%', height: 160 },
});
