// ============================================================
// STAGEY MOBILE — SOCIETY PROFILE
// Banner + logo, follow + apply-to-join actions, and tabs for
// About / Members / Shows. Apply opens a modal with a message.
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import {
  MapPin,
  Globe,
  Users,
  Calendar,
  Heart,
  UserPlus,
  X,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { SocietiesAPI, ShowsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Badge,
  PrimaryButton,
  useListBottomPadding,
  formatDateRange,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, PrimaryGradient, AvatarGradient } from '../../constants';

type TabKey = 'about' | 'members' | 'shows';

export default function SocietyProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const slug = route.params?.slug as string;
  const bottomPad = useListBottomPadding();
  const { isAuthenticated } = useAuth();

  const [tab, setTab] = useState<TabKey>('about');
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const societyQ = useQuery({
    queryKey: ['society', slug],
    queryFn: () => SocietiesAPI.getBySlug(slug),
    enabled: !!slug,
  });
  const membersQ = useQuery({
    queryKey: ['society-members', slug],
    queryFn: () => SocietiesAPI.getMembers(slug),
    enabled: !!slug && tab === 'members',
  });
  const showsQ = useQuery({
    queryKey: ['society-shows', slug],
    queryFn: () => ShowsAPI.getAll({ limit: 50 }),
    enabled: !!slug && tab === 'shows',
  });

  const society = societyQ.data;

  const toggleFollow = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    setFollowBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      if (next) await SocietiesAPI.follow(slug);
      else await SocietiesAPI.unfollow(slug);
    } catch (e: any) {
      setFollowing(!next);
      Toast.show({ type: 'error', text1: 'Could not update', text2: e?.message ?? 'Please try again.' });
    } finally {
      setFollowBusy(false);
    }
  };

  const onApplyPress = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    setApplyOpen(true);
  };

  const submitApply = async () => {
    setApplying(true);
    try {
      await SocietiesAPI.apply(slug, applyMessage.trim() || undefined);
      setApplyOpen(false);
      setApplied(true);
      setApplyMessage('');
      Toast.show({ type: 'success', text1: 'Request sent!', text2: 'The society admins will review your request.' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not apply', text2: e?.message ?? 'Please try again.' });
    } finally {
      setApplying(false);
    }
  };

  if (societyQ.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading society…" />
      </Screen>
    );
  }
  if (societyQ.isError || !society) {
    return (
      <Screen>
        <ErrorState message="We couldn't load this society." onRetry={societyQ.refetch} />
      </Screen>
    );
  }

  const societyShows = (showsQ.data?.shows ?? []).filter((s) => s.societyId === society.id);
  const members = membersQ.data ?? [];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} testID="scroll-society-profile">
        {/* Banner */}
        {society.bannerUrl || society.heroImageUrl ? (
          <Image source={{ uri: society.bannerUrl ?? society.heroImageUrl! }} style={styles.banner} contentFit="cover" />
        ) : (
          <LinearGradient colors={PrimaryGradient.colors} style={styles.banner} />
        )}

        <View style={styles.body}>
          {/* Logo + name */}
          <View style={styles.headerRow}>
            {society.logoUrl ? (
              <Image source={{ uri: society.logoUrl }} style={[styles.logo, { borderColor: colors.background }]} contentFit="cover" />
            ) : (
              <LinearGradient colors={AvatarGradient.colors} style={[styles.logo, { borderColor: colors.background }]} />
            )}
            <View style={{ flex: 1, marginLeft: Spacing.md, justifyContent: 'flex-end' }}>
              <Text testID="text-society-name" style={[TextStyles.h2, { color: colors.foreground }]}>
                {society.name}
              </Text>
              <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: 4, flexWrap: 'wrap' }}>
                {!!society.location && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MapPin size={14} color={colors.mutedForeground} />
                    <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                      {society.location}
                    </Text>
                  </View>
                )}
                {typeof society.memberCount === 'number' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Users size={14} color={colors.mutedForeground} />
                    <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>
                      {society.memberCount} members
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <Pressable
              testID="button-follow-society"
              onPress={toggleFollow}
              disabled={followBusy}
              style={[
                styles.followBtn,
                {
                  backgroundColor: following ? colors.secondary : colors.primary,
                  borderColor: following ? colors.border : colors.primary,
                },
              ]}
            >
              <Heart
                size={16}
                color={following ? colors.primary : '#fff'}
                fill={following ? colors.primary : 'transparent'}
              />
              <Text style={[TextStyles.button, { color: following ? colors.foreground : '#fff', marginLeft: Spacing.xs }]}>
                {following ? 'Following' : 'Follow'}
              </Text>
            </Pressable>

            <Pressable
              testID="button-apply-join"
              onPress={onApplyPress}
              disabled={applied}
              style={[styles.joinBtn, { borderColor: colors.primary, opacity: applied ? 0.6 : 1 }]}
            >
              {applied ? <Check size={16} color={colors.primary} /> : <UserPlus size={16} color={colors.primary} />}
              <Text style={[TextStyles.button, { color: colors.primary, marginLeft: Spacing.xs }]}>
                {applied ? 'Requested' : 'Join'}
              </Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {(['about', 'members', 'shows'] as TabKey[]).map((t) => (
              <Pressable
                key={t}
                testID={`tab-society-${t}`}
                onPress={() => setTab(t)}
                style={[styles.tabBtn, tab === t && { borderBottomColor: colors.primary }]}
              >
                <Text style={[TextStyles.button, { color: tab === t ? colors.primary : colors.mutedForeground, textTransform: 'capitalize' }]}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab content */}
          {tab === 'about' && (
            <View style={{ marginTop: Spacing.lg }}>
              {society.description ? (
                <Text style={[TextStyles.bodyLarge, { color: colors.foreground }]}>{society.description}</Text>
              ) : (
                <Text style={[TextStyles.body, { color: colors.mutedForeground }]}>
                  This society hasn't added a description yet.
                </Text>
              )}
              {!!society.foundingYear && (
                <View style={[styles.infoRow, { borderColor: colors.border }]}>
                  <Calendar size={16} color={colors.mutedForeground} />
                  <Text style={[TextStyles.body, { color: colors.foreground, marginLeft: Spacing.sm }]}>
                    Founded {society.foundingYear}
                  </Text>
                </View>
              )}
              {!!society.website && (
                <Pressable
                  testID="link-society-website"
                  onPress={() => Linking.openURL(society.website!)}
                  style={[styles.infoRow, { borderColor: colors.border }]}
                >
                  <Globe size={16} color={colors.primary} />
                  <Text numberOfLines={1} style={[TextStyles.body, { color: colors.primary, marginLeft: Spacing.sm }]}>
                    {society.website}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {tab === 'members' && (
            <View style={{ marginTop: Spacing.lg }}>
              {membersQ.isLoading ? (
                <LoadingState />
              ) : membersQ.isError ? (
                <ErrorState onRetry={membersQ.refetch} />
              ) : members.length === 0 ? (
                <EmptyState title="No public members" message="This society hasn't listed members publicly." />
              ) : (
                members.map((m) => (
                  <Pressable
                    key={m.id}
                    testID={`row-member-${m.id}`}
                    onPress={() => m.user?.username && navigation.navigate('PublicProfile', { username: m.user.username })}
                    style={[styles.memberRow, { borderColor: colors.border }]}
                  >
                    {m.user?.profileImageUrl ? (
                      <Image source={{ uri: m.user.profileImageUrl }} style={styles.avatar} contentFit="cover" />
                    ) : (
                      <LinearGradient colors={AvatarGradient.colors} style={styles.avatar} />
                    )}
                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                      <Text style={[TextStyles.cardTitle, { color: colors.foreground }]}>
                        {m.user?.username ?? 'Member'}
                      </Text>
                      {!!m.tier?.name && (
                        <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>{m.tier.name}</Text>
                      )}
                    </View>
                    {m.role === 'admin' && <Badge label="Admin" color="#fff" bg={colors.primary} />}
                  </Pressable>
                ))
              )}
            </View>
          )}

          {tab === 'shows' && (
            <View style={{ marginTop: Spacing.lg }}>
              {showsQ.isLoading ? (
                <LoadingState />
              ) : showsQ.isError ? (
                <ErrorState onRetry={showsQ.refetch} />
              ) : societyShows.length === 0 ? (
                <EmptyState title="No shows yet" message="This society hasn't listed any shows." />
              ) : (
                societyShows.map((show) => (
                  <Pressable
                    key={show.id}
                    testID={`row-society-show-${show.id}`}
                    onPress={() => navigation.navigate('ShowDetail', { slug: show.slug })}
                    style={[styles.showRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    {show.imageUrl ? (
                      <Image source={{ uri: show.imageUrl }} style={styles.showThumb} contentFit="cover" />
                    ) : (
                      <LinearGradient colors={PrimaryGradient.colors} style={styles.showThumb} />
                    )}
                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                      <Text numberOfLines={2} style={[TextStyles.cardTitle, { color: colors.foreground }]}>
                        {show.title}
                      </Text>
                      <Text style={[TextStyles.caption, { color: colors.primary, marginTop: 4 }]}>
                        {formatDateRange(show.startDate, show.endDate)}
                      </Text>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Apply modal */}
      <Modal visible={applyOpen} transparent animationType="slide" onRequestClose={() => setApplyOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
          <Pressable style={styles.modalBackdrop} onPress={() => setApplyOpen(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[TextStyles.h3, { color: colors.foreground }]}>Request to join</Text>
              <Pressable testID="button-close-apply-join" onPress={() => setApplyOpen(false)}>
                <X size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <Text style={[TextStyles.body, { color: colors.mutedForeground, marginBottom: Spacing.md }]}>
              Tell {society.name} a little about yourself (optional).
            </Text>
            <TextInput
              testID="input-apply-message"
              value={applyMessage}
              onChangeText={setApplyMessage}
              multiline
              placeholder="I'd love to join because…"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border, height: 100, textAlignVertical: 'top' },
              ]}
            />
            <View style={{ marginTop: Spacing.lg }}>
              <PrimaryButton testID="button-submit-join" label="Send request" loading={applying} onPress={submitApply} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 160 },
  body: { padding: Spacing.screenPadding },
  headerRow: { flexDirection: 'row', marginTop: -48 },
  logo: { width: 88, height: 88, borderRadius: Radius.lg, borderWidth: 3 },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  joinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tabRow: { flexDirection: 'row', marginTop: Spacing.xl, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'transparent' },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.md },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  avatar: { width: 44, height: 44, borderRadius: Radius.full },
  showRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  showThumb: { width: 56, height: 56, borderRadius: Radius.md },
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, ...TextStyles.body },
});
