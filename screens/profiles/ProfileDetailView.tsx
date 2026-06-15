// ============================================================
// STAGEY MOBILE — PROFILE DETAIL VIEW (shared)
// Presentational profile body used by UserProfile (other people)
// and OwnProfile (the signed-in user). Banner, avatar, identity,
// action buttons, about, experience, media and societies.
// ============================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MapPin,
  UserPlus,
  UserCheck,
  MessageCircle,
  Pencil,
  Theater,
  Users,
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Badge, useListBottomPadding, formatDate } from '../../components/ui';
import { TextStyles, Spacing, Radius, AvatarSize, PrimaryGradient } from '../../constants';
import { PROFILE_TYPE_LABELS } from '../../constants';
import type { ProfileDetail } from '../../types';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function experienceWhen(year?: number | null, month?: number | null): string {
  if (!year) return '';
  if (month && month >= 1 && month <= 12) return `${MONTHS[month]} ${year}`;
  return String(year);
}

export default function ProfileDetailView({
  profile,
  isOwn,
  onFollowToggle,
  followLoading,
  onMessage,
  onEdit,
  onRefresh,
  refreshing,
}: {
  profile: ProfileDetail;
  isOwn: boolean;
  onFollowToggle?: () => void;
  followLoading?: boolean;
  onMessage?: () => void;
  onEdit?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();

  const name =
    profile.displayName ||
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
    profile.username;

  const experience = profile.experience ?? [];
  const media = profile.media ?? [];
  const societies = profile.societies ?? [];

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: bottomPad }}
      onScroll={undefined}
    >
      {/* Banner */}
      {profile.bannerImageUrl ? (
        <Image source={{ uri: profile.bannerImageUrl }} style={styles.banner} contentFit="cover" />
      ) : (
        <LinearGradient
          colors={PrimaryGradient.colors}
          start={PrimaryGradient.start}
          end={PrimaryGradient.end}
          style={styles.banner}
        />
      )}

      <View style={{ paddingHorizontal: Spacing.screenPadding, marginTop: -AvatarSize.xl / 2 }}>
        {profile.profileImageUrl ? (
          <Image source={{ uri: profile.profileImageUrl }} style={[styles.avatar, { borderColor: colors.background }]} contentFit="cover" />
        ) : (
          <LinearGradient colors={PrimaryGradient.colors} style={[styles.avatar, { borderColor: colors.background }]} />
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.sm }}>
          <Text style={[TextStyles.h2, { color: colors.foreground }]} testID="text-profile-name">
            {name}
          </Text>
          {profile.isTeenager && <Badge label="Young performer" color="#fff" bg={colors.warning} />}
        </View>
        <Text style={[TextStyles.body, { color: colors.mutedForeground }]}>@{profile.username}</Text>

        {!!profile.headline && (
          <Text style={[TextStyles.bodyLarge, { color: colors.foreground, marginTop: Spacing.sm }]}>
            {profile.headline}
          </Text>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, flexWrap: 'wrap', gap: Spacing.md }}>
          {!!profile.profileType && (
            <Badge label={PROFILE_TYPE_LABELS[profile.profileType] ?? profile.profileType} color={colors.primary} bg={colors.secondary} />
          )}
          {!!profile.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPin size={14} color={colors.mutedForeground} />
              <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                {profile.location}
              </Text>
            </View>
          )}
        </View>

        {/* Follower / following counts */}
        <Pressable
          testID="button-profile-connections"
          onPress={() => {
            if (isOwn) navigation.navigate('Connections');
          }}
          style={{ flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.xl }}
        >
          <Text style={[TextStyles.body, { color: colors.foreground }]}>
            <Text style={{ fontFamily: TextStyles.button.fontFamily }}>{profile.followerCount ?? 0}</Text>
            <Text style={{ color: colors.mutedForeground }}>  Followers</Text>
          </Text>
          <Text style={[TextStyles.body, { color: colors.foreground }]}>
            <Text style={{ fontFamily: TextStyles.button.fontFamily }}>{profile.followingCount ?? 0}</Text>
            <Text style={{ color: colors.mutedForeground }}>  Following</Text>
          </Text>
        </Pressable>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg }}>
          {isOwn ? (
            <Pressable
              testID="button-edit-profile"
              onPress={onEdit}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Pencil size={16} color="#fff" />
              <Text style={[TextStyles.button, { color: '#fff', marginLeft: Spacing.sm }]}>Edit profile</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                testID="button-follow-toggle"
                onPress={onFollowToggle}
                disabled={followLoading}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: profile.isFollowing ? colors.secondary : colors.primary,
                    opacity: followLoading ? 0.6 : 1,
                  },
                ]}
              >
                {profile.isFollowing ? (
                  <UserCheck size={16} color={colors.foreground} />
                ) : (
                  <UserPlus size={16} color="#fff" />
                )}
                <Text
                  style={[
                    TextStyles.button,
                    { color: profile.isFollowing ? colors.foreground : '#fff', marginLeft: Spacing.sm },
                  ]}
                >
                  {profile.isFollowing ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
              <Pressable
                testID="button-message-user"
                onPress={onMessage}
                style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
              >
                <MessageCircle size={16} color={colors.foreground} />
                <Text style={[TextStyles.button, { color: colors.foreground, marginLeft: Spacing.sm }]}>Message</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* About */}
        {!!profile.bio && (
          <Section title="About">
            <Text style={[TextStyles.body, { color: colors.foreground }]} testID="text-profile-bio">
              {profile.bio}
            </Text>
          </Section>
        )}

        {(profile.skills?.length ?? 0) > 0 && (
          <Section title="Skills">
            <TagWrap items={profile.skills!} />
          </Section>
        )}

        {(profile.dreamRoles?.length ?? 0) > 0 && (
          <Section title="Dream roles">
            <TagWrap items={profile.dreamRoles!} />
          </Section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Section title="Experience">
            {experience.map((e) => (
              <View key={e.id} style={[styles.expRow, { borderColor: colors.border }]} testID={`row-experience-${e.id}`}>
                <Theater size={18} color={colors.primary} style={{ marginTop: 2 }} />
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={[TextStyles.h5, { color: colors.foreground }]}>{e.role}</Text>
                  <Text style={[TextStyles.bodySmall, { color: colors.mutedForeground }]}>
                    {e.showTitle}
                    {e.societyName ? ` · ${e.societyName}` : ''}
                  </Text>
                  {(e.venue || e.year) && (
                    <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>
                      {[e.venue, experienceWhen(e.year, e.month)].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                  {!!e.description && (
                    <Text style={[TextStyles.bodySmall, { color: colors.foreground, marginTop: 4 }]}>{e.description}</Text>
                  )}
                </View>
              </View>
            ))}
          </Section>
        )}

        {/* Media */}
        {media.length > 0 && (
          <Section title="Media">
            <View style={styles.mediaGrid}>
              {media.map((m) => (
                <View key={m.id} style={styles.mediaItem} testID={`media-${m.id}`}>
                  <Image
                    source={{ uri: m.thumbnailUrl || m.url }}
                    style={styles.mediaImg}
                    contentFit="cover"
                  />
                  {!!m.title && (
                    <Text numberOfLines={1} style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 4 }]}>
                      {m.title}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Societies */}
        {societies.length > 0 && (
          <Section title="Societies">
            {societies.map((s) => (
              <Pressable
                key={s.id}
                testID={`card-profile-society-${s.id}`}
                onPress={() => navigation.navigate('SocietyProfile', { slug: s.slug })}
                style={[styles.societyRow, { borderColor: colors.border }]}
              >
                {s.logoUrl ? (
                  <Image source={{ uri: s.logoUrl }} style={styles.societyLogo} contentFit="cover" />
                ) : (
                  <LinearGradient colors={PrimaryGradient.colors} style={styles.societyLogo} />
                )}
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text numberOfLines={1} style={[TextStyles.h5, { color: colors.foreground }]}>{s.name}</Text>
                  <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>
                    {s.role === 'admin' ? 'Admin' : 'Member'}
                  </Text>
                </View>
                <Users size={16} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </Section>
        )}

        {!!formatDate(profile.createdAt) && (
          <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: Spacing.xl }]}>
            On Stagey since {formatDate(profile.createdAt)}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: Spacing.xl }}>
      <Text style={[TextStyles.sectionHeader, { color: colors.foreground, marginBottom: Spacing.md }]}>{title}</Text>
      {children}
    </View>
  );
}

function TagWrap({ items }: { items: string[] }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
      {items.map((t, i) => (
        <View key={`${t}-${i}`} style={[styles.tag, { backgroundColor: colors.secondary }]}>
          <Text style={[TextStyles.label, { color: colors.secondaryForeground }]}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 140 },
  avatar: {
    width: AvatarSize.xl,
    height: AvatarSize.xl,
    borderRadius: Radius.full,
    borderWidth: 3,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  expRow: {
    flexDirection: 'row',
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  mediaItem: { width: '47%' },
  mediaImg: { width: '100%', height: 120, borderRadius: Radius.md },
  societyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  societyLogo: { width: AvatarSize.md, height: AvatarSize.md, borderRadius: Radius.full },
});
