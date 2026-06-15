// ============================================================
// STAGEY MOBILE — PROFILE SEARCH
// Search community members by name / type / location.
// Tap a result → UserProfile.
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
import { Search as SearchIcon, MapPin, User as UserIcon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ProfilesAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Chip,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, AvatarSize, PrimaryGradient } from '../../constants';
import { PROFILE_TYPE_LABELS } from '../../constants';
import type { PublicProfile } from '../../types';

const TYPE_FILTERS: { key: string; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'performer', label: 'Performers' },
  { key: 'stage_crew', label: 'Crew' },
  { key: 'creative', label: 'Creatives' },
  { key: 'parent', label: 'Parents' },
  { key: 'theatre_fan', label: 'Fans' },
];

function displayName(p: PublicProfile): string {
  return p.displayName || [p.firstName, p.lastName].filter(Boolean).join(' ') || p.username;
}

export default function ProfileSearchScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const q = useQuery({
    queryKey: ['profiles', search, type],
    queryFn: () =>
      ProfilesAPI.search({
        q: search || undefined,
        profileType: type || undefined,
        limit: 50,
      }),
  });

  const profiles = q.data ?? [];

  return (
    <Screen>
      <View style={styles.controls}>
        <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <SearchIcon size={18} color={colors.mutedForeground} />
          <TextInput
            testID="input-profile-search"
            value={search}
            onChangeText={setSearch}
            placeholder="Search people…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: Spacing.md }}
          contentContainerStyle={{ paddingRight: Spacing.lg }}
        >
          {TYPE_FILTERS.map((f) => (
            <Chip
              key={f.key || 'all'}
              label={f.label}
              active={type === f.key}
              onPress={() => setType(f.key)}
              testID={`chip-profile-type-${f.key || 'all'}`}
            />
          ))}
        </ScrollView>
      </View>

      {q.isLoading ? (
        <LoadingState label="Finding people…" />
      ) : q.isError ? (
        <ErrorState onRetry={q.refetch} />
      ) : profiles.length === 0 ? (
        <EmptyState
          title="No people found"
          message="Try a different name or filter."
          icon={<UserIcon size={40} color={colors.mutedForeground} />}
          actionLabel={search || type ? 'Clear filters' : undefined}
          onAction={() => {
            setSearch('');
            setType('');
          }}
        />
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          onRefresh={q.refetch}
          refreshing={q.isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) => (
            <Pressable
              testID={`card-profile-${item.username}`}
              onPress={() => navigation.navigate('UserProfile', { username: item.username })}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {item.profileImageUrl ? (
                <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} contentFit="cover" />
              ) : (
                <LinearGradient colors={PrimaryGradient.colors} style={styles.avatar} />
              )}
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text numberOfLines={1} style={[TextStyles.h4, { color: colors.foreground }]}>
                  {displayName(item)}
                </Text>
                <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground }]}>
                  @{item.username}
                </Text>
                {!!item.headline && (
                  <Text numberOfLines={1} style={[TextStyles.bodySmall, { color: colors.foreground, marginTop: 2 }]}>
                    {item.headline}
                  </Text>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: Spacing.md }}>
                  {!!item.profileType && (
                    <Text style={[TextStyles.badge, { color: colors.primary }]}>
                      {PROFILE_TYPE_LABELS[item.profileType] ?? item.profileType}
                    </Text>
                  )}
                  {!!item.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MapPin size={12} color={colors.mutedForeground} />
                      <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                        {item.location}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  avatar: { width: AvatarSize.lg, height: AvatarSize.lg, borderRadius: Radius.full },
});
