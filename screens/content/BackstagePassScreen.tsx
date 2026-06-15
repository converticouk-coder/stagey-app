// ============================================================
// STAGEY MOBILE — BACKSTAGE PASS (guides library)
// Public long-form guides grouped by section. Cards with an
// interactive web version show a ✨ badge. Tap → GuideDetail.
// ============================================================
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { GuidesAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Chip,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, GUIDE_SECTIONS } from '../../constants';
import type { ParentResource } from '../../types';

const SECTION_LABELS: Record<string, string> = {
  ...Object.fromEntries(GUIDE_SECTIONS.map((s) => [s.key, s.label])),
  adult_performers: 'Adult Performers',
};

export default function BackstagePassScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const [section, setSection] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['guides'],
    queryFn: () => GuidesAPI.getAll(),
  });

  const sections = useMemo(() => {
    const filtered = (data ?? []).filter((g) => !section || g.section === section);
    const bySection = new Map<string, ParentResource[]>();
    filtered.forEach((g) => {
      const arr = bySection.get(g.section) ?? [];
      arr.push(g);
      bySection.set(g.section, arr);
    });
    return Array.from(bySection.entries()).map(([key, items]) => ({
      title: SECTION_LABELS[key] ?? key,
      data: items.sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title)),
    }));
  }, [data, section]);

  const sectionKeys = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((g) => set.add(g.section));
    return Array.from(set);
  }, [data]);

  if (isLoading) return <Screen><LoadingState label="Loading guides…" /></Screen>;
  if (isError) return <Screen><ErrorState onRetry={refetch} /></Screen>;

  return (
    <Screen>
      <View style={styles.controls}>
        <SectionList
          horizontal
          showsHorizontalScrollIndicator={false}
          sections={[]}
          ListHeaderComponent={
            <View style={{ flexDirection: 'row' }}>
              <Chip label="All" active={section === null} onPress={() => setSection(null)} testID="chip-section-all" />
              {sectionKeys.map((k) => (
                <Chip
                  key={k}
                  testID={`chip-section-${k}`}
                  label={SECTION_LABELS[k] ?? k}
                  active={section === k}
                  onPress={() => setSection(k)}
                />
              ))}
            </View>
          }
          renderItem={() => null}
          keyExtractor={(_, i) => String(i)}
          style={{ flexGrow: 0 }}
        />
      </View>

      {sections.length === 0 ? (
        <EmptyState
          title="No guides found"
          message="Try a different section."
          icon={<BookOpen size={40} color={colors.mutedForeground} />}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderSectionHeader={({ section: s }) => (
            <Text style={[TextStyles.sectionHeader, { color: colors.foreground, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
              {s.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <Pressable
              testID={`card-guide-${item.id}`}
              onPress={() => navigation.navigate('GuideDetail', { slug: item.slug })}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                  <Text style={[TextStyles.label, { color: colors.foreground, flex: 1 }]}>{item.title}</Text>
                  {!!item.interactiveUrl && <Sparkles size={16} color={colors.primary} />}
                </View>
                <Text numberOfLines={2} style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>
                  {item.shortDescription}
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
  controls: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
});
