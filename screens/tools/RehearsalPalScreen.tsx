// ============================================================
// STAGEY MOBILE — REHEARSAL PAL™ (society admins only)
// Gate: user must be admin of at least one society (getUserMemberships
// → role === 'admin'). Pick a society, view upcoming rehearsals, add one.
// Mirrors the web Rehearsal Pal tool. Shows a "testing" dev banner.
// ============================================================
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { CalendarClock, MapPin, Plus, Lock, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { SocietiesAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  EmptyState,
  Badge,
  PrimaryButton,
  useListBottomPadding,
  formatDate,
} from '../../components/ui';
import { TextStyles, Spacing, Radius } from '../../constants';
import type { MembershipWithSociety } from '../../types';

export default function RehearsalPalScreen() {
  const { colors } = useTheme();
  const bottomPad = useListBottomPadding();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: memberships, isLoading: loadingMemberships } = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => SocietiesAPI.getUserMemberships(),
    enabled: isAuthenticated,
  });

  const adminSocieties = useMemo<MembershipWithSociety[]>(
    () => (memberships ?? []).filter((m) => m.role === 'admin'),
    [memberships],
  );

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const activeSlug = selectedSlug ?? adminSocieties[0]?.society.slug ?? null;
  const activeSociety = adminSocieties.find((m) => m.society.slug === activeSlug)?.society;

  const { data: rehearsals, isLoading: loadingRehearsals, isError, refetch, isRefetching } = useQuery({
    queryKey: ['rehearsals', activeSlug],
    queryFn: () => SocietiesAPI.getRehearsals(activeSlug!),
    enabled: !!activeSlug,
  });

  // New rehearsal form
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  async function createRehearsal() {
    if (!activeSlug) return;
    if (!date.trim() || !time.trim() || !location.trim()) {
      Toast.show({ type: 'error', text1: 'Date, time and location required' });
      return;
    }
    setSaving(true);
    try {
      await SocietiesAPI.createRehearsal(activeSlug, { date: date.trim(), time: time.trim(), location: location.trim(), notes: notes.trim() || undefined });
      setDate(''); setTime(''); setLocation(''); setNotes('');
      setFormOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['rehearsals', activeSlug] });
      Toast.show({ type: 'success', text1: 'Rehearsal added' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not add', text2: e?.message });
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          title="Society admins only"
          message="Sign in with a society admin account to use Rehearsal Pal."
          icon={<Lock size={40} color={colors.mutedForeground} />}
        />
      </Screen>
    );
  }

  if (loadingMemberships) return <Screen><LoadingState label="Checking access…" /></Screen>;

  if (adminSocieties.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Society admins only"
          message="Rehearsal Pal is available to society administrators. If you run a society, ask to be made an admin."
          icon={<Lock size={40} color={colors.mutedForeground} />}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ padding: Spacing.screenPadding, paddingBottom: 0 }}>
        <View style={[styles.devBanner, { backgroundColor: '#F59E0B22', borderColor: '#F59E0B' }]}>
          <Text style={[TextStyles.caption, { color: '#B45309' }]}>
            Rehearsal Pal™ is in active testing — features may change.
          </Text>
        </View>

        {adminSocieties.length > 1 && (
          <Pressable testID="button-society-picker" onPress={() => setPickerOpen((o) => !o)} style={[styles.picker, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[TextStyles.label, { color: colors.foreground, flex: 1 }]}>{activeSociety?.name ?? 'Select society'}</Text>
            <ChevronDown size={18} color={colors.mutedForeground} />
          </Pressable>
        )}
        {pickerOpen && adminSocieties.length > 1 && (
          <View style={[styles.pickerMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {adminSocieties.map((m) => (
              <Pressable
                key={m.society.id}
                testID={`option-society-${m.society.id}`}
                onPress={() => { setSelectedSlug(m.society.slug); setPickerOpen(false); }}
                style={styles.pickerItem}
              >
                <Text style={[TextStyles.body, { color: m.society.slug === activeSlug ? colors.primary : colors.foreground }]}>{m.society.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable testID="button-toggle-rehearsal-form" onPress={() => setFormOpen((o) => !o)} style={[styles.addToggle, { borderColor: colors.primary }]}>
          <Plus size={18} color={colors.primary} />
          <Text style={[TextStyles.label, { color: colors.primary, marginLeft: Spacing.sm }]}>{formOpen ? 'Cancel' : 'Add rehearsal'}</Text>
        </Pressable>
      </View>

      {formOpen ? (
        <ScrollView contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }} keyboardShouldPersistTaps="handled">
          <TextInput testID="input-rehearsal-date" value={date} onChangeText={setDate} placeholder="Date (YYYY-MM-DD)" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]} />
          <TextInput testID="input-rehearsal-time" value={time} onChangeText={setTime} placeholder="Time (e.g. 19:00)" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]} />
          <TextInput testID="input-rehearsal-location" value={location} onChangeText={setLocation} placeholder="Location" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]} />
          <TextInput testID="input-rehearsal-notes" value={notes} onChangeText={setNotes} placeholder="Notes (optional)" multiline placeholderTextColor={colors.mutedForeground} style={[styles.input, styles.multiline, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]} />
          <PrimaryButton testID="button-save-rehearsal" label="Save rehearsal" loading={saving} onPress={createRehearsal} />
        </ScrollView>
      ) : loadingRehearsals ? (
        <LoadingState label="Loading rehearsals…" />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (rehearsals ?? []).length === 0 ? (
        <EmptyState title="No rehearsals scheduled" message="Add your first rehearsal above." icon={<CalendarClock size={40} color={colors.mutedForeground} />} />
      ) : (
        <FlatList
          data={rehearsals}
          keyExtractor={(item) => String(item.id)}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: bottomPad }}
          renderItem={({ item }) => (
            <View testID={`card-rehearsal-${item.id}`} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: item.isCancelled ? 0.5 : 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                <CalendarClock size={16} color={colors.primary} />
                <Text style={[TextStyles.label, { color: colors.foreground, flex: 1 }]}>{formatDate(item.date)} · {item.time}</Text>
                {item.isCancelled && <Badge label="Cancelled" color="#fff" bg="#EF4444" />}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs }}>
                <MapPin size={14} color={colors.mutedForeground} />
                <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginLeft: 4 }]}>{item.location}</Text>
              </View>
              {!!item.showName && <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>{item.showName}</Text>}
              {!!item.notes && <Text style={[TextStyles.body, { color: colors.foreground, marginTop: Spacing.sm }]}>{item.notes}</Text>}
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  devBanner: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  pickerMenu: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  pickerItem: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  addToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    ...TextStyles.body,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
  },
});
