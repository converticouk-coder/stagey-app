// ============================================================
// STAGEY MOBILE — CASTING DETAIL + APPLY
// Shows full casting details and an apply flow (modal form).
// Applying requires auth; minors need guardian consent approved.
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
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
  Calendar,
  MapPin,
  Building2,
  Clock,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CastingsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  Badge,
  PrimaryButton,
  useListBottomPadding,
  formatDate,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, PrimaryGradient } from '../../constants';

export default function CastingDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as number;
  const bottomPad = useListBottomPadding();
  const { isAuthenticated, isMinor, isGuardianPending, user } = useAuth();

  const [applyOpen, setApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(' '),
  );
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [notes, setNotes] = useState('');

  const { data: casting, isLoading, isError, refetch } = useQuery({
    queryKey: ['casting', id],
    queryFn: () => CastingsAPI.getById(id),
    enabled: !!id,
  });

  const submitApplication = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your name' });
      return;
    }
    setSubmitting(true);
    try {
      await CastingsAPI.submitApplication({
        castingId: id,
        name: name.trim(),
        experience: experience.trim() || undefined,
        availability: availability.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setApplyOpen(false);
      setExperience('');
      setAvailability('');
      setNotes('');
      Toast.show({ type: 'success', text1: 'Application sent!', text2: 'The society will be in touch.' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not apply', text2: e?.message ?? 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const onApplyPress = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    if (isMinor && isGuardianPending) {
      Toast.show({
        type: 'error',
        text1: 'Guardian consent pending',
        text2: 'A parent/guardian must approve your account before you can apply.',
      });
      return;
    }
    setApplyOpen(true);
  };

  if (isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading casting…" />
      </Screen>
    );
  }
  if (isError || !casting) {
    return (
      <Screen>
        <ErrorState message="We couldn't load this casting." onRetry={refetch} />
      </Screen>
    );
  }

  const roles = casting.roles ?? [];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 80 }} testID="scroll-casting-detail">
        {casting.imageUrl ? (
          <Image source={{ uri: casting.imageUrl }} style={styles.hero} contentFit="cover" />
        ) : (
          <LinearGradient colors={PrimaryGradient.colors} style={styles.hero} />
        )}

        <View style={styles.body}>
          <View style={{ flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm, flexWrap: 'wrap' }}>
            {casting.isOpen ? (
              <Badge label="Open" color="#fff" bg={colors.success} />
            ) : (
              <Badge label="Closed" color="#fff" bg={colors.mutedForeground} />
            )}
            {!!casting.roleType && <Badge label={casting.roleType} />}
            {!!casting.performerType && <Badge label={casting.performerType} />}
          </View>

          <Text testID="text-casting-title" style={[TextStyles.h1, { color: colors.foreground }]}>
            {casting.title}
          </Text>

          {!!casting.showName && (
            <Text style={[TextStyles.bodyLarge, { color: colors.primary, marginTop: 4 }]}>
              {casting.showName}
            </Text>
          )}

          {!!(casting.societyName || casting.company) && (
            <View style={styles.metaRow}>
              <Building2 size={18} color={colors.mutedForeground} />
              <Text style={[TextStyles.body, { color: colors.foreground, marginLeft: Spacing.sm }]}>
                {casting.societyName ?? casting.company}
              </Text>
            </View>
          )}
          {!!casting.location && (
            <View style={styles.metaRow}>
              <MapPin size={18} color={colors.mutedForeground} />
              <Text style={[TextStyles.body, { color: colors.foreground, marginLeft: Spacing.sm }]}>
                {casting.location}
              </Text>
            </View>
          )}
          {!!casting.deadline && (
            <View style={styles.metaRow}>
              <Clock size={18} color={colors.warning} />
              <Text style={[TextStyles.body, { color: colors.warning, marginLeft: Spacing.sm }]}>
                Applications close {formatDate(casting.deadline)}
              </Text>
            </View>
          )}

          {/* Roles */}
          {(roles.length > 0 || !!casting.rolesAvailable) && (
            <View style={{ marginTop: Spacing.xl }}>
              <Text style={[TextStyles.sectionHeader, { color: colors.foreground, marginBottom: Spacing.sm }]}>
                Roles available
              </Text>
              {roles.length > 0 ? (
                roles.map((r, i) => (
                  <View key={i} style={[styles.roleRow, { borderColor: colors.border }]}>
                    <ChevronRight size={16} color={colors.primary} />
                    <Text style={[TextStyles.body, { color: colors.foreground, marginLeft: Spacing.sm }]}>{r}</Text>
                  </View>
                ))
              ) : (
                <Text style={[TextStyles.body, { color: colors.mutedForeground }]}>{casting.rolesAvailable}</Text>
              )}
            </View>
          )}

          {/* Description */}
          {!!casting.description && (
            <View style={{ marginTop: Spacing.xl }}>
              <Text style={[TextStyles.sectionHeader, { color: colors.foreground, marginBottom: Spacing.sm }]}>
                Details
              </Text>
              <Text style={[TextStyles.bodyLarge, { color: colors.mutedForeground }]}>{casting.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky apply bar */}
      <View style={[styles.applyBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Spacing.lg }]}>
        {casting.isOpen ? (
          <PrimaryButton testID="button-apply-casting" label="Apply to this casting" onPress={onApplyPress} />
        ) : (
          <View style={[styles.closedNote, { backgroundColor: colors.secondary }]}>
            <Text style={[TextStyles.label, { color: colors.mutedForeground }]}>Applications are closed</Text>
          </View>
        )}
      </View>

      {/* Apply modal */}
      <Modal visible={applyOpen} transparent animationType="slide" onRequestClose={() => setApplyOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
          <Pressable style={styles.modalBackdrop} onPress={() => setApplyOpen(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[TextStyles.h3, { color: colors.foreground }]}>Apply</Text>
              <Pressable testID="button-close-apply" onPress={() => setApplyOpen(false)}>
                <X size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Field label="Your name" value={name} onChangeText={setName} testID="input-apply-name" />
              <Field
                label="Relevant experience"
                value={experience}
                onChangeText={setExperience}
                multiline
                testID="input-apply-experience"
              />
              <Field
                label="Availability"
                value={availability}
                onChangeText={setAvailability}
                multiline
                testID="input-apply-availability"
              />
              <Field
                label="Anything else?"
                value={notes}
                onChangeText={setNotes}
                multiline
                testID="input-apply-notes"
              />
              <View style={{ marginTop: Spacing.lg }}>
                <PrimaryButton
                  testID="button-submit-application"
                  label="Send application"
                  loading={submitting}
                  onPress={submitApplication}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  testID,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: Spacing.md }}>
      <Text style={[TextStyles.label, { color: colors.foreground, marginBottom: Spacing.xs }]}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            color: colors.foreground,
            borderColor: colors.border,
            height: multiline ? 88 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 200 },
  body: { padding: Spacing.screenPadding },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  applyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  closedNote: {
    paddingVertical: Spacing.lg,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...TextStyles.body,
  },
});
