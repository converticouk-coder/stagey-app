// ============================================================
// STAGEY MOBILE — FORGOT PASSWORD SCREEN
// POST /api/auth/forgot-password via AuthAPI.forgotPassword()
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
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { X, MailCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { PrimaryGradient } from '../../constants/colors';
import { TextStyles, Spacing, Radius } from '../../constants';
import { AuthAPI } from '../../services/api';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your email' });
      return;
    }
    setSubmitting(true);
    try {
      await AuthAPI.forgotPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      // Backend intentionally returns success regardless to avoid account enumeration.
      setSent(true);
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
        <Pressable style={styles.close} onPress={() => navigation.goBack()} testID="button-close-forgot">
          <X size={24} color={colors.foreground} />
        </Pressable>

        {sent ? (
          <View style={styles.sentWrap}>
            <MailCheck size={48} color={colors.primary} />
            <Text style={[TextStyles.h2, { color: colors.foreground, textAlign: 'center', marginTop: Spacing.lg }]}>
              Check your inbox
            </Text>
            <Text
              style={[TextStyles.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: Spacing.sm }]}
              testID="text-forgot-confirmation"
            >
              If an account exists for {email.trim()}, we've sent a link to reset your password.
            </Text>
            <Pressable onPress={() => navigation.navigate('ResetPassword', {})} testID="link-have-token" style={{ marginTop: Spacing.xl }}>
              <Text style={[TextStyles.button, { color: colors.primary }]}>I have a reset code</Text>
            </Pressable>
            <Pressable onPress={() => navigation.replace('Login')} testID="link-back-to-login" style={{ marginTop: Spacing.lg }}>
              <Text style={[TextStyles.body, { color: colors.mutedForeground }]}>Back to sign in</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={[TextStyles.heroTitle, { color: colors.foreground }]}>Reset password</Text>
            <Text style={[TextStyles.body, { color: colors.mutedForeground, marginBottom: Spacing.xxl }]}>
              Enter your email and we'll send you a reset link.
            </Text>

            <Text style={[TextStyles.label, styles.fieldLabel, { color: colors.foreground }]}>Email</Text>
            <TextInput
              testID="input-email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
            />

            <Pressable onPress={onSubmit} disabled={submitting} testID="button-submit-forgot" style={{ marginTop: Spacing.xl }}>
              <LinearGradient
                colors={PrimaryGradient.colors}
                start={PrimaryGradient.start}
                end={PrimaryGradient.end}
                style={styles.submit}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={[TextStyles.button, { color: '#fff' }]}>Send reset link</Text>}
              </LinearGradient>
            </Pressable>
          </>
        )}
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
  sentWrap: { alignItems: 'center', marginTop: Spacing.xxl },
});
