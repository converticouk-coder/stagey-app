// ============================================================
// STAGEY MOBILE — POST A CASTING
// Restricted to society admins. We surface only societies where
// the user is an admin; backend enforces the RBAC (403 handled).
// ============================================================
import React, { useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { CastingsAPI, SocietiesAPI } from '../../services/api';
import { FormScreen, TextField, ChipSelect, SocietyPicker, ImageField, Gate } from '../../components/forms';
import { LoadingState, ErrorState } from '../../components/ui';
import { Screen } from '../../components/ui';
import { PRODUCTION_TYPE_LABELS } from '../../constants';
import type { ProductionType } from '../../types';

const PRODUCTION_OPTIONS = Object.entries(PRODUCTION_TYPE_LABELS).map(([value, label]) => ({
  value: value as ProductionType,
  label,
}));
const PERFORMER_OPTIONS = ['Vocalist', 'Actor', 'Dancer', 'Musician', 'Crew'].map((p) => ({ label: p, value: p }));
const ROLE_OPTIONS = ['Lead', 'Supporting', 'Ensemble', 'Featured Ensemble'].map((r) => ({ label: r, value: r }));

export default function CreateCastingScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showName, setShowName] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [rolesAvailable, setRolesAvailable] = useState('');
  const [performerType, setPerformerType] = useState<string | null>(null);
  const [roleType, setRoleType] = useState<string | null>(null);
  const [productionType, setProductionType] = useState<ProductionType | null>(null);
  const [societyId, setSocietyId] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const membershipsQ = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => SocietiesAPI.getUserMemberships(),
    enabled: isAuthenticated,
  });

  const adminSocieties = useMemo(
    () => (membershipsQ.data ?? []).filter((m) => m.role === 'admin' && m.status === 'approved'),
    [membershipsQ.data],
  );

  if (!isAuthenticated) {
    return <Gate title="Sign in required" message="Please sign in to post a casting call." />;
  }
  if (membershipsQ.isLoading) {
    return (
      <Screen>
        <LoadingState label="Checking your societies…" />
      </Screen>
    );
  }
  if (membershipsQ.isError) {
    return (
      <Screen>
        <ErrorState onRetry={membershipsQ.refetch} />
      </Screen>
    );
  }
  if (adminSocieties.length === 0) {
    return (
      <Gate
        title="Society admins only"
        message="Only society admins can post casting calls. You'll need to be an admin of a society to use this."
      />
    );
  }

  const submit = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a title' });
      return;
    }
    if (!societyId) {
      Toast.show({ type: 'error', text1: 'Please choose a society' });
      return;
    }
    setSubmitting(true);
    try {
      await CastingsAPI.create({
        title: title.trim(),
        description: description.trim() || undefined,
        showName: showName.trim() || undefined,
        location: location.trim() || undefined,
        deadline: deadline.trim() || undefined,
        rolesAvailable: rolesAvailable.trim() || undefined,
        performerType: performerType || undefined,
        roleType: roleType || undefined,
        productionType: productionType || undefined,
        societyId,
        imageUrl: images[0],
      });
      Toast.show({ type: 'success', text1: 'Casting posted!' });
      navigation.goBack();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not post', text2: e?.message ?? 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScreen submitLabel="Post casting" onSubmit={submit} loading={submitting}>
      <TextField label="Casting title" value={title} onChangeText={setTitle} required testID="input-casting-title" placeholder="e.g. Auditions for Oliver!" />
      <SocietyPicker memberships={adminSocieties} value={societyId} onChange={setSocietyId} required />
      <TextField label="Show name" value={showName} onChangeText={setShowName} testID="input-casting-show" />
      <ImageField label="Image" images={images} onChange={setImages} />
      <TextField label="Description" value={description} onChangeText={setDescription} multiline testID="input-casting-description" />
      <TextField label="Roles available" value={rolesAvailable} onChangeText={setRolesAvailable} multiline testID="input-casting-roles" placeholder="List the roles you're casting…" />
      <ChipSelect label="Performer type" options={PERFORMER_OPTIONS} value={performerType} onChange={setPerformerType} />
      <ChipSelect label="Role type" options={ROLE_OPTIONS} value={roleType} onChange={setRoleType} />
      <ChipSelect label="Production type" options={PRODUCTION_OPTIONS} value={productionType} onChange={setProductionType} />
      <TextField label="Location" value={location} onChangeText={setLocation} testID="input-casting-location" />
      <TextField label="Application deadline (YYYY-MM-DD)" value={deadline} onChangeText={setDeadline} testID="input-casting-deadline" placeholder="2026-08-01" />
    </FormScreen>
  );
}
