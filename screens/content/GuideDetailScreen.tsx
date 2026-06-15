// ============================================================
// STAGEY MOBILE — GUIDE DETAIL (Backstage Pass)
// Renders the guide body natively. If the guide has an interactive
// web version, shows a gentle pulsing gradient CTA (top + sticky
// footer) that opens it in an in-app browser. Guides are public.
// ============================================================
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { Sparkles, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { GuidesAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  Badge,
  useListBottomPadding,
} from '../../components/ui';
import RichText from '../../components/RichText';
import { TextStyles, Spacing, Radius, APP_WEBSITE, PrimaryGradient } from '../../constants';

function InteractiveCTA({ onPress, testID }: { onPress: () => void; testID: string }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.03, { duration: 1500 }), -1, true);
  }, [scale]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable testID={testID} onPress={onPress}>
        <LinearGradient
          colors={PrimaryGradient.colors}
          start={PrimaryGradient.start}
          end={PrimaryGradient.end}
          style={styles.cta}
        >
          <Sparkles size={18} color="#fff" />
          <Text style={[TextStyles.button, { color: '#fff', flex: 1, marginLeft: Spacing.sm }]}>
            Open the interactive version
          </Text>
          <ChevronRight size={20} color="#fff" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function GuideDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const slug = route.params?.slug as string;
  const bottomPad = useListBottomPadding();

  const { data: guide, isLoading, isError, refetch } = useQuery({
    queryKey: ['guide', slug],
    queryFn: () => GuidesAPI.getBySlug(slug),
    enabled: !!slug,
  });

  const interactiveUrl = guide?.interactiveUrl ? `${APP_WEBSITE}${guide.interactiveUrl}` : null;

  async function openInteractive() {
    if (!interactiveUrl) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await WebBrowser.openBrowserAsync(interactiveUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: '#7C3AED',
      toolbarColor: '#0B0B14',
    });
  }

  if (isLoading) return <Screen><LoadingState label="Loading guide…" /></Screen>;
  if (isError || !guide) return <Screen><ErrorState onRetry={refetch} /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}>
        <Text testID="text-guide-title" style={[TextStyles.h2, { color: colors.foreground }]}>
          {guide.title}
        </Text>
        <Text style={[TextStyles.body, { color: colors.mutedForeground, marginTop: Spacing.sm }]}>
          {guide.shortDescription}
        </Text>
        <View style={{ flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm, flexWrap: 'wrap' }}>
          {!!guide.category && <Badge label={guide.category} />}
        </View>

        {!!interactiveUrl && (
          <View style={{ marginTop: Spacing.lg }}>
            <InteractiveCTA testID="button-guide-interactive-top" onPress={openInteractive} />
          </View>
        )}

        <View style={{ marginTop: Spacing.xl }}>
          <RichText html={guide.content} />
        </View>
      </ScrollView>

      {!!interactiveUrl && (
        <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border, paddingBottom: bottomPad ? Spacing.md : Spacing.md }]}>
          <InteractiveCTA testID="button-guide-interactive-footer" onPress={openInteractive} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
