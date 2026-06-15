// ============================================================
// STAGEY MOBILE — MASTERCLASS DETAIL
// Shows overview + modules. If the user has access, plays the video
// (expo-video). Otherwise offers a Stripe checkout / free enrol via
// an in-app browser (expo-web-browser).
// ============================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { GraduationCap, Clock, User as UserIcon, CheckCircle, Lock, PlayCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { MasterclassesAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  Badge,
  SectionHeader,
  PrimaryButton,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';

function priceLabel(price: string, isPaid?: boolean | null): string {
  const amount = parseFloat(price);
  if (!isPaid || isNaN(amount) || amount === 0) return 'Free';
  return `£${amount.toFixed(2).replace(/\.00$/, '')}`;
}

function VideoPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return (
    <VideoView
      testID="video-masterclass"
      player={player}
      style={styles.video}
      allowsFullscreen
      allowsPictureInPicture
      contentFit="contain"
    />
  );
}

export default function MasterclassDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const id = route.params?.id as number;
  const bottomPad = useListBottomPadding();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const { data: mc, isLoading, isError, refetch } = useQuery({
    queryKey: ['masterclass', id],
    queryFn: () => MasterclassesAPI.getById(id),
    enabled: id != null,
  });

  async function handleCheckout() {
    if (!mc) return;
    if (!isAuthenticated) {
      Toast.show({ type: 'info', text1: 'Sign in required', text2: 'Please sign in to enrol.' });
      return;
    }
    setBusy(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await MasterclassesAPI.checkout(mc.id);
      if (result.free) {
        Toast.show({ type: 'success', text1: 'Enrolled!', text2: result.message ?? 'You now have access.' });
        await queryClient.invalidateQueries({ queryKey: ['masterclass', id] });
      } else if (result.url) {
        await WebBrowser.openBrowserAsync(result.url, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        });
        await queryClient.invalidateQueries({ queryKey: ['masterclass', id] });
      } else {
        Toast.show({ type: 'error', text1: 'Could not start checkout' });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Checkout failed', text2: e?.message });
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <Screen><LoadingState label="Loading masterclass…" /></Screen>;
  if (isError || !mc) return <Screen><ErrorState onRetry={refetch} /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }}>
        {mc.canAccess && mc.videoUrl ? (
          <VideoPlayer uri={mc.videoUrl} />
        ) : mc.imageUrl ? (
          <Image source={{ uri: mc.imageUrl }} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={[styles.cover, { backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }]}>
            <GraduationCap size={40} color={colors.mutedForeground} />
          </View>
        )}

        <View style={{ padding: Spacing.screenPadding }}>
          <Text testID="text-masterclass-title" style={[TextStyles.h2, { color: colors.foreground }]}>
            {mc.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.md, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <UserIcon size={14} color={colors.mutedForeground} />
              <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                {mc.instructor}{mc.instructorRole ? ` · ${mc.instructorRole}` : ''}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={14} color={colors.mutedForeground} />
              <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>{mc.duration}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm }}>
            <Badge label={mc.level} />
            <Badge label={priceLabel(mc.price, mc.isPaid)} color="#fff" bg={colors.primary} />
          </View>

          {!mc.canAccess && (
            <View style={{ marginTop: Spacing.lg }}>
              <PrimaryButton
                testID="button-masterclass-enrol"
                label={priceLabel(mc.price, mc.isPaid) === 'Free' ? 'Enrol for free' : `Enrol · ${priceLabel(mc.price, mc.isPaid)}`}
                loading={busy}
                onPress={handleCheckout}
                icon={<Lock size={16} color="#fff" />}
              />
            </View>
          )}
          {mc.canAccess && (
            <View style={[styles.accessRow, { marginTop: Spacing.lg }]}>
              <CheckCircle size={18} color={colors.primary} />
              <Text style={[TextStyles.label, { color: colors.primary, marginLeft: Spacing.sm }]}>
                {mc.isPurchased ? 'You own this masterclass' : 'You have access'}
              </Text>
            </View>
          )}

          {!!mc.description && (
            <View style={styles.section}>
              <SectionHeader title="About" />
              <Text style={[TextStyles.body, { color: colors.foreground }]}>{mc.description}</Text>
            </View>
          )}

          {!!mc.modules?.length && (
            <View style={styles.section}>
              <SectionHeader title="What you'll learn" />
              {mc.modules.map((m, i) => (
                <View key={i} testID={`row-module-${i}`} style={styles.moduleRow}>
                  <PlayCircle size={16} color={colors.primary} style={{ marginTop: 2 }} />
                  <Text style={[TextStyles.body, { color: colors.foreground, flex: 1, marginLeft: Spacing.sm }]}>{m}</Text>
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
  cover: { width: '100%', height: 200 },
  video: { width: '100%', height: 220, backgroundColor: '#000' },
  section: { marginTop: Spacing.xl },
  accessRow: { flexDirection: 'row', alignItems: 'center' },
  moduleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
});
