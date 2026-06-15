// ============================================================
// STAGEY MOBILE — MY PROFILE
// The signed-in user's own profile, with quick links to edit,
// connections and calendar.
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Users, CalendarDays, Settings as SettingsIcon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProfilesAPI } from '../../services/api';
import { Screen, LoadingState, ErrorState, EmptyState } from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';
import ProfileDetailView from './ProfileDetailView';

export default function OwnProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useAuth();

  const q = useQuery({
    queryKey: ['profile', user?.username],
    queryFn: () => ProfilesAPI.getByUsername(user!.username),
    enabled: isAuthenticated && !!user?.username,
  });

  if (!isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          title="Sign in to view your profile"
          message="Log in to manage your Stagey profile."
          actionLabel="Sign in"
          onAction={() => navigation.navigate('Login')}
        />
      </Screen>
    );
  }

  if (q.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading your profile…" />
      </Screen>
    );
  }
  if (q.isError || !q.data) {
    return (
      <Screen>
        <ErrorState onRetry={q.refetch} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.quickRow}>
        <QuickLink
          icon={<Users size={18} color="#fff" />}
          label="Connections"
          onPress={() => navigation.navigate('Connections')}
          testID="link-connections"
        />
        <QuickLink
          icon={<CalendarDays size={18} color="#fff" />}
          label="Calendar"
          onPress={() => navigation.navigate('Calendar')}
          testID="link-calendar"
        />
        <QuickLink
          icon={<SettingsIcon size={18} color="#fff" />}
          label="Settings"
          onPress={() => navigation.navigate('Settings')}
          testID="link-settings"
        />
      </View>
      <ProfileDetailView
        profile={q.data}
        isOwn
        onEdit={() => navigation.navigate('EditProfile')}
        onRefresh={q.refetch}
        refreshing={q.isRefetching}
      />
    </Screen>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable testID={testID} onPress={onPress} style={[styles.quickLink, { backgroundColor: colors.primary }]}>
      {icon}
      <Text style={[TextStyles.labelSmall, { color: '#fff', marginTop: 4 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
  },
  quickLink: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
});
