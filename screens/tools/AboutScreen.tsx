// ============================================================
// STAGEY MOBILE — ABOUT
// Static info about Stagey + quick links out to the website (contact,
// privacy, terms). NEW screen — registered as "About".
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { Heart, Globe, Mail, Shield, FileText, ExternalLink } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Screen,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, PrimaryGradient, APP_WEBSITE } from '../../constants';

const POSITIONING =
  'A free online platform connecting amateur, youth and community theatre — helping performers find societies, helping societies promote shows and castings, and supporting parents and newcomers with trusted guidance.';

export default function AboutScreen() {
  const { colors } = useTheme();
  const bottomPad = useListBottomPadding();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  async function open(path: string) {
    await WebBrowser.openBrowserAsync(`${APP_WEBSITE}${path}`, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  }

  const links: { label: string; path: string; icon: React.ReactNode }[] = [
    { label: 'Visit stagey-app.com', path: '', icon: <Globe size={20} color={colors.primary} /> },
    { label: 'Contact us', path: '/contact', icon: <Mail size={20} color={colors.primary} /> },
    { label: 'Privacy policy', path: '/privacy', icon: <Shield size={20} color={colors.primary} /> },
    { label: 'Terms of service', path: '/terms', icon: <FileText size={20} color={colors.primary} /> },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}>
        <LinearGradient
          colors={PrimaryGradient.colors}
          start={PrimaryGradient.start}
          end={PrimaryGradient.end}
          style={styles.hero}
        >
          <Heart size={28} color="#fff" />
          <Text style={[TextStyles.h1, { color: '#fff', marginTop: Spacing.sm }]}>Stagey</Text>
          <Text style={[TextStyles.caption, { color: '#ffffffcc', marginTop: 4 }]}>The musical theatre community</Text>
        </LinearGradient>

        <Text style={[TextStyles.body, { color: colors.foreground, marginTop: Spacing.xl, lineHeight: 24 }]}>
          {POSITIONING}
        </Text>

        <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {links.map((link, i) => (
            <Pressable
              key={link.label}
              testID={`row-about-${i}`}
              onPress={() => open(link.path)}
              style={[styles.row, i < links.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
            >
              {link.icon}
              <Text style={[TextStyles.body, { color: colors.foreground, flex: 1, marginLeft: Spacing.md }]}>{link.label}</Text>
              <ExternalLink size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        <Text style={[TextStyles.caption, { color: colors.mutedForeground, textAlign: 'center', marginTop: Spacing.xl }]}>
          Version {version}
        </Text>
        <Text style={[TextStyles.caption, { color: colors.mutedForeground, textAlign: 'center', marginTop: 2 }]}>
          Made with ♥ for the theatre community
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  group: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginTop: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
