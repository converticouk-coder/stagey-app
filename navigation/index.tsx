// ============================================================
// STAGEY MOBILE — NAVIGATION SHELL
// Persistent bottom tab bar (Home · Market · + FAB · Societies · Shows)
// and a persistent top header (AppHeader) on every tab screen, exactly
// per NAVIGATION-SPEC.md.
//
// Screen names match types/index.ts param lists EXACTLY and must not be
// renamed — they are referenced throughout the (future) codebase.
//
// Architecture: each of the four real tabs is a native stack. Every tab
// stack registers the full set of shared content/detail/utility screens
// (COMMON_SCREENS) so detail screens keep the bottom bar visible and any
// destination is reachable from any tab. Auth + global modals live in the
// root stack above the tabs.
// ============================================================
import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  type Theme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, ShoppingBag, Users, Calendar, Plus } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { PrimaryGradient } from '../constants/colors';
import { TAB_BAR_HEIGHT, FAB_SIZE, TextStyles } from '../constants';
import AppHeader from '../components/AppHeader';
import CreateActionSheet from '../components/CreateActionSheet';
import { makePlaceholder } from '../screens/PlaceholderScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ShowsScreen from '../screens/shows/ShowsScreen';
import ShowDetailScreen from '../screens/shows/ShowDetailScreen';
import CastingsScreen from '../screens/castings/CastingsScreen';
import CastingDetailScreen from '../screens/castings/CastingDetailScreen';
import SocietiesScreen from '../screens/societies/SocietiesScreen';
import SocietyProfileScreen from '../screens/societies/SocietyProfileScreen';
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import MarketplaceItemScreen from '../screens/marketplace/MarketplaceItemScreen';
import SubmitShowScreen from '../screens/create/SubmitShowScreen';
import CreateCastingScreen from '../screens/create/CreateCastingScreen';
import CreateListingScreen from '../screens/create/CreateListingScreen';
import CreateSocietyScreen from '../screens/create/CreateSocietyScreen';
import ProfileSearchScreen from '../screens/profiles/ProfileSearchScreen';
import UserProfileScreen from '../screens/profiles/UserProfileScreen';
import OwnProfileScreen from '../screens/profiles/OwnProfileScreen';
import EditProfileScreen from '../screens/profiles/EditProfileScreen';
import ConnectionsScreen from '../screens/profiles/ConnectionsScreen';
import CommunityHubScreen from '../screens/community/CommunityHubScreen';
import CommunityChatScreen from '../screens/community/CommunityChatScreen';
import CommunityChatThreadScreen from '../screens/community/CommunityChatThreadScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ConversationScreen from '../screens/messages/ConversationScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
// Content screens
import GlossaryScreen from '../screens/content/GlossaryScreen';
import LibraryScreen from '../screens/content/LibraryScreen';
import LibraryShowScreen from '../screens/content/LibraryShowScreen';
import MasterclassesScreen from '../screens/content/MasterclassesScreen';
import MasterclassDetailScreen from '../screens/content/MasterclassDetailScreen';
import NewsScreen from '../screens/content/NewsScreen';
import NewsFeedScreen from '../screens/content/NewsFeedScreen';
import ArticleScreen from '../screens/content/ArticleScreen';
import BackstagePassScreen from '../screens/content/BackstagePassScreen';
import GuideDetailScreen from '../screens/content/GuideDetailScreen';
import ExpertServicesScreen from '../screens/content/ExpertServicesScreen';
import PartnerOffersScreen from '../screens/content/PartnerOffersScreen';
import CompetitionsScreen from '../screens/content/CompetitionsScreen';
import CompetitionDetailScreen from '../screens/content/CompetitionDetailScreen';
// Tools / utility screens
import DailyQuizScreen from '../screens/tools/DailyQuizScreen';
import StageNameScreen from '../screens/tools/StageNameScreen';
import BudgetCalculatorScreen from '../screens/tools/BudgetCalculatorScreen';
import MyMoodBoardsScreen from '../screens/tools/MyMoodBoardsScreen';
import MoodBoardDetailScreen from '../screens/tools/MoodBoardDetailScreen';
import AchievementsScreen from '../screens/tools/AchievementsScreen';
import RehearsalPalScreen from '../screens/tools/RehearsalPalScreen';
import OtherScreen from '../screens/tools/OtherScreen';
import AboutScreen from '../screens/tools/AboutScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

