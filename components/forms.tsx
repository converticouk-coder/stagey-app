// ============================================================
// STAGEY MOBILE — FORM PRIMITIVES (used by the create flows)
// FormScreen wrapper, TextField, ChipSelect, SocietyPicker,
// ImageField (expo-image-picker + UploadAPI) and an access Gate.
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
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { ImagePlus, X, Lock, Check } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { UploadAPI } from '../services/api';
import { Screen, PrimaryButton, EmptyState, useListBottomPadding } from './ui';
import { TextStyles, Spacing, Radius } from '../constants';
import type { MembershipWithSociety } from '../types';

export function FormScreen({
  children,
  submitLabel,
  onSubmit,
  loading,
  disabled,
}: {
  children: React.ReactNode;
  submitLabel: string;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const bottomPad = useListBottomPadding();
  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
          <View style={{ marginTop: Spacing.xl }}>
            <PrimaryButton
              testID="button-form-submit"
              label={submitLabel}
              onPress={onSubmit}
              loading={loading}
              disabled={disabled}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  required,
  testID,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'url' | 'email-address';
  required?: boolean;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: Spacing.lg }}>
      <Text style={[TextStyles.label, { color: colors.foreground, marginBottom: Spacing.xs }]}>
        {label}
        {required && <Text style={{ color: colors.destructive }}> *</Text>}
      </Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'url' || keyboardType === 'email-address' ? 'none' : 'sentences'}
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            color: colors.foreground,
            borderColor: colors.border,
            height: multiline ? 100 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
    </View>
  );
}

export function ChipSelect<T extends string | number>({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T | null;
  onChange: (v: T) => void;
  required?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: Spacing.lg }}>
      <Text style={[TextStyles.label, { color: colors.foreground, marginBottom: Spacing.sm }]}>
        {label}
        {required && <Text style={{ color: colors.destructive }}> *</Text>}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        {options.map((o) => {
          const active = value === o.value;
          return (
            <Pressable
              key={String(o.value)}
              testID={`chip-select-${o.value}`}
              onPress={() => onChange(o.value)}
              style={[
                styles.selectChip,
                {
                  backgroundColor: active ? colors.primary : colors.secondary,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[TextStyles.label, { color: active ? '#fff' : colors.foreground }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SocietyPicker({
  memberships,
  value,
  onChange,
  required,
}: {
  memberships: MembershipWithSociety[];
  value: number | null;
  onChange: (id: number) => void;
  required?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: Spacing.lg }}>
      <Text style={[TextStyles.label, { color: colors.foreground, marginBottom: Spacing.sm }]}>
        Society
        {required && <Text style={{ color: colors.destructive }}> *</Text>}
      </Text>
      {memberships.map((m) => {
        const active = value === m.society.id;
        return (
          <Pressable
            key={m.society.id}
            testID={`option-society-${m.society.id}`}
            onPress={() => onChange(m.society.id)}
            style={[
              styles.societyOption,
              { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.secondary : 'transparent' },
            ]}
          >
            <Text style={[TextStyles.body, { color: colors.foreground, flex: 1 }]}>{m.society.name}</Text>
            {active && <Check size={18} color={colors.primary} />}
          </Pressable>
        );
      })}
    </View>
  );
}

export function ImageField({
  label,
  images,
  onChange,
  multiple,
}: {
  label: string;
  images: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const { colors } = useTheme();
  const [uploading, setUploading] = useState(false);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Toast.show({ type: 'error', text1: 'Permission needed', text2: 'Allow photo access to add images.' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: !!multiple,
    });
    if (result.canceled) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const asset of result.assets) {
        const url = await UploadAPI.uploadImage(asset.uri);
        uploaded.push(url);
      }
      onChange(multiple ? [...images, ...uploaded] : uploaded.slice(0, 1));
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Upload failed', text2: e?.message ?? 'Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const remove = (url: string) => onChange(images.filter((u) => u !== url));

  return (
    <View style={{ marginTop: Spacing.lg }}>
      <Text style={[TextStyles.label, { color: colors.foreground, marginBottom: Spacing.sm }]}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        {images.map((url) => (
          <View key={url}>
            <Image source={{ uri: url }} style={styles.thumb} contentFit="cover" />
            <Pressable
              testID={`button-remove-image`}
              onPress={() => remove(url)}
              style={[styles.removeBtn, { backgroundColor: colors.destructive }]}
            >
              <X size={12} color="#fff" />
            </Pressable>
          </View>
        ))}
        {(multiple || images.length === 0) && (
          <Pressable
            testID="button-add-image"
            onPress={pick}
            disabled={uploading}
            style={[styles.addImage, { borderColor: colors.border, backgroundColor: colors.secondary }]}
          >
            {uploading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <ImagePlus size={24} color={colors.mutedForeground} />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** Full-screen gate shown when the user lacks permission for a create flow. */
export function Gate({ title, message }: { title: string; message: string }) {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  return (
    <Screen>
      <EmptyState
        title={title}
        message={message}
        icon={<Lock size={40} color={colors.mutedForeground} />}
        actionLabel="Go back"
        onAction={() => navigation.goBack()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...TextStyles.body,
  },
  selectChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  societyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  thumb: { width: 80, height: 80, borderRadius: Radius.md },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImage: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
