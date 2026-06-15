// ============================================================
// STAGEY MOBILE — CREATE A SOCIETY
// Restricted to organisation / pro / business / platform admins.
// Backend enforces RBAC; 403 is handled gracefully.
// ============================================================
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { SocietiesAPI } from '../../services/api';
import { FormScreen, TextField, ImageField, Gate } from '../../components/forms';
import type { UserRole } from '../../types';

const ELIGIBLE_ROLES: UserRole[] = [
  'organisation_admin',
  'society_pro',
  'business_account',
  'platform_admin',
];

export default function CreateSocietyScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated, user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [foundingYear, setFoundingYear] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return <Gate title="Sign in required" message="Please sign in to create a society." />;
  }
  if (!user || !ELIGIBLE_ROLES.includes(user.role)) {
    return (
      <Gate
        title="Upgrade required"
        message="Creating a society profile requires an organisation or business account. Upgrade your account to get started."
      />
    );
  }

  const submit = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a society name' });
      return;
    }
    setSubmitting(true);
    try {
      const society = await SocietiesAPI.create({
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
        foundingYear: foundingYear.trim() ? Number(foundingYear) : undefined,
        logoUrl: images[0],
      });
      Toast.show({ type: 'success', text1: 'Society created!' });
      if (society?.slug) {
        navigation.replace('SocietyProfile', { slug: society.slug });
      } else {
        navigation.goBack();
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not create society', text2: e?.message ?? 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScreen submitLabel="Create society" onSubmit={submit} loading={submitting}>
      <TextField label="Society name" value={name} onChangeText={setName} required testID="input-society-name" placeholder="e.g. Riverside Musical Theatre" />
      <ImageField label="Logo" images={images} onChange={setImages} />
      <TextField label="Description" value={description} onChangeText={setDescription} multiline testID="input-society-description" />
      <TextField label="Location" value={location} onChangeText={setLocation} testID="input-society-location" placeholder="United Kingdom" />
      <TextField label="Website" value={website} onChangeText={setWebsite} keyboardType="url" testID="input-society-website" placeholder="https://…" />
      <TextField label="Founding year" value={foundingYear} onChangeText={setFoundingYear} keyboardType="numeric" testID="input-society-founded" placeholder="2010" />
    </FormScreen>
  );
}