// ── Implemented screen registry (name → component) ────────────
// Names map 1:1 to the registered screen names. Anything not listed
// here still falls back to a titled placeholder, so navigation stays
// intact while screens are filled in.
const SCREEN_REGISTRY: Record<string, React.ComponentType<any>> = {
  Home: HomeScreen,
  Market: MarketplaceScreen,
  Societies: SocietiesScreen,
  Shows: ShowsScreen,
  ShowDetail: ShowDetailScreen,
  Castings: CastingsScreen,
  CastingDetail: CastingDetailScreen,
  SocietiesBrowse: SocietiesScreen,
  SocietyProfile: SocietyProfileScreen,
  MarketplaceItem: MarketplaceItemScreen,
  SubmitShow: SubmitShowScreen,
  CreateCasting: CreateCastingScreen,
  CreateListing: CreateListingScreen,
  CreateSociety: CreateSocietyScreen,
  Search: SearchScreen,
  // Social / communication layer
  ProfileSearch: ProfileSearchScreen,
  UserProfile: UserProfileScreen,
  OwnProfile: OwnProfileScreen,
  EditProfile: EditProfileScreen,
  Connections: ConnectionsScreen,
  CommunityHub: CommunityHubScreen,
  CommunityCategories: CommunityHubScreen,
  CommunityChat: CommunityChatScreen,
  CommunityChatThread: CommunityChatThreadScreen,
  Messages: MessagesScreen,
  Conversation: ConversationScreen,
  Notifications: NotificationsScreen,
  Calendar: CalendarScreen,
  // Content
  Glossary: GlossaryScreen,
  Library: LibraryScreen,
  LibraryShow: LibraryShowScreen,
  Masterclasses: MasterclassesScreen,
  MasterclassDetail: MasterclassDetailScreen,
  News: NewsScreen,
  NewsFeed: NewsFeedScreen,
  Article: ArticleScreen,
  BackstagePass: BackstagePassScreen,
  GuideDetail: GuideDetailScreen,
  ExpertServices: ExpertServicesScreen,
  PartnerOffers: PartnerOffersScreen,
  Competitions: CompetitionsScreen,
  CompetitionDetail: CompetitionDetailScreen,
  // Tools / utility
  DailyQuiz: DailyQuizScreen,
  StageName: StageNameScreen,
  BudgetCalculator: BudgetCalculatorScreen,
  MyMoodBoards: MyMoodBoardsScreen,
  MoodBoardDetail: MoodBoardDetailScreen,
  Achievements: AchievementsScreen,
  RehearsalPal: RehearsalPalScreen,
  Other: OtherScreen,
  About: AboutScreen,
};

function screenComponent(name: string, title: string): React.ComponentType<any> {
  return SCREEN_REGISTRY[name] ?? makePlaceholder(title);
}

// ── Shared screens registered inside EVERY tab stack ──────────
// Names match the *StackParamList types in types/index.ts. The four
// tab-hub names (Home / Market / Societies / Shows) are intentionally
// omitted so they don't collide with a stack's own first screen.
const COMMON_SCREENS: { name: string; title: string }[] = [
  // Discover
  { name: 'DiscoverHub', title: 'Discover' },
  { name: 'ShowDetail', title: 'Show' },
  { name: 'Castings', title: 'Castings' },
  { name: 'CastingDetail', title: 'Casting' },
  { name: 'Library', title: 'Show Library' },
  { name: 'LibraryShow', title: 'Library Show' },
  { name: 'Glossary', title: 'Theatre Glossary' },
  { name: 'News', title: 'News' },
  { name: 'NewsFeed', title: 'News Feed' },
  { name: 'Article', title: 'Article' },
  { name: 'Masterclasses', title: 'Masterclasses' },
  { name: 'MasterclassDetail', title: 'Masterclass' },
  { name: 'ExpertServices', title: 'Expert Services' },
  { name: 'PartnerOffers', title: 'Partner Offers' },
  { name: 'Competitions', title: 'Competitions' },
  { name: 'CompetitionDetail', title: 'Competition' },
  { name: 'DailyQuiz', title: 'Daily Quiz' },
  { name: 'BudgetCalculator', title: 'Budget Calculator' },
  // Community
  { name: 'CommunityHub', title: 'Community' },
  { name: 'SocietiesBrowse', title: 'Societies' },
  { name: 'SocietyProfile', title: 'Society' },
  { name: 'CommunityCategories', title: 'Community Categories' },
  { name: 'CommunityChat', title: 'Community Chat' },
  { name: 'CommunityChatThread', title: 'Community Chat' },
  { name: 'Messages', title: 'Messages' },
  { name: 'Conversation', title: 'Conversation' },
  { name: 'ProfileSearch', title: 'Profiles' },
  { name: 'UserProfile', title: 'Profile' },
  // Marketplace
  { name: 'MarketplaceItem', title: 'Marketplace Item' },
  // Me
  { name: 'OwnProfile', title: 'My Profile' },
  { name: 'EditProfile', title: 'Edit Profile' },
  { name: 'Connections', title: 'Connections' },
  { name: 'Settings', title: 'Settings' },
  { name: 'NotificationSettings', title: 'Notification Settings' },
  { name: 'PrivacySettings', title: 'Privacy Settings' },
  { name: 'ChangePassword', title: 'Change Password' },
  { name: 'SavedItems', title: 'Saved Items' },
  { name: 'MyListings', title: 'My Listings' },
  { name: 'MyBudgets', title: 'My Budgets' },
  { name: 'MyMoodBoards', title: 'My Mood Boards' },
  { name: 'MoodBoardDetail', title: 'Mood Board' },
  { name: 'BackstagePass', title: 'Backstage Pass' },
  { name: 'GuideDetail', title: 'Guide' },
  { name: 'RehearsalPal', title: 'Rehearsal Pal' },
  { name: 'Support', title: 'Help & Support' },
  // Header / hub extras (not in param lists — destinations from the spec)
  { name: 'Other', title: 'Other' },
  { name: 'StageName', title: 'Stage Name Generator' },
  { name: 'Achievements', title: 'Achievements' },
  { name: 'About', title: 'About Stagey' },
  { name: 'Calendar', title: 'My Calendar' },
  { name: 'AdminWeb', title: 'Admin (web only)' },
  { name: 'CreateListing', title: 'List on Marketplace' },
  { name: 'CreateCasting', title: 'Post a Casting' },
  { name: 'SubmitShow', title: 'Submit a Show' },
  { name: 'CreateSociety', title: 'Create Society' },
];

