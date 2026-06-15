// ============================================================
// STAGEY MOBILE — ARTICLE DETAIL
// Renders a single editorial news article (HTML / rich body).
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { ExternalLink } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { NewsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  Badge,
  PrimaryButton,
  useListBottomPadding,
  timeAgo,
} from '../../components/ui';
import RichText from '../../components/RichText';
import { TextStyles, Spacing } from '../../constants';

export default function ArticleScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const slug = route.params?.slug as string;
  const bottomPad = useListBottomPadding();

  const { data: article, isLoading, isError, refetch } = useQuery({
    queryKey: ['news', slug],
    queryFn: () => NewsAPI.getBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) return <Screen><LoadingState label="Loading article…" /></Screen>;
  if (isError || !article) return <Screen><ErrorState onRetry={refetch} /></Screen>;

  const author = [article.authorFirstName, article.authorLastName].filter(Boolean).join(' ') || 'Stagey';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }}>
        {article.imageUrl && (
          <Image source={{ uri: article.imageUrl }} style={styles.cover} contentFit="cover" />
        )}
        <View style={{ padding: Spacing.screenPadding }}>
          {(article.isSponsored || article.isFeatured) && (
            <View style={{ flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm }}>
              {article.isSponsored && <Badge label={article.sponsorLabel || 'Sponsored'} color="#fff" bg={colors.primary} />}
              {article.isFeatured && <Badge label="Featured" />}
            </View>
          )}
          <Text testID="text-article-title" style={[TextStyles.h2, { color: colors.foreground }]}>
            {article.title}
          </Text>
          <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: Spacing.xs, marginBottom: Spacing.lg }]}>
            {author}{article.publishedAt ? ` • ${timeAgo(article.publishedAt)}` : ''}
          </Text>

          <RichText html={article.body} />

          {!!article.ctaUrl && (
            <View style={{ marginTop: Spacing.lg }}>
              <PrimaryButton
                testID="button-article-cta"
                label={article.ctaText || 'Learn more'}
                icon={<ExternalLink size={16} color="#fff" />}
                onPress={() =>
                  WebBrowser.openBrowserAsync(article.ctaUrl!, {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                  })
                }
              />
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 200 },
});
