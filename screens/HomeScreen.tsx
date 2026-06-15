// ============================================================
// STAGEY MOBILE — HOME SCREEN
// Curated discovery feed: announcement banner, welcome, quick
// access chips, featured/upcoming shows, new societies, latest
// castings and a news teaser. Pull-to-refresh. Real API data.
// ============================================================
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Drama,
  Users,
  ShoppingBag,
  Newspaper,
  ChevronRight,
  X,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ShowsAPI,
  SocietiesAPI,
  CastingsAPI,
  NewsAPI,
  BannerAPI,
} from '../services/api';
import {
  Screen,
  SectionHeader,
  Card,
  Badge,
  useListBottomPadding,
  formatDateRange,
  timeAgo,
} from '../components/ui';
import {
  TextStyles,
  Spacing,
  Radius,
  PrimaryGradient,
  BannerColors,
  STORAGE_KEYS,
} from '../constants';

const QUICK_LINKS = [
  { label: 'Shows', icon: Calendar, screen: 'Shows' },
  { label: 'Castings', icon: Drama, screen: 'Castings' },
  { label: 'Societies', icon: Users, screen: 'Societies' },
  { label: 'Marketplace', icon: ShoppingBag, screen: 'Market' },
  { label: 'News', icon: Newspaper, screen: 'News' },
] as const;

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const bottomPad = useListBottomPadding();
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const bannerQ = useQuery({
    queryKey: ['banner'],
    queryFn: () => BannerAPI.getActive(),
  });
  const featuredShowsQ = useQuery({
    queryKey: ['home', 'shows'],
    queryFn: () => ShowsAPI.getAll({ limit: 8, featured: true }),
  });
  const upcomingShowsQ = useQuery({
    queryKey: ['home', 'shows', 'upcoming'],
    queryFn: () => ShowsAPI.getAll({ limit: 8 }),
  });
  const societiesQ = useQuery({
    queryKey: ['home', 'societies'],
    queryFn: () => SocietiesAPI.getAll({ limit: 8 }),
  });
  const castingsQ = useQuery({
    queryKey: ['home', 'castings'],
    queryFn: () => CastingsAPI.getAll(),
  });
  const newsQ = useQuery({
    queryKey: ['home', 'news'],
    queryFn: () => NewsAPI.getAll(),
  });

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['home'] });
    bannerQ.refetch();
  }, [queryClient, bannerQ]);

  const refreshing =
    featuredShowsQ.isRefetching ||
    upcomingShowsQ.isRefetching ||
    societiesQ.isRefetching ||
    castingsQ.isRefetching ||
    newsQ.isRefetching;

  const dismissBanner = useCallback(async (id: number) => {
    setDismissedBanner(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DISMISSED_BANNERS, String(id));
    } catch {
      // ignore persistence failure
    }
  }, []);

  const featured = featuredShowsQ.data?.shows ?? [];
  const upcoming = upcomingShowsQ.data?.shows ?? [];
  const heroShows = (featured.length ? featured : upcoming).slice(0, 6);
  const societies = societiesQ.data?.societies ?? [];
  const castings = (castingsQ.data ?? []).filter((c) => c.isOpen).slice(0, 4);
  const news = (newsQ.data ?? []).slice(0, 3);
  const banner = bannerQ.data;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        testID="scroll-home"
      >
        {/* Announcement banner */}
        {banner && !dismissedBanner && (
          <View
            testID="banner-announcement"
            style={[
              styles.banner,
              {
                backgroundColor: BannerColors[banner.type]?.bg ?? colors.card,
                borderColor: BannerColors[banner.type]?.border ?? colors.border,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[TextStyles.h5, { color: BannerColors[banner.type]?.text ?? colors.foreground }]}>
                {banner.title}
              </Text>
              {!!banner.body && (
                <Text
                  style={[
                    TextStyles.bodySmall,
                    { color: BannerColors[banner.type]?.text ?? colors.mutedForeground, marginTop: 2 },
                  ]}
                >
                  {banner.body}
                </Text>
              )}
              {!!banner.ctaText && !!banner.ctaUrl && (
                <Pressable
                  testID="button-banner-cta"
                  onPress={() => banner.ctaUrl && Linking.openURL(banner.ctaUrl)}
                  style={{ marginTop: Spacing.sm }}
                >
                  <Text style={[TextStyles.button, { color: BannerColors[banner.type]?.border ?? colors.primary }]}>
                    {banner.ctaText} →
                  </Text>
                </Pressable>
              )}
            </View>
            <Pressable
              testID="button-dismiss-banner"
              onPress={() => dismissBanner(banner.id)}
              style={{ padding: Spacing.xs }}
            >
              <X size={18} color={BannerColors[banner.type]?.text ?? colors.foreground} />
            </Pressable>
          </View>
        )}

        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={[TextStyles.heroTitle, { color: colors.foreground }]}>
            {isAuthenticated
              ? `Welcome back, ${user?.firstName ?? user?.username ?? ''} 👋`
              : 'Welcome to Stagey ✨'}
          </Text>
          <Text style={[TextStyles.body, { color: colors.mutedForeground, marginTop: Spacing.xs }]}>
            Discover shows, societies, castings and more across community theatre.
          </Text>
        </View>

        {/* Quick access chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRow}
        >
          {QUICK_LINKS.map((q) => {
            const Icon = q.icon;
            return (
              <Pressable
                key={q.label}
                testID={`chip-quick-${q.label}`}
                onPress={() => navigation.navigate(q.screen)}
                style={[styles.quickChip, { backgroundColor: colors.secondary }]}
              >
                <Icon size={18} color={colors.primary} />
                <Text style={[TextStyles.label, { color: colors.foreground, marginTop: 4 }]}>
                  {q.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Featured / upcoming shows */}
        <View style={styles.section}>
          <SectionHeader
            title="On Stage"
            actionLabel="See all"
            onAction={() => navigation.navigate('Shows')}
          />
          {heroShows.length === 0 ? (
            <Text style={[TextStyles.body, { color: colors.mutedForeground }]}>
              {featuredShowsQ.isLoading || upcomingShowsQ.isLoading
                ? 'Loading shows…'
                : 'No shows to feature yet.'}
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {heroShows.map((show) => (
                <Pressable
                  key={show.id}
                  testID={`card-home-show-${show.id}`}
                  onPress={() => navigation.navigate('ShowDetail', { slug: show.slug })}
                  style={[styles.showCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  {show.imageUrl ? (
                    <Image source={{ uri: show.imageUrl }} style={styles.showImg} contentFit="cover" />
                  ) : (
                    <LinearGradient colors={PrimaryGradient.colors} style={styles.showImg} />
                  )}
                  <View style={{ padding: Spacing.md }}>
                    <Text numberOfLines={2} style={[TextStyles.cardTitle, { color: colors.foreground }]}>
                      {show.title}
                    </Text>
                    <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>
                      {show.societyName ?? show.venue ?? 'Community theatre'}
                    </Text>
                    <Text style={[TextStyles.caption, { color: colors.primary, marginTop: 4 }]}>
                      {formatDateRange(show.startDate, show.endDate)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Latest castings */}
        <View style={styles.section}>
          <SectionHeader
            title="Latest Casting Calls"
            actionLabel="See all"
            onAction={() => navigation.navigate('Castings')}
          />
          {castings.length === 0 ? (
            <Text style={[TextStyles.body, { color: colors.mutedForeground }]}>
              {castingsQ.isLoading ? 'Loading castings…' : 'No open castings right now.'}
            </Text>
          ) : (
            castings.map((c) => (
              <Card
                key={c.id}
                testID={`card-home-casting-${c.id}`}
                onPress={() => navigation.navigate('CastingDetail', { id: c.id })}
                style={{ marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={[TextStyles.cardTitle, { color: colors.foreground }]}>
                    {c.title}
                  </Text>
                  <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>
                    {[c.societyName ?? c.company, c.roleType].filter(Boolean).join(' • ')}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.mutedForeground} />
              </Card>
            ))
          )}
        </View>

        {/* New societies */}
        <View style={styles.section}>
          <SectionHeader
            title="New to Stagey"
            actionLabel="See all"
            onAction={() => navigation.navigate('Societies')}
          />
          {societies.length === 0 ? (
            <Text style={[TextStyles.body, { color: colors.mutedForeground }]}>
              {societiesQ.isLoading ? 'Loading societies…' : 'No societies yet.'}
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {societies.map((s) => (
                <Pressable
                  key={s.id}
                  testID={`card-home-society-${s.id}`}
                  onPress={() => navigation.navigate('SocietyProfile', { slug: s.slug })}
                  style={[styles.societyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  {s.logoUrl ? (
                    <Image source={{ uri: s.logoUrl }} style={styles.societyLogo} contentFit="cover" />
                  ) : (
                    <LinearGradient colors={PrimaryGradient.colors} style={styles.societyLogo} />
                  )}
                  <Text numberOfLines={2} style={[TextStyles.label, { color: colors.foreground, marginTop: Spacing.sm, textAlign: 'center' }]}>
                    {s.name}
                  </Text>
                  {!!s.location && (
                    <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground, textAlign: 'center' }]}>
                      {s.location}
                    </Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* News teaser */}
        <View style={styles.section}>
          <SectionHeader
            title="Stagey Buzz"
            actionLabel="See all"
            onAction={() => navigation.navigate('News')}
          />
          {news.length === 0 ? (
            <Text style={[TextStyles.body, { color: colors.mutedForeground }]}>
              {newsQ.isLoading ? 'Loading news…' : 'No news yet.'}
            </Text>
          ) : (
            news.map((n) => (
              <Card
                key={n.id}
                testID={`card-home-news-${n.id}`}
                onPress={() => navigation.navigate('Article', { slug: n.slug })}
                style={{ marginBottom: Spacing.sm }}
              >
                {n.imageUrl && (
                  <Image source={{ uri: n.imageUrl }} style={styles.newsImg} contentFit="cover" />
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  {n.isSponsored && <Badge label="Sponsored" color={colors.warningForeground} bg={colors.warning} />}
                  <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: n.isSponsored ? Spacing.sm : 0 }]}>
                    {timeAgo(n.publishedAt)}
                  </Text>
                </View>
                <Text numberOfLines={2} style={[TextStyles.cardTitle, { color: colors.foreground }]}>
                  {n.title}
                </Text>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: Spacing.screenPadding,
    marginBottom: 0,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  welcome: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.xl },
  quickRow: { paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.lg, gap: Spacing.sm },
  quickChip: {
    width: 76,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginRight: Spacing.sm,
  },
  section: { paddingHorizontal: Spacing.screenPadding, marginTop: Spacing.sectionGap },
  showCard: {
    width: 200,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  showImg: { width: '100%', height: 120 },
  societyCard: {
    width: 120,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: Spacing.md,
  },
  societyLogo: { width: 64, height: 64, borderRadius: Radius.full },
  newsImg: { width: '100%', height: 140, borderRadius: Radius.md, marginBottom: Spacing.sm },
});
