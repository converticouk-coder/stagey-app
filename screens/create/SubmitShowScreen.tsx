// ============================================================
// STAGEY MOBILE — SUBMIT A SHOW
// Any authenticated user can submit a show. Optionally link it to
// a society the user belongs to. Backend validates ownership.
// ============================================================
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { ShowsAPI, SocietiesAPI } from '../../services/api';
import { FormScreen, TextField, ChipSelect, SocietyPicker, ImageField, Gate } from '../../components/forms';
import { PRODUCTION_TYPE_LABELS } from '../../constants';
import type { ProductionType, ShowGenre } from '../../types';

const PRODUCTION_OPTIONS = Object.entries(PRODUCTION_TYPE_LABELS).map(([value, label]) => ({
  value: value as ProductionType,
  label,
}));
const GENRE_OPTIONS: { label: string; value: ShowGenre }[] = [
  'Musical', 'Play', 'Pantomime', 'Opera', 'Revue', 'Jukebox Musical', 'Other',
].map((g) => ({ label: g, value: g as ShowGenre }));

export default function SubmitShowScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [genre, setGenre] = useState<ShowGenre | null>(null);
  const [productionType, setProductionType] = useState<ProductionType | null>(null);
  const [ticketUrl, setTicketUrl] = useState('');
  const [societyId, setSocietyId] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const membershipsQ = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => SocietiesAPI.getUserMemberships(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <Gate title="Sign in required" message="Please sign in to submit a show." />;
  }

  const memberships = membershipsQ.data ?? [];

  const submit = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a show title' });
      return;
    }
    if (!startDate.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a start date' });
      return;
    }
    setSubmitting(true);
    try {
      await ShowsAPI.create({
        title: title.trim(),
        description: description.trim() || undefined,
        venue: venue.trim() || undefined,
        location: location.trim() || undefined,
        startDate: startDate.trim(),
        endDate: endDate.trim() || undefined,
        genre: genre || undefined,
        productionType: productionType || undefined,
        ticketUrl: ticketUrl.trim() || undefined,
        imageUrl: images[0],
        societyId: societyId || undefined,
      });
      Toast.show({ type: 'success', text1: 'Show submitted!', text2: 'It will appear once approved.' });
      navigation.goBack();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not submit', text2: e?.message ?? 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScreen submitLabel="Submit show" onSubmit={submit} loading={submitting}>
      <TextField label="Show title" value={title} onChangeText={setTitle} required testID="input-show-title" placeholder="e.g. Les Misérables" />
      <ImageField label="Poster / image" images={images} onChange={setImages} />
      <TextField label="Description" value={description} onChangeText={setDescription} multiline testID="input-show-description" />
      <TextField label="Start date (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} required testID="input-show-start" placeholder="2026-09-01" />
      <TextField label="End date (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} testID="input-show-end" placeholder="2026-09-07" />
      <TextField label="Venue" value={venue} onChangeText={setVenue} testID="input-show-venue" />
      <TextField label="Location" value={location} onChangeText={setLocation} testID="input-show-location" />
      <ChipSelect label="Genre" options={GENRE_OPTIONS} value={genre} onChange={setGenre} />
      <ChipSelect label="Production type" options={PRODUCTION_OPTIONS} value={productionType} onChange={setProductionType} />
      <TextField label="Ticket URL" value={ticketUrl} onChangeText={setTicketUrl} keyboardType="url" testID="input-show-ticket" placeholder="https://…" />
      {memberships.length > 0 && (
        <SocietyPicker memberships={memberships} value={societyId} onChange={setSocietyId} />
      )}
    </FormScreen>
  );
}
