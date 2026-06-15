// ============================================================
// STAGEY MOBILE — COMPETITION DETAIL + ENTER
// Shows competition info, prizes, winners. Entry form adapts to the
// competition's entryMethod (simple / question / multiple_choice /
// image_upload / social_link). Entry is keyed by competition ID.
// ============================================================
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Trophy, Award, CheckCircle, Upload } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CompetitionsAPI, UploadAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  Badge,
  SectionHeader,
  PrimaryButton,
  useListBottomPadding,
  formatDate,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';

export default function CompetitionDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const slug = route.params?.slug as string;
  const bottomPad = useListBottomPadding();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['competition', slug],
    queryFn: () => CompetitionsAPI.getBySlug(slug),
    enabled: !!slug,
  });

  const competition = data?.competition;
  const winners = data?.winners ?? [];

  const { data: entryState } = useQuery({
    queryKey: ['competition-entry', competition?.id],
    queryFn: () => CompetitionsAPI.getEntry(competition!.id),
    enabled: competition != null,
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [socialLink, setSocialLink] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !prefilled) {
      setName([user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || '');
      setEmail(user.email || '');
      setPrefilled(true);
    }
  }, [isAuthenticated, user, prefilled]);

  const options = useMemo<string[]>(() => {
    const cfg = competition?.entryConfiguration as any;
    return Array.isArray(cfg?.options) ? cfg.options : [];
  }, [competition]);
  const questionText = (competition?.entryConfiguration as any)?.question as string | undefined;

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    setUploading(true);
    try {
      const url = await UploadAPI.uploadImage(result.assets[0].uri);
      setImageUrl(url);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Upload failed', text2: e?.message });
    } finally {
      setUploading(false);
    }
  }

  async function handleEnter() {
    if (!competition) return;
    if (competition.requiresLogin && !isAuthenticated) {
      Toast.show({ type: 'info', text1: 'Sign in required', text2: 'Please sign in to enter.' });
      return;
    }
    if (!name.trim() || !email.trim()) {
      Toast.show({ type: 'error', text1: 'Name and email required' });
      return;
    }
    const entryData: Record<string, unknown> = {};
    switch (competition.entryMethod) {
      case 'question':
        if (!answer.trim()) return Toast.show({ type: 'error', text1: 'Please answer the question' });
        entryData.answer = answer.trim();
        break;
      case 'multiple_choice':
        if (!selectedOption) return Toast.show({ type: 'error', text1: 'Please select an option' });
        entryData.selectedOption = selectedOption;
        break;
      case 'image_upload':
        if (!imageUrl) return Toast.show({ type: 'error', text1: 'Please upload an image' });
        entryData.imageUrl = imageUrl;
        break;
      case 'social_link':
        if (!socialLink.trim()) return Toast.show({ type: 'error', text1: 'Please add your link' });
        entryData.socialLink = socialLink.trim();
        break;
    }
    setSubmitting(true);
    try {
      await CompetitionsAPI.enter(competition.id, {
        entrantName: name.trim(),
        entrantEmail: email.trim(),
        entryData: Object.keys(entryData).length ? entryData : undefined,
      });
      Toast.show({ type: 'success', text1: 'Entry submitted!', text2: 'Good luck 🎭' });
      await queryClient.invalidateQueries({ queryKey: ['competition-entry', competition.id] });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not enter', text2: e?.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <Screen><LoadingState label="Loading competition…" /></Screen>;
  if (isError || !competition) return <Screen><ErrorState onRetry={refetch} /></Screen>;

  const isActive = competition.status === 'active';
  const hasEntered = entryState?.entered;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} keyboardShouldPersistTaps="handled">
        {competition.imageUrl && <Image source={{ uri: competition.imageUrl }} style={styles.cover} contentFit="cover" />}
        <View style={{ padding: Spacing.screenPadding }}>
          <Text testID="text-competition-title" style={[TextStyles.h2, { color: colors.foreground }]}>
            {competition.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm, flexWrap: 'wrap' }}>
            <Badge label={competition.status} color="#fff" bg={colors.primary} />
            {!!competition.endsAt && <Badge label={isActive ? `Closes ${formatDate(competition.endsAt)}` : `Ended ${formatDate(competition.endsAt)}`} />}
          </View>

          <Text style={[TextStyles.body, { color: colors.foreground, marginTop: Spacing.lg }]}>
            {competition.description}
          </Text>

          {!!competition.prizes?.length && (
            <View style={styles.section}>
              <SectionHeader title="Prizes" />
              {competition.prizes.map((p, i) => (
                <View key={i} testID={`row-prize-${i}`} style={styles.prizeRow}>
                  <Award size={18} color={colors.primary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <Text style={[TextStyles.label, { color: colors.foreground }]}>
                      {p.position ? `#${p.position} — ` : ''}{p.title || 'Prize'}{p.value ? ` (${p.value})` : ''}
                    </Text>
                    {!!p.description && (
                      <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>{p.description}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {winners.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Winners" />
              {winners.map((w) => (
                <View key={w.id} testID={`row-winner-${w.id}`} style={styles.prizeRow}>
                  <Trophy size={18} color="#EAB308" />
                  <Text style={[TextStyles.label, { color: colors.foreground, marginLeft: Spacing.sm }]}>
                    {w.position ? `#${w.position} ` : ''}{w.entrantName || 'Winner'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Entry */}
          {hasEntered ? (
            <View style={[styles.enteredBox, { borderColor: colors.primary }]}>
              <CheckCircle size={20} color={colors.primary} />
              <Text style={[TextStyles.label, { color: colors.primary, marginLeft: Spacing.sm }]}>
                You've entered this competition
              </Text>
            </View>
          ) : isActive ? (
            <View style={styles.section}>
              <SectionHeader title="Enter" />
              <TextInput
                testID="input-entrant-name"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
              />
              <TextInput
                testID="input-entrant-email"
                value={email}
                onChangeText={setEmail}
                placeholder="Your email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
              />

              {competition.entryMethod === 'question' && (
                <>
                  {!!questionText && <Text style={[TextStyles.label, { color: colors.foreground, marginBottom: Spacing.xs }]}>{questionText}</Text>}
                  <TextInput
                    testID="input-entry-answer"
                    value={answer}
                    onChangeText={setAnswer}
                    placeholder="Your answer"
                    multiline
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.input, styles.multiline, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                  />
                </>
              )}

              {competition.entryMethod === 'multiple_choice' && (
                <View style={{ marginBottom: Spacing.md }}>
                  {!!questionText && <Text style={[TextStyles.label, { color: colors.foreground, marginBottom: Spacing.xs }]}>{questionText}</Text>}
                  {options.map((opt) => (
                    <Pressable
                      key={opt}
                      testID={`option-entry-${opt}`}
                      onPress={() => setSelectedOption(opt)}
                      style={[
                        styles.option,
                        { borderColor: selectedOption === opt ? colors.primary : colors.border, backgroundColor: selectedOption === opt ? colors.primary : 'transparent' },
                      ]}
                    >
                      <Text style={[TextStyles.body, { color: selectedOption === opt ? '#fff' : colors.foreground }]}>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {competition.entryMethod === 'image_upload' && (
                <Pressable
                  testID="button-entry-upload"
                  onPress={pickImage}
                  style={[styles.uploadBox, { borderColor: colors.border }]}
                >
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.uploadPreview} contentFit="cover" />
                  ) : (
                    <>
                      <Upload size={24} color={colors.mutedForeground} />
                      <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: Spacing.xs }]}>
                        {uploading ? 'Uploading…' : 'Tap to upload an image'}
                      </Text>
                    </>
                  )}
                </Pressable>
              )}

              {competition.entryMethod === 'social_link' && (
                <TextInput
                  testID="input-entry-social"
                  value={socialLink}
                  onChangeText={setSocialLink}
                  placeholder="Link to your post"
                  autoCapitalize="none"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                />
              )}

              <PrimaryButton
                testID="button-enter-competition"
                label="Submit entry"
                loading={submitting}
                disabled={uploading}
                onPress={handleEnter}
              />
            </View>
          ) : (
            <View style={[styles.enteredBox, { borderColor: colors.border }]}>
              <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>
                This competition is no longer accepting entries.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 200 },
  section: { marginTop: Spacing.xl },
  prizeRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  input: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    ...TextStyles.body,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  option: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  uploadBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  uploadPreview: { width: '100%', height: 160 },
  enteredBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});
