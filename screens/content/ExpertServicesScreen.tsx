// ============================================================
// STAGEY MOBILE — EXPERT SERVICES
// Directory of theatre service providers. Contact via email / phone /
// website (in-app browser). Category filters.
// ============================================================
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ScrollView, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Briefcase, MapPin, Globe, Mail, Phone, Tag } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ServicesAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Chip,
  Badge,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, SERVICE_CATEGORY_LABELS } from '../../constants';

export default function ExpertServicesScreen() {
  const { colors } = useTheme();
  const bottomPad = useListBottomPadding();
  const [category, setCategory] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['theatre-services'],
    queryFn: () => ServicesAPI.getAll(),
  });

  const items = useMemo(
    () => (data ?? []).filter((s) => !category || s.category === category),
    [data, category],
  );

  const categories = Object.keys(SERVICE_CATEGORY_LABELS);

  return (
    <Screen>
      <View style={styles.controls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <Chip label="All" active={category === null} onPress={() => setCategory(null)} testID="chip-service-all" />
          {categories.map((c) => (
            <Chip
              key={c}
              testID={`chip-service-${c}`}
              label={SERVICE_CATEGORY_LABELS[c]}
              active={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <LoadingState label="Loading services…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No services found"
          message="Try a different category."
          icon={<Briefcase size={40} color={colors.mutedForeground} />}
          actionLabel={category ? 'Clear filter' : undefined}
          onAction={() => setCategory(null)}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) => (
            <View
              testID={`card-service-${item.id}`}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={{ flexDirection: 'row' }}>
                {item.logoUrl || item.imageUrl ? (
                  <Image source={{ uri: (item.logoUrl || item.imageUrl)! }} style={styles.logo} contentFit="cover" />
                ) : (
                  <View style={[styles.logo, { backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }]}>
                    <Briefcase size={24} color={colors.mutedForeground} />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={[TextStyles.h4, { color: colors.foreground }]}>{item.businessName}</Text>
                  <Badge label={SERVICE_CATEGORY_LABELS[item.category] ?? item.category} />
                  {!!item.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs }}>
                      <MapPin size={14} color={colors.mutedForeground} />
                      <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                        {item.location}{item.isOnline ? ' • Online' : ''}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {!!item.description && (
                <Text numberOfLines={3} style={[TextStyles.body, { color: colors.foreground, marginTop: Spacing.md }]}>
                  {item.description}
                </Text>
              )}
              {!!item.specialOffer && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm }}>
                  <Tag size={14} color={colors.primary} />
                  <Text style={[TextStyles.caption, { color: colors.primary, marginLeft: 4 }]}>{item.specialOffer}</Text>
                </View>
              )}
              <View style={styles.actions}>
                {!!item.websiteUrl && (
                  <Pressable
                    testID={`button-service-web-${item.id}`}
                    onPress={() => WebBrowser.openBrowserAsync(item.websiteUrl!, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET })}
                    style={[styles.actionBtn, { borderColor: colors.border }]}
                  >
                    <Globe size={16} color={colors.foreground} />
                  </Pressable>
                )}
                {!!item.contactEmail && (
                  <Pressable
                    testID={`button-service-email-${item.id}`}
                    onPress={() => Linking.openURL(`mailto:${item.contactEmail}`)}
                    style={[styles.actionBtn, { borderColor: colors.border }]}
                  >
                    <Mail size={16} color={colors.foreground} />
                  </Pressable>
                )}
                {!!item.contactPhone && (
                  <Pressable
                    testID={`button-service-phone-${item.id}`}
                    onPress={() => Linking.openURL(`tel:${item.contactPhone}`)}
                    style={[styles.actionBtn, { borderColor: colors.border }]}
                  >
                    <Phone size={16} color={colors.foreground} />
                  </Pressable>
                )}
              </View>
            </View>
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
  logo: { width: 56, height: 56, borderRadius: Radius.md },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
