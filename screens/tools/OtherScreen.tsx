// ============================================================
// STAGEY MOBILE — OTHER (utility hub)
// A grouped menu of secondary destinations: tools, content, help and
// the web-only store. Tools navigate in-app; the Store opens the website.
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import {
  BookOpen, Library, GraduationCap, Newspaper, Trophy, Brain, Sparkles,
  Calculator, LayoutGrid, Award, Briefcase, Gift, LifeBuoy, CalendarClock,
  ShoppingBag, Info, ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Screen,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, APP_WEBSITE } from '../../constants';

type Row =
  | { kind: 'nav'; label: string; screen: string; icon: React.ReactNode }
  | { kind: 'link'; label: string; url: string; icon: React.ReactNode };

export default function OtherScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();

  const ic = (Comp: any) => <Comp size={20} color={colors.primary} />;

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: 'Discover',
      rows: [
        { kind: 'nav', label: 'Show Library', screen: 'Library', icon: ic(Library) },
        { kind: 'nav', label: 'Theatre Glossary', screen: 'Glossary', icon: ic(BookOpen) },
        { kind: 'nav', label: 'Masterclasses', screen: 'Masterclasses', icon: ic(GraduationCap) },
        { kind: 'nav', label: 'News', screen: 'News', icon: ic(Newspaper) },
        { kind: 'nav', label: 'Competitions', screen: 'Competitions', icon: ic(Trophy) },
        { kind: 'nav', label: 'Backstage Pass', screen: 'BackstagePass', icon: ic(Sparkles) },
      ],
    },
    {
      title: 'Tools',
      rows: [
        { kind: 'nav', label: 'Daily Quiz', screen: 'DailyQuiz', icon: ic(Brain) },
        { kind: 'nav', label: 'Stage Name Generator', screen: 'StageName', icon: ic(Sparkles) },
        { kind: 'nav', label: 'Budget Calculator', screen: 'BudgetCalculator', icon: ic(Calculator) },
        { kind: 'nav', label: 'My Mood Boards', screen: 'MyMoodBoards', icon: ic(LayoutGrid) },
        { kind: 'nav', label: 'Achievements', screen: 'Achievements', icon: ic(Award) },
        { kind: 'nav', label: 'Rehearsal Pal™', screen: 'RehearsalPal', icon: ic(CalendarClock) },
      ],
    },
    {
      title: 'Services & offers',
      rows: [
        { kind: 'nav', label: 'Expert Services', screen: 'ExpertServices', icon: ic(Briefcase) },
        { kind: 'nav', label: 'Partner Offers', screen: 'PartnerOffers', icon: ic(Gift) },
        { kind: 'link', label: 'Stagey Store', url: `${APP_WEBSITE}/store`, icon: ic(ShoppingBag) },
      ],
    },
    {
      title: 'More',
      rows: [
        { kind: 'nav', label: 'My Calendar', screen: 'Calendar', icon: ic(CalendarClock) },
        { kind: 'nav', label: 'Help & Support', screen: 'Support', icon: ic(LifeBuoy) },
        { kind: 'nav', label: 'About Stagey', screen: 'About', icon: ic(Info) },
      ],
    },
  ];

  async function handle(row: Row) {
    if (row.kind === 'nav') navigation.navigate(row.screen);
    else await WebBrowser.openBrowserAsync(row.url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}>
        {sections.map((section) => (
          <View key={section.title} style={{ marginBottom: Spacing.xl }}>
            <Text style={[TextStyles.sectionHeader, { color: colors.foreground, marginBottom: Spacing.sm }]}>{section.title}</Text>
            <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.rows.map((row, i) => (
                <Pressable
                  key={row.label}
                  testID={`row-other-${row.kind === 'nav' ? row.screen : 'store'}`}
                  onPress={() => handle(row)}
                  style={[styles.row, i < section.rows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
                >
                  {row.icon}
                  <Text style={[TextStyles.body, { color: colors.foreground, flex: 1, marginLeft: Spacing.md }]}>{row.label}</Text>
                  <ChevronRight size={18} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
