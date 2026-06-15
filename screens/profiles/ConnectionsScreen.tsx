// ============================================================
// STAGEY MOBILE — CONNECTIONS
// The signed-in user's follows: Following / Followers tabs.
// ============================================================
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Users as UsersIcon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProfilesAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, AvatarSize, PrimaryGradient } from '../../constants';
import type { ProfileConnectionUser } from '../../types';

type Tab = 'following' | 'followers';

function displayName(p: ProfileConnectionUser): string {
  return p.displayName || [p.firstName, p.lastName].filter(Boolean).join(' ') || p.username;
}

export default function ConnectionsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>('following');

  const q = useQuery({
    queryKey: ['connections', tab, user?.username],
    queryFn: () =>
      tab === 'following'
        ? ProfilesAPI.getFollowing(user!.username)
        : ProfilesAPI.getFollowers(user!.username),
    enabled: isAuthenticated && !!user?.username,
  });

  if (!isAuthenticated || !user) {
    return (
      <Screen>
        <EmptyState
          title="Sign in to see connections"
          actionLabel="Sign in"
          onAction={() => navigation.navigate('Login')}
        />
      </Screen>
    );
  }

  const people = q.data ?? [];

  return (
    <Screen>
      <View style={[styles.tabs, { borderColor: colors.border }]}>
        {(['following', 'followers'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            testID={`tab-${t}`}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Text
              style={[
                TextStyles.button,
                { color: tab === t ? colors.primary : colors.mutedForeground },
              ]}
            >
              {t === 'following' ? 'Following' : 'Followers'}
            </Text>
          </Pressable>
        ))}
      </View>

      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState onRetry={q.refetch} />
      ) : people.length === 0 ? (
        <EmptyState
          title={tab === 'following' ? 'Not following anyone yet' : 'No followers yet'}
          message={
            tab === 'following'
              ? 'Find people to follow in the community.'
              : 'Share your profile to grow your audience.'
          }
          icon={<UsersIcon size={40} color={colors.mutedForeground} />}
          actionLabel={tab === 'following' ? 'Find people' : undefined}
          onAction={() => navigation.navigate('ProfileSearch')}
        />
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item.id}
          onRefresh={q.refetch}
          refreshing={q.isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) => (
            <Pressable
              testID={`card-connection-${item.username}`}
              onPress={() => navigation.navigate('UserProfile', { username: item.username })}
              style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {item.profileImageUrl ? (
                <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} contentFit="cover" />
              ) : (
                <LinearGradient colors={PrimaryGradient.colors} style={styles.avatar} />
              )}
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text numberOfLines={1} style={[TextStyles.h5, { color: colors.foreground }]}>
                  {displayName(item)}
                </Text>
                <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground }]}>
                  @{item.username}
                  {item.headline ? ` · ${item.headline}` : ''}
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
  tabs: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
  avatar: { width: AvatarSize.md, height: AvatarSize.md, borderRadius: Radius.full },
});
