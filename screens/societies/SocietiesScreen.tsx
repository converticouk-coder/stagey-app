// ============================================================
// STAGEY MOBILE — SOCIETIES BROWSE
// Two tabs: All Societies (search) and My Societies (memberships).
// Featured strip on top of the "all" tab. Tap → SocietyProfile.
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Search as SearchIcon, MapPin, Users } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { SocietiesAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Badge,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, PrimaryGradient } from '../../constants';
import type { Society } from '../../types';

type TabKey = 'all' | 'mine';

export default function SocietiesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');

  const allQ = useQuery({
    queryKey: ['societies', search],
    queryFn: () => SocietiesAPI.getAll({ q: search || undefined, limit: 50 }),
  });
  const mineQ = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => SocietiesAPI.getUserMemberships(),
    enabled: isAuthenticated && tab === 'mine',
  });

  const societies = allQ.data?.societies ?? [];
  const featured = societies.filter((s) => s.featured).slice(0, 6);
  const mine = (mineQ.data ?? []).map((m) => ({ society: m.society, role: m.role, status: m.status }));

  const renderSocietyCard = (s: Society, extra?: React.ReactNode) => (
    <Pressable
      testID={`card-society-${s.id}`}
      onPress={() => navigation.navigate('SocietyProfile', { slug: s.slug })}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {s.logoUrl ? (
        <Image source={{ uri: s.logoUrl }} style={styles.logo} contentFit="cover" />
      ) : (
        <LinearGradient colors={PrimaryGradient.colors} style={styles.logo} />
      )}
      <View style={{ flex: 1, marginLeft: Spacing.md }}>
        <Text numberOfLines={1} style={[TextStyles.h4, { color: colors.foreground }]}>{s.name}</Text>
        {!!s.location && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <MapPin size={14} color={colors.mutedForeground} />
            <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
              {s.location}
            </Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: Spacing.xs }}>
          {typeof s.memberCount === 'number' && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Users size={14} color={colors.mutedForeground} />
              <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                {s.memberCount} members
              </Text>
            </View>
          )}
          {extra}
        </View>
      </View>
    </Pressable>
  );

  return (
    <Screen>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TabBtn label="All Societies" active={tab === 'all'} onPress={() => setTab('all')} testID="tab-societies-all" />
        <TabBtn label="My Societies" active={tab === 'mine'} onPress={() => setTab('mine')} testID="tab-societies-mine" />
      </View>

      {tab === 'all' ? (
        <>
          <View style={styles.controls}>
            <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <SearchIcon size={18} color={colors.mutedForeground} />
              <TextInput
                testID="input-societies-search"
                value={search}
                onChangeText={setSearch}
                placeholder="Search societies…"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.searchInput, { color: colors.foreground }]}
              />
            </View>
          </View>

          {allQ.isLoading ? (
            <LoadingState label="Loading societies…" />
          ) : allQ.isError ? (
            <ErrorState onRetry={allQ.refetch} />
          ) : societies.length === 0 ? (
            <EmptyState
              title="No societies found"
              message="Try a different search."
              icon={<Users size={40} color={colors.mutedForeground} />}
              actionLabel={search ? 'Clear search' : undefined}
              onAction={() => setSearch('')}
            />
          ) : (
            <FlatList
              data={societies}
              keyExtractor={(item) => String(item.id)}
              onRefresh={allQ.refetch}
              refreshing={allQ.isRefetching}
              contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
              ListHeaderComponent={
                featured.length > 0 && !search ? (
                  <View style={{ marginBottom: Spacing.lg }}>
                    <Text style={[TextStyles.sectionHeader, { color: colors.foreground, marginBottom: Spacing.md }]}>
                      Featured
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {featured.map((s) => (
                        <Pressable
                          key={s.id}
                          testID={`card-featured-society-${s.id}`}
                          onPress={() => navigation.navigate('SocietyProfile', { slug: s.slug })}
                          style={[styles.featCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        >
                          {s.logoUrl ? (
                            <Image source={{ uri: s.logoUrl }} style={styles.featLogo} contentFit="cover" />
                          ) : (
                            <LinearGradient colors={PrimaryGradient.colors} style={styles.featLogo} />
                          )}
                          <Text numberOfLines={2} style={[TextStyles.label, { color: colors.foreground, marginTop: Spacing.sm, textAlign: 'center' }]}>
                            {s.name}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null
              }
              renderItem={({ item }) => renderSocietyCard(item)}
            />
          )}
        </>
      ) : !isAuthenticated ? (
        <EmptyState
          title="Sign in to see your societies"
          message="Log in to view the societies you're a member of."
          icon={<Users size={40} color={colors.mutedForeground} />}
          actionLabel="Sign in"
          onAction={() => navigation.navigate('Login')}
        />
      ) : mineQ.isLoading ? (
        <LoadingState label="Loading your societies…" />
      ) : mineQ.isError ? (
        <ErrorState onRetry={mineQ.refetch} />
      ) : mine.length === 0 ? (
        <EmptyState
          title="No memberships yet"
          message="Browse societies and apply to join one."
          icon={<Users size={40} color={colors.mutedForeground} />}
          actionLabel="Browse societies"
          onAction={() => setTab('all')}
        />
      ) : (
        <FlatList
          data={mine}
          keyExtractor={(item) => String(item.society.id)}
          onRefresh={mineQ.refetch}
          refreshing={mineQ.isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) =>
            renderSocietyCard(
              item.society,
              <Badge
                label={item.status === 'pending' ? 'Pending' : item.role === 'admin' ? 'Admin' : 'Member'}
                color="#fff"
                bg={item.status === 'pending' ? colors.warning : colors.primary}
              />,
            )
          }
        />
      )}
    </Screen>
  );
}

function TabBtn({ label, active, onPress, testID }: { label: string; active: boolean; onPress: () => void; testID: string }) {
  const { colors } = useTheme();
  return (
    <Pressable testID={testID} onPress={onPress} style={[styles.tabBtn, active && { borderBottomColor: colors.primary }]}>
      <Text style={[TextStyles.button, { color: active ? colors.primary : colors.mutedForeground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.screenPadding },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  controls: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: Spacing.sm, ...TextStyles.body },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
  logo: { width: 56, height: 56, borderRadius: Radius.full },
  featCard: {
    width: 120,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: Spacing.md,
  },
  featLogo: { width: 64, height: 64, borderRadius: Radius.full },
});
