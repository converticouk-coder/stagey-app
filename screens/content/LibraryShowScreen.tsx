// ============================================================
// STAGEY MOBILE — SHOW LIBRARY DETAIL
// Full encyclopaedia entry: synopsis, characters, musical numbers,
// scenes, history and fun facts.
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Music, Users, Sparkles, Calendar as CalendarIcon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { LibraryAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  Badge,
  SectionHeader,
  useListBottomPadding,
  formatDate,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, CHARACTER_TYPE_CONFIG, FUN_FACT_CATEGORY_COLORS } from '../../constants';

export default function LibraryShowScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const slug = route.params?.slug as string;
  const bottomPad = useListBottomPadding();

  const { data: show, isLoading, isError, refetch } = useQuery({
    queryKey: ['library', slug],
    queryFn: () => LibraryAPI.getBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) return <Screen><LoadingState label="Loading show…" /></Screen>;
  if (isError || !show) return <Screen><ErrorState onRetry={refetch} /></Screen>;

  const creators = [
    show.composer && `Music: ${show.composer}`,
    show.lyricist && `Lyrics: ${show.lyricist}`,
    show.bookWriter && `Book: ${show.bookWriter}`,
  ].filter(Boolean);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }}>
        {(show.bannerUrl || show.imageUrl || show.posterUrl) && (
          <Image
            source={{ uri: (show.bannerUrl || show.imageUrl || show.posterUrl)! }}
            style={styles.banner}
            contentFit="cover"
          />
        )}
        <View style={{ padding: Spacing.screenPadding }}>
          <Text testID="text-library-title" style={[TextStyles.h2, { color: colors.foreground }]}>
            {show.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm, flexWrap: 'wrap' }}>
            <Badge label={show.type} />
            {show.originalProductionYear ? <Badge label={String(show.originalProductionYear)} /> : null}
            {!!show.runtime && <Badge label={show.runtime} />}
          </View>
          {creators.length > 0 && (
            <Text style={[TextStyles.body, { color: colors.mutedForeground, marginTop: Spacing.md }]}>
              {creators.join('  •  ')}
            </Text>
          )}

          {!!show.synopsis && (
            <View style={styles.section}>
              <SectionHeader title="Synopsis" />
              <Text style={[TextStyles.body, { color: colors.foreground }]}>{show.synopsis}</Text>
            </View>
          )}

          {!!show.themes?.length && (
            <View style={styles.section}>
              <SectionHeader title="Themes" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs }}>
                {show.themes.map((t, i) => <Badge key={i} label={t} />)}
              </View>
            </View>
          )}

          {!!show.characters?.length && (
            <View style={styles.section}>
              <SectionHeader title="Characters" />
              {show.characters.map((c) => {
                const cfg = c.characterType ? CHARACTER_TYPE_CONFIG[c.characterType] : null;
                return (
                  <View key={c.id} testID={`row-character-${c.id}`} style={[styles.row, { borderColor: colors.border }]}>
                    <Users size={16} color={colors.mutedForeground} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                        <Text style={[TextStyles.label, { color: colors.foreground }]}>{c.name}</Text>
                        {cfg && <Badge label={cfg.label} color="#fff" bg={cfg.color} />}
                      </View>
                      {!!c.voiceType && (
                        <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>{c.voiceType}</Text>
                      )}
                      {!!c.description && (
                        <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>{c.description}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {!!show.musicalNumbers?.length && (
            <View style={styles.section}>
              <SectionHeader title="Musical Numbers" />
              {show.musicalNumbers.map((n) => (
                <View key={n.id} testID={`row-song-${n.id}`} style={[styles.row, { borderColor: colors.border }]}>
                  <Music size={16} color={n.isFamous ? colors.primary : colors.mutedForeground} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <Text style={[TextStyles.label, { color: colors.foreground }]}>
                      {n.act ? `Act ${n.act} — ` : ''}{n.title}
                    </Text>
                    {!!n.sungBy?.length && (
                      <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>{n.sungBy.join(', ')}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {!!show.funFacts?.length && (
            <View style={styles.section}>
              <SectionHeader title="Fun Facts" />
              {show.funFacts.map((f) => (
                <View
                  key={f.id}
                  testID={`card-funfact-${f.id}`}
                  style={[styles.factCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs }}>
                    <Sparkles size={14} color={f.category ? (FUN_FACT_CATEGORY_COLORS[f.category] ?? colors.primary) : colors.primary} />
                    {!!f.category && (
                      <Text style={[TextStyles.badge, { color: f.category ? (FUN_FACT_CATEGORY_COLORS[f.category] ?? colors.primary) : colors.primary }]}>
                        {f.category}
                      </Text>
                    )}
                  </View>
                  <Text style={[TextStyles.body, { color: colors.foreground }]}>{f.fact}</Text>
                </View>
              ))}
            </View>
          )}

          {!!show.history?.length && (
            <View style={styles.section}>
              <SectionHeader title="History" />
              {show.history.map((h) => (
                <View key={h.id} testID={`row-history-${h.id}`} style={[styles.row, { borderColor: colors.border }]}>
                  <CalendarIcon size={16} color={colors.mutedForeground} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <Text style={[TextStyles.label, { color: colors.foreground }]}>{h.title}</Text>
                    <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>
                      {formatDate(h.date)}{h.location ? ` • ${h.location}` : ''}
                    </Text>
                    {!!h.description && (
                      <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>{h.description}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 200 },
  section: { marginTop: Spacing.xl },
  row: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  factCard: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
});
