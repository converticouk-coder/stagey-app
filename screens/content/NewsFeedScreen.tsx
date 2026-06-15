// ============================================================
// STAGEY MOBILE — CURATED NEWS FEED
// Theatre news curated from RSS feeds. Tap → opens source in browser.
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { Rss, ExternalLink, Sparkles } from 'lucide-react-native';
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

export default function NewsFeedScreen() {
  const { colors } = useTheme();
  const bottomPad = useListBottomPadding();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['news-curated'],
    queryFn: () => NewsAPI.getCurated(50),
  });

  async function openArticle(link: string) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await WebBrowser.openBrowserAsync(link, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  }

  return (
    <Screen>
      {isLoading ? (
        <LoadingState label="Loading feed…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No articles yet"
          message="Check back soon for theatre news from around the web."
          icon={<Rss size={40} color={colors.mutedForeground} />}
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
              testID={`card-rss-${item.id}`}
              onPress={() => openArticle(item.link)}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={{ flexDirection: 'row' }}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }]}>
                    <Rss size={20} color={colors.mutedForeground} />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text numberOfLines={3} style={[TextStyles.label, { color: colors.foreground }]}>{item.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs }}>
                    <Text style={[TextStyles.caption, { color: colors.mutedForeground, flex: 1 }]}>
                      {item.feedName}{item.publishedAt ? ` • ${timeAgo(item.publishedAt)}` : ''}
                    </Text>
                    <ExternalLink size={14} color={colors.mutedForeground} />
                  </View>
                </View>
              </View>
              {!!item.stageyTake && (
                <View style={[styles.take, { borderColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Sparkles size={12} color={colors.primary} />
                    <Text style={[TextStyles.badge, { color: colors.primary, marginLeft: 4 }]}>Stagey's take</Text>
                  </View>
                  <Text style={[TextStyles.caption, { color: colors.foreground }]}>{item.stageyTake}</Text>
                </View>
              )}
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
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
  thumb: { width: 72, height: 72, borderRadius: Radius.md },
  take: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
