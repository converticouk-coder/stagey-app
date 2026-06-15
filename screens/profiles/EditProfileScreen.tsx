// ============================================================
// STAGEY MOBILE — EDIT PROFILE
// Edits the signed-in user's profile via PATCH /api/users/:id.
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { AuthAPI } from '../../services/api';
import { Screen, EmptyState, useListBottomPadding } from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';
import type { User } from '../../types';

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const bottomPad = useListBottomPadding();
  const { user, isAuthenticated, updateUser, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [headline, setHeadline] = useState(user?.headline ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [skills, setSkills] = useState((user?.skills ?? []).join(', '));
  const [dreamRoles, setDreamRoles] = useState((user?.dreamRoles ?? []).join(', '));
  const [hidden, setHidden] = useState(user?.profileVisibility === 'hidden');

  const save = useMutation({
    mutationFn: () => {
      const payload: Partial<User> = {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        username: username.trim() || undefined,
        headline: headline.trim() || null,
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
        skills: splitList(skills),
        dreamRoles: splitList(dreamRoles),
        profileVisibility: hidden ? 'hidden' : 'public',
      };
      return AuthAPI.updateProfile(user!.id, payload);
    },
    onSuccess: async (updated) => {
      updateUser(updated);
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Toast.show({ type: 'success', text1: 'Profile saved' });
      navigation.goBack();
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Could not save',
        text2: err?.message ?? 'Please try again.',
      });
    },
  });

  if (!isAuthenticated || !user) {
    return (
      <Screen>
        <EmptyState
          title="Sign in to edit your profile"
          actionLabel="Sign in"
          onAction={() => navigation.navigate('Login')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}>
          <Field label="First name" value={firstName} onChangeText={setFirstName} testID="input-firstName" />
          <Field label="Last name" value={lastName} onChangeText={setLastName} testID="input-lastName" />
          <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" testID="input-username" />
          <Field label="Headline" value={headline} onChangeText={setHeadline} placeholder="e.g. Soprano · West Yorkshire" testID="input-headline" />
          <Field label="Location" value={location} onChangeText={setLocation} testID="input-location" />
          <Field label="Bio" value={bio} onChangeText={setBio} multiline testID="input-bio" />
          <Field label="Skills (comma separated)" value={skills} onChangeText={setSkills} placeholder="Singing, Tap, Acting" testID="input-skills" />
          <Field label="Dream roles (comma separated)" value={dreamRoles} onChangeText={setDreamRoles} placeholder="Elphaba, Jean Valjean" testID="input-dreamRoles" />

          <Pressable
            testID="switch-profile-visibility"
            onPress={() => setHidden((h) => !h)}
            style={[styles.toggleRow, { borderColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[TextStyles.h5, { color: colors.foreground }]}>Hidden profile</Text>
              <Text style={[TextStyles.caption, { color: colors.mutedForeground }]}>
                {hidden ? 'Your profile is hidden from search.' : 'Your profile is visible to the community.'}
              </Text>
            </View>
            <View style={[styles.switch, { backgroundColor: hidden ? colors.primary : colors.border }]}>
              <View style={[styles.knob, { alignSelf: hidden ? 'flex-end' : 'flex-start' }]} />
            </View>
          </Pressable>

          <Pressable
            testID="button-save-profile"
            onPress={() => save.mutate()}
            disabled={save.isPending}
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: save.isPending ? 0.6 : 1 }]}
          >
            {save.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[TextStyles.button, { color: '#fff' }]}>Save changes</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({
  label,
  multiline,
  testID,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences';
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text style={[TextStyles.label, { color: colors.foreground, marginBottom: Spacing.xs }]}>{label}</Text>
      <TextInput
        testID={testID}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            borderColor: colors.border,
            color: colors.foreground,
            height: multiline ? 110 : 46,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...TextStyles.body,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: Radius.full,
    padding: 3,
    justifyContent: 'center',
  },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  saveBtn: {
    height: 50,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
});
