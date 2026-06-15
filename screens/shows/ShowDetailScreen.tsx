// ============================================================
// STAGEY MOBILE — SHOW DETAIL
// Full poster, society/organiser link, dates, venue, ticket
// status + buy link, description. Loading/empty/error states.
// ============================================================
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, Ticket, Building2, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ShowsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  Badge,
  PrimaryButton,
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

export default function ShowDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const slug = route.params?.slug as string;
  const bottomPad = useListBottomPadding();

  const { data: show, isLoading, isError, refetch } = useQuery({
    queryKey: ['show', slug],
    queryFn: () => ShowsAPI.getBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading show…" />
      </Screen>
    );
  }
  if (isError || !show) {
    return (
      <Screen>
        <ErrorState message="We couldn't load this show." onRetry={refetch} />
      </Screen>
    );
  }

  const onSale = show.onSale && show.ticketUrl;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} testID="scroll-show-detail">
        {show.imageUrl ? (
          <Image source={{ uri: show.imageUrl }} style={styles.poster} contentFit="cover" />
        ) : (
          <LinearGradient colors={PrimaryGradient.colors} style={styles.poster} />
        )}

        <View style={styles.body}>
          <View style={{ flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm }}>
            {show.featured && <Badge label="Featured" color="#fff" bg={colors.primary} />}
            {!!show.productionType && (
              <Badge label={PRODUCTION_TYPE_LABELS[show.productionType] ?? show.productionType} />
            )}
            {!!show.genre && <Badge label={show.genre} />}
          </View>

          <Text testID="text-show-title" style={[TextStyles.h1, { color: colors.foreground }]}>
            {show.title}
          </Text>

          {/* Society link */}
          {!!show.societyName && (
            <Pressable
              testID="link-show-society"
              disabled={!show.societySlug}
              onPress={() => show.societySlug && navigation.navigate('SocietyProfile', { slug: show.societySlug })}
              style={[styles.societyRow, { borderColor: colors.border }]}
            >
              <Building2 size={18} color={colors.primary} />
              <Text style={[TextStyles.body, { color: colors.foreground, flex: 1, marginLeft: Spacing.sm }]}>
                {show.societyName}
              </Text>
              {!!show.societySlug && <ChevronRight size={18} color={colors.mutedForeground} />}
            </Pressable>
          )}

          {/* Meta */}
          <View style={styles.metaRow}>
            <Calendar size={18} color={colors.primary} />
            <Text style={[TextStyles.body, { color: colors.foreground, marginLeft: Spacing.sm }]}>
              {formatDateRange(show.startDate, show.endDate)}
            </Text>
          </View>
          {!!(show.venue || show.location) && (
            <View style={styles.metaRow}>
              <MapPin size={18} color={colors.mutedForeground} />
              <Text style={[TextStyles.body, { color: colors.foreground, marginLeft: Spacing.sm }]}>
                {[show.venue, show.location].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}

          {/* Tickets */}
          <View style={{ marginTop: Spacing.xl }}>
            {onSale ? (
              <PrimaryButton
                testID="button-buy-tickets"
                label="Buy Tickets"
                icon={<Ticket size={18} color="#fff" />}
                onPress={() => show.ticketUrl && Linking.openURL(show.ticketUrl)}
              />
            ) : (
              <View style={[styles.notOnSale, { backgroundColor: colors.secondary }]}>
                <Ticket size={18} color={colors.mutedForeground} />
                <Text style={[TextStyles.label, { color: colors.mutedForeground, marginLeft: Spacing.sm }]}>
                  {show.ticketUrl ? 'Tickets not on sale yet' : 'Ticket info coming soon'}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {!!show.description && (
            <View style={{ marginTop: Spacing.xl }}>
              <Text style={[TextStyles.sectionHeader, { color: colors.foreground, marginBottom: Spacing.sm }]}>
                About this show
              </Text>
              <Text style={[TextStyles.bodyLarge, { color: colors.mutedForeground }]}>
                {show.description}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  poster: { width: '100%', height: 280 },
  body: { padding: Spacing.screenPadding },
  societyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.md,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  notOnSale: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.full,
  },
});
