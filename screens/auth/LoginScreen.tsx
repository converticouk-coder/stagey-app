// ============================================================
// STAGEY MOBILE — LOGIN SCREEN
// POST /api/auth/login via AuthContext.login()
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
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { PrimaryGradient } from '../../constants/colors';
import { TextStyles, Spacing, Radius } from '../../constants';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Please enter your email and password' });
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigation.goBack();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Login failed', text2: e?.message ?? 'Please try again' });
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
        <Pressable
          style={styles.close}
          onPress={() => navigation.goBack()}
          testID="button-close-login"
        >
          <X size={24} color={colors.foreground} />
        </Pressable>

        <Text style={[TextStyles.heroTitle, { color: colors.foreground }]}>Welcome back</Text>
        <Text style={[TextStyles.body, { color: colors.mutedForeground, marginBottom: Spacing.xxl }]}>
          Sign in to your Stagey account
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

        <Text style={[TextStyles.label, styles.fieldLabel, { color: colors.foreground }]}>Password</Text>
        <TextInput
          testID="input-password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
        />

        <Pressable
          onPress={() => navigation.navigate('ForgotPassword')}
          testID="link-forgot-password"
          style={styles.forgot}
        >
          <Text style={[TextStyles.label, { color: colors.primary }]}>Forgot password?</Text>
        </Pressable>

        <Pressable onPress={onSubmit} disabled={submitting} testID="button-submit-login">
          <LinearGradient
            colors={PrimaryGradient.colors}
            start={PrimaryGradient.start}
            end={PrimaryGradient.end}
            style={styles.submit}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[TextStyles.button, { color: '#fff' }]}>Sign In</Text>
            )}
          </LinearGradient>
        </Pressable>

        <View style={styles.footer}>
          <Text style={[TextStyles.body, { color: colors.mutedForeground }]}>New to Stagey? </Text>
          <Pressable onPress={() => navigation.replace('Signup')} testID="link-signup">
            <Text style={[TextStyles.button, { color: colors.primary }]}>Create an account</Text>
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
  forgot: { alignSelf: 'flex-end', marginTop: Spacing.md, marginBottom: Spacing.xl },
  submit: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
});
