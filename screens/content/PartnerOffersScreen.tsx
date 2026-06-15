// ============================================================
// STAGEY MOBILE — PARTNER OFFERS
// Member discounts. Copy promo code (clipboard) + redeem (in-app browser).
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { Gift, Copy, ExternalLink, Tag } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { OffersAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Badge,
  PrimaryButton,
  useListBottomPadding,
  formatDate,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';

export default function PartnerOffersScreen() {
  const { colors } = useTheme();
  const bottomPad = useListBottomPadding();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['partner-offers'],
    queryFn: () => OffersAPI.getAll(),
  });

  async function copyCode(code: string) {
    await Clipboard.setStringAsync(code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({ type: 'success', text1: 'Code copied', text2: code });
  }

  async function redeem(url: string) {
    await WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
  }

  return (
    <Screen>
      {isLoading ? (
        <LoadingState label="Loading offers…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No offers right now"
          message="Check back soon for member discounts."
          icon={<Gift size={40} color={colors.mutedForeground} />}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) => (
            <View
              testID={`card-offer-${item.id}`}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.cover} contentFit="cover" />}
              <View style={{ padding: Spacing.cardPadding }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                  {item.partnerLogoUrl && <Image source={{ uri: item.partnerLogoUrl }} style={styles.partnerLogo} contentFit="contain" />}
                  <Text style={[TextStyles.caption, { color: colors.mutedForeground, flex: 1 }]}>{item.partnerName}</Text>
                  {item.featured && <Badge label="Featured" color="#fff" bg={colors.primary} />}
                </View>
                <Text style={[TextStyles.h4, { color: colors.foreground, marginTop: Spacing.xs }]}>{item.title}</Text>
                {!!item.discountAmount && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs }}>
                    <Tag size={14} color={colors.primary} />
                    <Text style={[TextStyles.label, { color: colors.primary, marginLeft: 4 }]}>{item.discountAmount}</Text>
                  </View>
                )}
                <Text style={[TextStyles.body, { color: colors.foreground, marginTop: Spacing.sm }]}>{item.description}</Text>
                {!!item.promoCode && (
                  <Pressable
                    testID={`button-offer-copy-${item.id}`}
                    onPress={() => copyCode(item.promoCode!)}
                    style={[styles.codeBox, { borderColor: colors.primary }]}
                  >
                    <Text style={[TextStyles.label, { color: colors.primary, flex: 1 }]}>{item.promoCode}</Text>
                    <Copy size={16} color={colors.primary} />
                  </Pressable>
                )}
                {!!item.expiryDate && (
                  <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: Spacing.sm }]}>
                    Expires {formatDate(item.expiryDate)}
                  </Text>
                )}
                <View style={{ marginTop: Spacing.md }}>
                  <PrimaryButton
                    testID={`button-offer-redeem-${item.id}`}
                    label="Redeem offer"
                    icon={<ExternalLink size={16} color="#fff" />}
                    onPress={() => redeem(item.redirectUrl)}
                  />
                </View>
              </View>
            </View>
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
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cover: { width: '100%', height: 140 },
  partnerLogo: { width: 24, height: 24, borderRadius: Radius.sm },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
