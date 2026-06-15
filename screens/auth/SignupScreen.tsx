// ============================================================
// STAGEY MOBILE — SIGN UP SCREEN
// POST /api/auth/signup via AuthContext.register()
// Guardian email is required for under-18s (backend enforces this too).
// ============================================================
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { PrimaryGradient } from '../../constants/colors';
import { TextStyles, Spacing, Radius } from '../../constants';

function ageFromDob(dob: string): number | null {
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const age = useMemo(() => (dateOfBirth ? ageFromDob(dateOfBirth) : null), [dateOfBirth]);
  const isMinor = age !== null && age < 18;

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    testID: string,
    extra?: object,
  ) => (
    <>
      <Text style={[TextStyles.label, styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
        {...extra}
      />
    </>
  );

  const onSubmit = async () => {
    if (!firstName || !lastName || !username || !email || !password || !dateOfBirth) {
      Toast.show({ type: 'error', text1: 'Please complete all required fields' });
      return;
    }
    if (isMinor && !guardianEmail.trim()) {
      Toast.show({ type: 'error', text1: 'A parent or guardian email is required for under-18s' });
      return;
    }
    setSubmitting(true);
    try {
      await register({
        firstName,
        lastName,
        username,
        email: email.trim(),
        password,
        dateOfBirth,
        guardianEmail: isMinor ? guardianEmail.trim() : undefined,
      });
      navigation.goBack();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Sign up failed', text2: e?.message ?? 'Please try again' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.close} onPress={() => navigation.goBack()} testID="button-close-signup">
          <X size={24} color={colors.foreground} />
        </Pressable>

        <Text style={[TextStyles.heroTitle, { color: colors.foreground }]}>Create your account</Text>
        <Text style={[TextStyles.body, { color: colors.mutedForeground, marginBottom: Spacing.lg }]}>
          Join the musical theatre community
        </Text>

        {field('First name', firstName, setFirstName, 'input-firstName')}
        {field('Last name', lastName, setLastName, 'input-lastName')}
        {field('Username', username, setUsername, 'input-username', { autoCapitalize: 'none' })}
        {field('Email', email, setEmail, 'input-email', {
          autoCapitalize: 'none',
          keyboardType: 'email-address',
        })}
        {field('Password', password, setPassword, 'input-password', { secureTextEntry: true })}
        {field('Date of birth (YYYY-MM-DD)', dateOfBirth, setDateOfBirth, 'input-dateOfBirth', {
          placeholder: '2000-01-31',
          keyboardType: 'numbers-and-punctuation',
        })}

        {isMinor &&
          field('Parent / guardian email', guardianEmail, setGuardianEmail, 'input-guardianEmail', {
            autoCapitalize: 'none',
            keyboardType: 'email-address',
          })}

        <Pressable onPress={onSubmit} disabled={submitting} testID="button-submit-signup" style={{ marginTop: Spacing.xl }}>
          <LinearGradient
            colors={PrimaryGradient.colors}
            start={PrimaryGradient.start}
            end={PrimaryGradient.end}
            style={styles.submit}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={[TextStyles.button, { color: '#fff' }]}>Create account</Text>}
          </LinearGradient>
        </Pressable>

        <View style={styles.footer}>
          <Text style={[TextStyles.body, { color: colors.mutedForeground }]}>Already have an account? </Text>
          <Pressable onPress={() => navigation.replace('Login')} testID="link-login">
            <Text style={[TextStyles.button, { color: colors.primary }]}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Spacing.screenPadding },
  close: { alignSelf: 'flex-end', padding: Spacing.sm, marginBottom: Spacing.md },
  fieldLabel: { marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...TextStyles.body,
  },
  submit: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
});