function CommonScreens() {
  return (
    <>
      {COMMON_SCREENS.map((s) => (
        <Stack.Screen
          key={s.name}
          name={s.name}
          component={screenComponent(s.name, s.title)}
        />
      ))}
    </>
  );
}

function makeTabStack(hubName: string, hubTitle: string) {
  return function TabStack() {
    return (
      <Stack.Navigator screenOptions={{ header: () => <AppHeader /> }}>
        <Stack.Screen name={hubName} component={screenComponent(hubName, hubTitle)} />
        {CommonScreens()}
      </Stack.Navigator>
    );
  };
}

const HomeStack = makeTabStack('Home', 'Home');
const MarketStack = makeTabStack('Market', 'Marketplace');
const SocietiesStack = makeTabStack('Societies', 'Societies');
const ShowsStack = makeTabStack('Shows', 'Shows');

// ── The "+" FAB (centre tab) ──────────────────────────────────
function CreateFAB() {
  return (
    <View style={styles.fabContainer} pointerEvents="none">
      <LinearGradient
        colors={PrimaryGradient.colors}
        start={PrimaryGradient.start}
        end={PrimaryGradient.end}
        style={styles.fab}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </LinearGradient>
    </View>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontFamily: TextStyles.badge.fontFamily,
            fontSize: 10,
          },
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingBottom: insets.bottom + 4,
            paddingTop: 6,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Market"
          component={MarketStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <ShoppingBag size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Create"
          component={View}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => <CreateFAB />,
            tabBarButton: (props) => (
              <Pressable
                testID="button-create-fab"
                onPress={() => {
                  if (isAuthenticated) {
                    setSheetVisible(true);
                  } else {
                    props.onPress?.({} as any);
                  }
                }}
                style={styles.fabButton}
              >
                <CreateFAB />
              </Pressable>
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              if (!isAuthenticated) {
                navigation.navigate('Login' as never);
              }
            },
          })}
        />
        <Tab.Screen
          name="Societies"
          component={SocietiesStack}
          options={{
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Shows"
          component={ShowsStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Calendar size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      <CreateActionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
}

// ── Root navigator: tabs + auth/global modals ─────────────────
const ROOT_MODAL_PLACEHOLDERS: { name: string; title: string }[] = [
  { name: 'GuardianPending', title: 'Awaiting Guardian Approval' },
  { name: 'MoodBoardShared', title: 'Shared Mood Board' },
  { name: 'Search', title: 'Search' },
  { name: 'Notifications', title: 'Notifications' },
];

export function RootNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" component={TabNavigator} />
      <RootStack.Group screenOptions={{ presentation: 'modal' }}>
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Signup" component={SignupScreen} />
        <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        {ROOT_MODAL_PLACEHOLDERS.map((s) => (
          <RootStack.Screen
            key={s.name}
            name={s.name}
            component={screenComponent(s.name, s.title)}
          />
        ))}
      </RootStack.Group>
    </RootStack.Navigator>
  );
}

export default function AppNavigation() {
  const { colors, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.background,
      text: colors.foreground,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 6 : 2,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
