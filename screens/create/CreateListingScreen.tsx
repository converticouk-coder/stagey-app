// ============================================================
// STAGEY MOBILE — LIST ON MARKETPLACE
// Restricted to society admins; listings must be linked to a
// society. Backend enforces RBAC (403 handled gracefully).
// ============================================================
import React, { useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { MarketplaceAPI, SocietiesAPI } from '../../services/api';
import { FormScreen, TextField, ChipSelect, SocietyPicker, ImageField, Gate } from '../../components/forms';
import { Screen, LoadingState, ErrorState } from '../../components/ui';
import { SALE_TYPE_LABELS } from '../../constants';
import type { MarketplaceItemType, SaleType, ItemCondition } from '../../types';

const TYPE_OPTIONS: { label: string; value: MarketplaceItemType }[] = [
  { label: 'Costume', value: 'costume' },
  { label: 'Props', value: 'props' },
  { label: 'Staging / Set', value: 'staging' },
  { label: 'Sound', value: 'sound' },
  { label: 'Lighting', value: 'lighting' },
  { label: 'Jewellery', value: 'jewellery' },
  { label: 'Other', value: 'other' },
];
const SALE_OPTIONS = Object.entries(SALE_TYPE_LABELS).map(([value, label]) => ({
  value: value as SaleType,
  label,
}));
const CONDITION_OPTIONS: { label: string; value: ItemCondition }[] = [
  'New', 'Excellent', 'Good', 'Fair', 'Poor',
].map((c) => ({ label: c, value: c as ItemCondition }));

export default function CreateListingScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MarketplaceItemType | null>(null);
  const [saleType, setSaleType] = useState<SaleType | null>('buy');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [location, setLocation] = useState('');
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
    return <Gate title="Sign in required" message="Please sign in to list an item." />;
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
        message="Only society admins can post marketplace listings, and each listing must belong to a society."
      />
    );
  }

  const isFree = saleType === 'free';

  const submit = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a title' });
      return;
    }
    if (!type) {
      Toast.show({ type: 'error', text1: 'Please choose a category' });
      return;
    }
    if (!societyId) {
      Toast.show({ type: 'error', text1: 'Please choose a society' });
      return;
    }
    if (!isFree && (!price.trim() || isNaN(Number(price)))) {
      Toast.show({ type: 'error', text1: 'Please enter a valid price' });
      return;
    }
    setSubmitting(true);
    try {
      await MarketplaceAPI.create({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        saleType: saleType || 'buy',
        price: isFree ? 0 : Math.round(Number(price) * 100),
        condition: condition || undefined,
        location: location.trim() || undefined,
        societyId,
        imageUrls: images,
      });
      Toast.show({ type: 'success', text1: 'Listing created!' });
      navigation.goBack();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not create listing', text2: e?.message ?? 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScreen submitLabel="Create listing" onSubmit={submit} loading={submitting}>
      <TextField label="Item title" value={title} onChangeText={setTitle} required testID="input-listing-title" placeholder="e.g. Victorian costume set" />
      <ImageField label="Photos" images={images} onChange={setImages} multiple />
      <SocietyPicker memberships={adminSocieties} value={societyId} onChange={setSocietyId} required />
      <ChipSelect label="Category" options={TYPE_OPTIONS} value={type} onChange={setType} required />
      <ChipSelect label="Listing type" options={SALE_OPTIONS} value={saleType} onChange={setSaleType} required />
      {!isFree && (
        <TextField label="Price (£)" value={price} onChangeText={setPrice} keyboardType="numeric" required testID="input-listing-price" placeholder="0.00" />
      )}
      <ChipSelect label="Condition" options={CONDITION_OPTIONS} value={condition} onChange={setCondition} />
      <TextField label="Description" value={description} onChangeText={setDescription} multiline testID="input-listing-description" />
      <TextField label="Location" value={location} onChangeText={setLocation} testID="input-listing-location" />
    </FormScreen>
  );
}
