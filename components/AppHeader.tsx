// ============================================================
// STAGEY MOBILE — TOP HEADER BAR
// Persistent header rendered on every tab screen. Differs for
// logged-in vs logged-out users per NAVIGATION-SPEC.md.
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Ticket,
  CircleUser,
  Bell,
  BookOpen,
  Mail,
  Calendar,
  Wrench,
  HelpCircle,
  Shield,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors, AvatarGradient } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { TextStyles, Spacing, Radius, HEADER_HEIGHT, AvatarSize } from '../constants';
import { NotificationsAPI, ConversationsAPI } from '../services/api';

function Avatar({ size, initials }: { size: number; initials: string }) {
  return (
    <LinearGradient
      colors={AvatarGradient.colors}
      start={AvatarGradient.start}
      end={AvatarGradient.end}
      style={{
        width: size,
        height: size,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontFamily: TextStyles.button.fontFamily, fontSize: size * 0.4 }}>
        {initials}
      </Text>
    </LinearGradient>
  );
}

export default function AppHeader() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => NotificationsAPI.getAll(),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 30000 : false,
  });
  const hasUnread = !!notifications?.some((n) => !n.read);

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => ConversationsAPI.getAll(),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 10000 : false,
  });
  const unreadMessages =
    conversations?.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0) ?? 0;

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.username ||
    user?.email ||
    'Stagey member';
  const initials =
    (user?.firstName?.[0] ?? user?.username?.[0] ?? user?.email?.[0] ?? 'S').toUpperCase();

  const navTo = (screen: string, params?: object) => navigation.navigate(screen, params);
  const closeMenuThen = (screen: string) => {
    setMenuOpen(false);
    navTo(screen);
  };

  const menuItems: {
    icon: any;
    label: string;
    screen?: string;
    badge?: number;
    danger?: boolean;
    adminOnly?: boolean;
    onPress?: () => void;
  }[] = [
    { icon: CircleUser, label: 'My Profile', screen: 'OwnProfile' },
    { icon: BookOpen, label: 'Theatre Glossary', screen: 'Glossary' },
    { icon: Mail, label: 'Messages', screen: 'Messages', badge: unreadMessages },
    { icon: Calendar, label: 'My Calendar', screen: 'Calendar' },
    { icon: Ticket, label: 'Backstage Pass', screen: 'BackstagePass' },
    { icon: Wrench, label: 'Other', screen: 'Other' },
    { icon: HelpCircle, label: 'Help & Support', screen: 'Support' },
    { icon: Shield, label: 'Admin Panel', screen: 'AdminWeb', adminOnly: true },
  ];

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.bar}>
        {/* Left: logo + wordmark */}
        <Pressable
          style={styles.brand}
          onPress={() => navTo('Home')}
          testID="link-header-home"
        >
          <LinearGradient
            colors={Colors.brand.gradient ? ['#8B5CF6', '#EC4899'] : ['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoMark}
          >
            <Text style={styles.logoLetter}>S</Text>
          </LinearGradient>
          <Text style={[styles.wordmark, { color: colors.primary }]}>Stagey</Text>
        </Pressable>

        {/* Right side */}
        <View style={styles.actions}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => navTo('Search')}
            testID="button-header-search"
          >
            <Search size={20} color={colors.foreground} />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => navTo('BackstagePass')}
            testID="button-header-backstage"
          >
            <Ticket size={20} color={colors.foreground} />
          </Pressable>

          {isAuthenticated ? (
            <>
              <Pressable
                style={styles.iconBtn}
                onPress={() => navTo('ProfileSearch')}
                testID="button-header-profiles"
              >
                <CircleUser size={20} color={colors.foreground} />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={() => navTo('Notifications')}
                testID="button-header-notifications"
              >
                <Bell size={20} color={colors.foreground} />
                {hasUnread && (
                  <View
                    style={[styles.redDot, { borderColor: colors.background }]}
                    testID="indicator-unread-notifications"
                  />
                )}
              </Pressable>
              <Pressable
                onPress={() => setMenuOpen(true)}
                testID="button-header-avatar"
                style={styles.avatarBtn}
              >
                <Avatar size={AvatarSize.sm} initials={initials} />
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => navTo('Login')}
              testID="button-header-signin"
              style={[styles.signIn, { backgroundColor: colors.primary }]}
            >
              <Text style={[TextStyles.button, { color: '#fff' }]}>Sign In</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Profile menu (bottom sheet) */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: Colors.overlay.darker }]}
          onPress={() => setMenuOpen(false)}
        >
          <Pressable
            style={[
              styles.menuSheet,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                paddingBottom: insets.bottom + Spacing.lg,
              },
            ]}
            onPress={() => {}}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <View style={styles.menuHeader}>
              <Avatar size={AvatarSize.md} initials={initials} />
              <Text
                style={[TextStyles.h4, { color: colors.foreground, marginLeft: Spacing.md }]}
                testID="text-menu-displayname"
              >
                {displayName}
              </Text>
            </View>
            <ScrollView>
              {menuItems
                .filter((m) => !m.adminOnly || isAdmin)
                .map((m) => {
                  const Icon = m.icon;
                  return (
                    <Pressable
                      key={m.label}
                      testID={`menu-item-${m.label}`}
                      onPress={() => m.screen && closeMenuThen(m.screen)}
                      style={styles.menuRow}
                    >
                      <Icon size={20} color={colors.mutedForeground} />
                      <Text
                        style={[
                          TextStyles.body,
                          { color: colors.foreground, marginLeft: Spacing.md, flex: 1 },
                        ]}
                      >
                        {m.label}
                      </Text>
                      {!!m.badge && m.badge > 0 && (
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.badgeText}>{m.badge}</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <Pressable
                testID="menu-item-logout"
                onPress={async () => {
                  setMenuOpen(false);
                  await logout();
                  navTo('Home');
                }}
                style={styles.menuRow}
              >
                <LogOut size={20} color={colors.destructive} />
                <Text
                  style={[
                    TextStyles.body,
                    { color: colors.destructive, marginLeft: Spacing.md },
                  ]}
                >
                  Log Out
                </Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: StyleSheet.hairlineWidth },
  bar: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
  },
  brand: { flexDirection: 'row', alignItems: 'center' },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: { color: '#fff', fontFamily: TextStyles.h3.fontFamily, fontSize: 18 },
  wordmark: { ...TextStyles.h3, marginLeft: Spacing.sm },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: Spacing.sm },
  avatarBtn: { marginLeft: Spacing.xs },
  signIn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    marginLeft: Spacing.xs,
  },
  redDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
  },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  menuSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  separator: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.sm },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontFamily: TextStyles.badge.fontFamily },
});
