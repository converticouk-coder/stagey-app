// ============================================================
// STAGEY MOBILE — RESET PASSWORD SCREEN
// POST /api/auth/reset-password via AuthAPI.resetPassword()
// Token arrives via deep link (route param) or is pasted manually.
// ============================================================
import React, { useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { PrimaryGradient } from '../../constants/colors';
import { TextStyles, Spacing, Radius } from '../../constants';
import { AuthAPI } from '../../services/api';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [token, setToken] = useState<string>(route.params?.token ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!token.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your reset code' });
      return;
    }
    if (password.length < 8) {
      Toast.show({ type: 'error', text1: 'Password must be at least 8 characters' });
      return;
    }
    if (password !== confirm) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }
    setSubmitting(true);
    try {
      await AuthAPI.resetPassword(token.trim(), password);
      Toast.show({ type: 'success', text1: 'Password updated', text2: 'You can now sign in.' });
      navigation.replace('Login');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Reset failed', text2: e?.message ?? 'The link may have expired' });
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
        <Pressable style={styles.close} onPress={() => navigation.goBack()} testID="button-close-reset">
          <X size={24} color={colors.foreground} />
        </Pressable>

        <Text style={[TextStyles.heroTitle, { color: colors.foreground }]}>Set a new password</Text>
        <Text style={[TextStyles.body, { color: colors.mutedForeground, marginBottom: Spacing.xxl }]}>
          Enter the code from your email and choose a new password.
        </Text>

        {!route.params?.token && (
          <>
            <Text style={[TextStyles.label, styles.fieldLabel, { color: colors.foreground }]}>Reset code</Text>
            <TextInput
              testID="input-token"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              placeholder="Paste your reset code"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
            />
          </>
        )}

        <Text style={[TextStyles.label, styles.fieldLabel, { color: colors.foreground }]}>New password</Text>
        <TextInput
          testID="input-password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
        />

        <Text style={[TextStyles.label, styles.fieldLabel, { color: colors.foreground }]}>Confirm password</Text>
        <TextInput
          testID="input-confirm-password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
        />

        <Pressable onPress={onSubmit} disabled={submitting} testID="button-submit-reset" style={{ marginTop: Spacing.xl }}>
          <LinearGradient
            colors={PrimaryGradient.colors}
            start={PrimaryGradient.start}
            end={PrimaryGradient.end}
            style={styles.submit}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={[TextStyles.button, { color: '#fff' }]}>Update password</Text>}
          </LinearGradient>
        </Pressable>
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
});
