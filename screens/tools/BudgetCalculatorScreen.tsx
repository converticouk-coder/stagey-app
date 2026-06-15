// ============================================================
// STAGEY MOBILE — SHOW BUDGET CALCULATOR
// Build a budget across expense categories, see running total, save it.
// Saved budgets live under MyBudgets. Data shape mirrors web:
// { categories: BudgetExpenseCategory[] }.
// ============================================================
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Plus, Trash2, Save, Calculator } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { BudgetsAPI } from '../../services/api';
import {
  Screen,
  PrimaryButton,
  useListBottomPadding,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, BUDGET_EXPENSE_CATEGORIES } from '../../constants';
import type { BudgetExpenseCategory } from '../../types';

// Budget amounts are stored in whole pounds (not pence), so format directly.
function gbp(amount: number) {
  return `£${amount.toFixed(2).replace(/\.00$/, '')}`;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function seedCategories(): BudgetExpenseCategory[] {
  return BUDGET_EXPENSE_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    emoji: c.emoji,
    items: [],
  }));
}

export default function BudgetCalculatorScreen() {
  const { colors } = useTheme();
  const bottomPad = useListBottomPadding();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [categories, setCategories] = useState<BudgetExpenseCategory[]>(seedCategories);
  const [saving, setSaving] = useState(false);

  const total = useMemo(
    () => categories.reduce((sum, c) => sum + c.items.reduce((s, i) => s + (Number(i.amount) || 0), 0), 0),
    [categories],
  );

  function addItem(catId: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, items: [...c.items, { id: makeId(), label: '', amount: 0 }] } : c)),
    );
  }

  function updateItem(catId: string, itemId: string, patch: Partial<{ label: string; amount: number }>) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) } : c,
      ),
    );
  }

  function removeItem(catId: string, itemId: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c)),
    );
  }

  async function save() {
    if (!isAuthenticated) {
      Toast.show({ type: 'info', text1: 'Sign in to save', text2: 'Create a free account to save budgets.' });
      return;
    }
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Name your budget first' });
      return;
    }
    setSaving(true);
    try {
      await BudgetsAPI.create(name.trim(), { categories });
      Toast.show({ type: 'success', text1: 'Budget saved' });
      navigation.navigate('MyBudgets');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not save', text2: e?.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md }}>
          <Calculator size={24} color={colors.primary} />
          <Text style={[TextStyles.h2, { color: colors.foreground }]}>Show Budget</Text>
        </View>

        <TextInput
          testID="input-budget-name"
          value={name}
          onChangeText={setName}
          placeholder="Budget name (e.g. Spring 2026 Production)"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
        />

        {categories.map((cat) => {
          const catTotal = cat.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
          return (
            <View key={cat.id} style={styles.catBlock}>
              <View style={styles.catHeader}>
                <Text style={[TextStyles.sectionHeader, { color: colors.foreground }]}>{`${cat.emoji} ${cat.label}`}</Text>
                {catTotal > 0 && (
                  <Text style={[TextStyles.label, { color: colors.primary }]}>{gbp(catTotal)}</Text>
                )}
              </View>
              {cat.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <TextInput
                    testID={`input-item-label-${item.id}`}
                    value={item.label}
                    onChangeText={(t) => updateItem(cat.id, item.id, { label: t })}
                    placeholder="Item"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.itemLabel, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                  />
                  <TextInput
                    testID={`input-item-amount-${item.id}`}
                    value={item.amount ? String(item.amount) : ''}
                    onChangeText={(t) => updateItem(cat.id, item.id, { amount: parseFloat(t.replace(/[^0-9.]/g, '')) || 0 })}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.itemAmount, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                  />
                  <Pressable testID={`button-remove-item-${item.id}`} onPress={() => removeItem(cat.id, item.id)} style={styles.iconBtn}>
                    <Trash2 size={18} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              ))}
              <Pressable testID={`button-add-item-${cat.id}`} onPress={() => addItem(cat.id)} style={styles.addRow}>
                <Plus size={16} color={colors.primary} />
                <Text style={[TextStyles.label, { color: colors.primary, marginLeft: 4 }]}>Add item</Text>
              </Pressable>
            </View>
          );
        })}

        <View style={[styles.totalBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[TextStyles.h4, { color: colors.foreground }]}>Total</Text>
          <Text testID="text-budget-total" style={[TextStyles.h3, { color: colors.primary }]}>{gbp(total)}</Text>
        </View>

        <View style={{ marginTop: Spacing.lg }}>
          <PrimaryButton testID="button-save-budget" label="Save budget" icon={<Save size={16} color="#fff" />} loading={saving} onPress={save} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    ...TextStyles.body,
  },
  catBlock: { marginBottom: Spacing.lg },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  itemLabel: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...TextStyles.body,
  },
  itemAmount: {
    width: 90,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    textAlign: 'right',
    ...TextStyles.body,
  },
  iconBtn: { padding: Spacing.xs },
  addRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  totalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
});
