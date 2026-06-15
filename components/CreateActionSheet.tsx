// ============================================================
// STAGEY MOBILE — CREATE ACTION SHEET
// Bottom sheet triggered by the "+" FAB in the tab bar (only when
// authenticated). Offers the three create flows from NAVIGATION-SPEC.
// ============================================================
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, Drama, PartyPopper, Building2, X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/colors';
import { TextStyles, Spacing, Radius } from '../constants';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const OPTIONS = [
  { key: 'CreateListing', label: 'List on Marketplace', icon: ShoppingBag },
  { key: 'CreateCasting', label: 'Post a Casting', icon: Drama },
  { key: 'SubmitShow', label: 'Submit a Show', icon: PartyPopper },
  { key: 'CreateSociety', label: 'Create a Society', icon: Building2 },
] as const;

export default function CreateActionSheet({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const go = (screen: string) => {
    onClose();
    navigation.navigate(screen);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: Colors.overlay.darker }]}
        onPress={onClose}
        testID="backdrop-create-sheet"
      >
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
          onPress={() => {}}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <Text style={[TextStyles.h3, { color: colors.foreground }]}>
              Create
            </Text>
            <Pressable onPress={onClose} testID="button-close-create-sheet">
              <X size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <Pressable
                key={o.key}
                testID={`button-create-${o.key}`}
                onPress={() => go(o.key)}
                style={[styles.row, { backgroundColor: colors.secondary }]}
              >
                <Icon size={20} color={colors.primary} />
                <Text
                  style={[
                    TextStyles.button,
                    { color: colors.foreground, marginLeft: Spacing.md },
                  ]}
                >
                  {o.label}
                </Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
});
