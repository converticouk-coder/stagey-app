// ============================================================
// STAGEY MOBILE — MARKETPLACE ITEM DETAIL + ENQUIRY
// Image carousel, price/condition, seller + society, description,
// and an enquiry flow that opens a message conversation.
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { MapPin, Building2, MessageCircle, X, ShoppingBag } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { MarketplaceAPI, ConversationsAPI } from '../../services/api';
import {
  Screen,
  LoadingState,
  ErrorState,
  Badge,
  PrimaryButton,
  useListBottomPadding,
  formatPrice,
  timeAgo,
} from '../../components/ui';
import { TextStyles, Spacing, Radius, SALE_TYPE_LABELS } from '../../constants';

const { width } = Dimensions.get('window');

export default function MarketplaceItemScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const slug = route.params?.slug as string;
  const bottomPad = useListBottomPadding();
  const { isAuthenticated, user } = useAuth();

  const [imgIndex, setImgIndex] = useState(0);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const { data: item, isLoading, isError, refetch } = useQuery({
    queryKey: ['marketplace-item', slug],
    queryFn: () => MarketplaceAPI.getBySlug(slug),
    enabled: !!slug,
  });

  const onEnquirePress = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    setMessage(`Hi, is "${item?.title}" still available?`);
    setEnquiryOpen(true);
  };

  const sendEnquiry = async () => {
    if (!item || !message.trim()) return;
    setSending(true);
    try {
      const conversation = await ConversationsAPI.create(item.sellerId, message.trim(), item.id);
      setEnquiryOpen(false);
      setMessage('');
      Toast.show({ type: 'success', text1: 'Enquiry sent!' });
      if (conversation?.id) {
        navigation.navigate('Conversation', { conversationId: conversation.id });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Could not send', text2: e?.message ?? 'Please try again.' });
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading listing…" />
      </Screen>
    );
  }
  if (isError || !item) {
    return (
      <Screen>
        <ErrorState message="We couldn't load this listing." onRetry={refetch} />
      </Screen>
    );
  }

  const images = item.imageUrls ?? [];
  const isOwnListing = isAuthenticated && user?.id === item.sellerId;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 80 }} testID="scroll-marketplace-item">
        {/* Image carousel */}
        {images.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            >
              {images.map((uri, i) => (
                <Image key={i} source={{ uri }} style={{ width, height: width }} contentFit="cover" />
              ))}
            </ScrollView>
            {images.length > 1 && (
              <View style={styles.dots}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, { backgroundColor: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.5)' }]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.noImg, { backgroundColor: colors.secondary }]}>
            <ShoppingBag size={48} color={colors.mutedForeground} />
          </View>
        )}

        <View style={styles.body}>
          <Text testID="text-item-title" style={[TextStyles.h2, { color: colors.foreground }]}>
            {item.title}
          </Text>
          <Text style={[TextStyles.h3, { color: colors.primary, marginTop: Spacing.xs }]}>
            {formatPrice(item.price, item.isFree, item.saleType)}
          </Text>

          <View style={{ flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm, flexWrap: 'wrap' }}>
            <Badge label={SALE_TYPE_LABELS[item.saleType] ?? item.saleType} color="#fff" bg={colors.primary} />
            {!!item.condition && <Badge label={item.condition} />}
            <Badge label={item.type} />
          </View>

          {!!item.location && (
            <View style={styles.metaRow}>
              <MapPin size={18} color={colors.mutedForeground} />
              <Text style={[TextStyles.body, { color: colors.foreground, marginLeft: Spacing.sm }]}>
                {item.location}
              </Text>
            </View>
          )}
          {!!item.societyName && (
            <View style={styles.metaRow}>
              <Building2 size={18} color={colors.mutedForeground} />
              <Text style={[TextStyles.body, { color: colors.foreground, marginLeft: Spacing.sm }]}>
                Listed by {item.societyName}
              </Text>
            </View>
          )}
          <Text style={[TextStyles.caption, { color: colors.mutedForeground, marginTop: Spacing.sm }]}>
            {item.sellerName ? `Seller: ${item.sellerName} · ` : ''}Listed {timeAgo(item.createdAt)}
          </Text>

          {!!item.description && (
            <View style={{ marginTop: Spacing.xl }}>
              <Text style={[TextStyles.sectionHeader, { color: colors.foreground, marginBottom: Spacing.sm }]}>
                Description
              </Text>
              <Text style={[TextStyles.bodyLarge, { color: colors.mutedForeground }]}>{item.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky enquiry bar */}
      {!isOwnListing && (
        <View style={[styles.bar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Spacing.lg }]}>
          <PrimaryButton
            testID="button-enquire"
            label="Enquire about this item"
            icon={<MessageCircle size={18} color="#fff" />}
            onPress={onEnquirePress}
          />
        </View>
      )}

      {/* Enquiry modal */}
      <Modal visible={enquiryOpen} transparent animationType="slide" onRequestClose={() => setEnquiryOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
          <Pressable style={styles.modalBackdrop} onPress={() => setEnquiryOpen(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[TextStyles.h3, { color: colors.foreground }]}>Send enquiry</Text>
              <Pressable testID="button-close-enquiry" onPress={() => setEnquiryOpen(false)}>
                <X size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <TextInput
              testID="input-enquiry-message"
              value={message}
              onChangeText={setMessage}
              multiline
              placeholder="Your message…"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border, height: 110, textAlignVertical: 'top' },
              ]}
            />
            <View style={{ marginTop: Spacing.lg }}>
              <PrimaryButton testID="button-send-enquiry" label="Send" loading={sending} onPress={sendEnquiry} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  noImg: { width: '100%', height: 240, alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: Spacing.md, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: Radius.full },
  body: { padding: Spacing.screenPadding },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, ...TextStyles.body },
});
