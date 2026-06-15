// ============================================================
// STAGEY MOBILE — NOTICE BOARD COMPONENT
// Drop this file into: components/NoticeBoard.tsx
//
// Used on the Society Profile screen, in the "About" section.
// Replicates the sticky-note pinboard from the web app exactly.
//
// Dependencies:
//   npx expo install expo-linear-gradient
//   npm install react-native-modal  (or use built-in Modal)
//
// Props:
//   societySlug  — the society's URL slug (e.g. "adams-club")
//   isAdmin      — true if the current user is a society admin
//   isPlatformAdmin — true if user.role === 'platform_admin'
//
// Behaviour:
//   - Non-admins: shows notices if any exist; hides the whole
//     component if there are no notices (matches web app)
//   - Admins: always shows the board; empty state has "Add Notice"
//   - Pinned notices: shown with a red dot "pushpin" at top centre
//   - Each notice has a slight random rotation (visual effect)
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../services/api';
import type { SocietyNotice, NoticeColor, NoticeType } from '../types';

// ── Colour palette for sticky notes ──────────────────────────
// These match the web app's Tailwind colour classes exactly.

interface NoteColour {
  background: string;
  border: string;
  shadow: string;
  text: string;
}

const NOTE_COLOURS: Record<NoticeColor, NoteColour> = {
  yellow:  { background: '#FEF9C3', border: '#FDE047', shadow: '#FEF08A', text: '#713F12' },
  pink:    { background: '#FCE7F3', border: '#F9A8D4', shadow: '#FBCFE8', text: '#831843' },
  blue:    { background: '#DBEAFE', border: '#93C5FD', shadow: '#BFDBFE', text: '#1E3A8A' },
  green:   { background: '#DCFCE7', border: '#86EFAC', shadow: '#BBF7D0', text: '#14532D' },
  purple:  { background: '#F3E8FF', border: '#C084FC', shadow: '#E9D5FF', text: '#581C87' },
  orange:  { background: '#FFEDD5', border: '#FDBA74', shadow: '#FED7AA', text: '#7C2D12' },
};

// ── Notice type icons (text emoji, no icon library needed) ────
const NOTICE_TYPE_ICONS: Record<NoticeType, string> = {
  update:       '✨',
  announcement: '🔔',
  celebration:  '🎉',
  reminder:     '⏰',
  news:         '📰',
};

// ── Rotation values for the sticky note tilt effect ───────────
const ROTATIONS = [-1.5, 1.5, -2, 2, 0];

// ── Helper: format date as "12 Jan" ──────────────────────────
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

interface NoticeBoardProps {
  societySlug: string;
  isAdmin: boolean;
  isPlatformAdmin?: boolean;
}

export default function NoticeBoard({ societySlug, isAdmin, isPlatformAdmin = false }: NoticeBoardProps) {
  const canManage = isAdmin || isPlatformAdmin;

  const [notices, setNotices] = useState<SocietyNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state for creating a new notice
  const [form, setForm] = useState<{
    title: string;
    content: string;
    color: NoticeColor;
    noticeType: NoticeType;
  }>({
    title: '',
    content: '',
    color: 'yellow',
    noticeType: 'update',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch notices ───────────────────────────────────────────
  const fetchNotices = useCallback(async () => {
    try {
      const data = await apiClient.societies.getNotices(societySlug);
      setNotices(data);
    } catch (err) {
      // Silently fail — don't crash the society page
      console.error('NoticeBoard fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [societySlug]);

  // Fetch on mount
  React.useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // ── Create notice ───────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setIsSubmitting(true);
    try {
      const newNotice = await apiClient.societies.createNotice(societySlug, form);
      setNotices(prev => [newNotice, ...prev]);
      setModalVisible(false);
      setForm({ title: '', content: '', color: 'yellow', noticeType: 'update' });
    } catch {
      Alert.alert('Error', 'Could not post notice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Toggle pin ──────────────────────────────────────────────
  const handleTogglePin = async (notice: SocietyNotice) => {
    try {
      const updated = await apiClient.societies.togglePinNotice(societySlug, notice.id, notice.isPinned);
      setNotices(prev => prev.map(n => n.id === notice.id ? updated : n));
    } catch {
      Alert.alert('Error', 'Could not update notice.');
    }
  };

  // ── Delete notice ───────────────────────────────────────────
  const handleDelete = (notice: SocietyNotice) => {
    Alert.alert(
      'Delete Notice',
      `Remove "${notice.title}" from the board?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.societies.deleteNotice(societySlug, notice.id);
              setNotices(prev => prev.filter(n => n.id !== notice.id));
            } catch {
              Alert.alert('Error', 'Could not delete notice.');
            }
          },
        },
      ]
    );
  };

  // ── Loading state ───────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  }

  // ── Hide entirely for non-admins when board is empty ─────────
  // Matches web app behaviour exactly.
  if (notices.length === 0 && !canManage) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* ── Header row ──────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📌 Notice Board</Text>
        {canManage && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>+ Add Notice</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Empty state (admins only) ────────────────────────── */}
      {notices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No notices yet. Tap "Add Notice" to post your first one!
          </Text>
        </View>
      ) : (
        /* ── Corkboard ────────────────────────────────────────── */
        <LinearGradient
          colors={['#FEF3C7', '#FFFBEB', '#FEF3C7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.corkboard}
        >
          <View style={styles.noticesGrid}>
            {notices.map((notice, index) => {
              const colour = NOTE_COLOURS[notice.color] ?? NOTE_COLOURS.yellow;
              const rotation = ROTATIONS[index % ROTATIONS.length];
              return (
                <StickyNote
                  key={notice.id}
                  notice={notice}
                  colour={colour}
                  rotation={rotation}
                  canManage={canManage}
                  onTogglePin={() => handleTogglePin(notice)}
                  onDelete={() => handleDelete(notice)}
                />
              );
            })}
          </View>
        </LinearGradient>
      )}

      {/* ── Add Notice Modal ─────────────────────────────────── */}
      {canManage && (
        <AddNoticeModal
          visible={modalVisible}
          form={form}
          isSubmitting={isSubmitting}
          onChange={setForm}
          onSubmit={handleCreate}
          onClose={() => {
            setModalVisible(false);
            setForm({ title: '', content: '', color: 'yellow', noticeType: 'update' });
          }}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Sticky Note Card
// ─────────────────────────────────────────────────────────────

interface StickyNoteProps {
  notice: SocietyNotice;
  colour: NoteColour;
  rotation: number;
  canManage: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
}

function StickyNote({ notice, colour, rotation, canManage, onTogglePin, onDelete }: StickyNoteProps) {
  return (
    <View
      style={[
        styles.note,
        {
          backgroundColor: colour.background,
          borderColor: colour.border,
          transform: [{ rotate: `${rotation}deg` }],
          shadowColor: colour.shadow,
        },
      ]}
    >
      {/* ── Red pushpin dot (when pinned) ─────────────────── */}
      {notice.isPinned && (
        <View style={styles.pinDot} />
      )}

      {/* ── Type row ─────────────────────────────────────── */}
      <View style={styles.noteTypeRow}>
        <Text style={[styles.noteTypeText, { color: colour.text }]}>
          {NOTICE_TYPE_ICONS[notice.noticeType as NoticeType] ?? '📝'}{' '}
          {notice.noticeType.toUpperCase()}
        </Text>

        {/* ── Admin controls ─────────────────────────────── */}
        {canManage && (
          <View style={styles.noteControls}>
            <TouchableOpacity
              onPress={onTogglePin}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.controlButton}
            >
              <Text style={styles.controlButtonText}>
                {notice.isPinned ? '📌' : '📍'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.controlButton}
            >
              <Text style={styles.controlButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Title ─────────────────────────────────────────── */}
      <Text style={[styles.noteTitle, { color: colour.text }]} numberOfLines={2}>
        {notice.title}
      </Text>

      {/* ── Content ───────────────────────────────────────── */}
      <Text style={[styles.noteContent, { color: colour.text }]} numberOfLines={5}>
        {notice.content}
      </Text>

      {/* ── Date ──────────────────────────────────────────── */}
      <Text style={[styles.noteDate, { color: colour.text }]}>
        {formatDate(notice.createdAt)}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Notice Modal
// ─────────────────────────────────────────────────────────────

const COLOUR_OPTIONS: { label: string; value: NoticeColor; emoji: string }[] = [
  { label: 'Yellow',  value: 'yellow',  emoji: '🟡' },
  { label: 'Pink',    value: 'pink',    emoji: '🩷' },
  { label: 'Blue',    value: 'blue',    emoji: '🔵' },
  { label: 'Green',   value: 'green',   emoji: '🟢' },
  { label: 'Purple',  value: 'purple',  emoji: '🟣' },
  { label: 'Orange',  value: 'orange',  emoji: '🟠' },
];

const TYPE_OPTIONS: { label: string; value: NoticeType; icon: string }[] = [
  { label: 'Update',       value: 'update',       icon: '✨' },
  { label: 'Announcement', value: 'announcement', icon: '🔔' },
  { label: 'Celebration',  value: 'celebration',  icon: '🎉' },
  { label: 'Reminder',     value: 'reminder',     icon: '⏰' },
  { label: 'News',         value: 'news',         icon: '📰' },
];

interface AddNoticeModalProps {
  visible: boolean;
  form: { title: string; content: string; color: NoticeColor; noticeType: NoticeType };
  isSubmitting: boolean;
  onChange: (form: any) => void;
  onSubmit: () => void;
  onClose: () => void;
}

function AddNoticeModal({ visible, form, isSubmitting, onChange, onSubmit, onClose }: AddNoticeModalProps) {
  const isValid = form.title.trim().length > 0 && form.content.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Modal header ───────────────────────────────── */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCancelButton}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Notice</Text>
          <TouchableOpacity
            onPress={onSubmit}
            style={[styles.modalPostButton, !isValid && styles.modalPostButtonDisabled]}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.modalPostText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
          {/* ── Title ──────────────────────────────────────── */}
          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput
            style={styles.textInput}
            value={form.title}
            onChangeText={(val) => onChange({ ...form, title: val })}
            placeholder="e.g. Rehearsal moved!"
            placeholderTextColor="#9CA3AF"
            maxLength={100}
          />

          {/* ── Content ────────────────────────────────────── */}
          <Text style={styles.fieldLabel}>Content</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={form.content}
            onChangeText={(val) => onChange({ ...form, content: val })}
            placeholder="Write your notice..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          {/* ── Colour picker ──────────────────────────────── */}
          <Text style={styles.fieldLabel}>Colour</Text>
          <View style={styles.colourRow}>
            {COLOUR_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.colourOption,
                  form.color === opt.value && styles.colourOptionSelected,
                  { backgroundColor: NOTE_COLOURS[opt.value].background, borderColor: NOTE_COLOURS[opt.value].border },
                ]}
                onPress={() => onChange({ ...form, color: opt.value })}
              >
                <Text style={styles.colourEmoji}>{opt.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Type picker ────────────────────────────────── */}
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.typeOption,
                  form.noticeType === opt.value && styles.typeOptionSelected,
                ]}
                onPress={() => onChange({ ...form, noticeType: opt.value })}
              >
                <Text style={styles.typeIcon}>{opt.icon}</Text>
                <Text style={[
                  styles.typeLabel,
                  form.noticeType === opt.value && styles.typeLabelSelected,
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Preview ─────────────────────────────────────── */}
          {(form.title || form.content) && (
            <View style={styles.previewSection}>
              <Text style={styles.fieldLabel}>Preview</Text>
              <View style={[
                styles.note,
                styles.previewNote,
                {
                  backgroundColor: NOTE_COLOURS[form.color].background,
                  borderColor: NOTE_COLOURS[form.color].border,
                },
              ]}>
                <Text style={[styles.noteTypeText, { color: NOTE_COLOURS[form.color].text }]}>
                  {NOTICE_TYPE_ICONS[form.noticeType]} {form.noticeType.toUpperCase()}
                </Text>
                {form.title ? (
                  <Text style={[styles.noteTitle, { color: NOTE_COLOURS[form.color].text }]}>
                    {form.title}
                  </Text>
                ) : null}
                {form.content ? (
                  <Text style={[styles.noteContent, { color: NOTE_COLOURS[form.color].text }]}>
                    {form.content}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  // ── Loading ───────────────────────────────────────────────
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  addButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  // ── Empty state ───────────────────────────────────────────
  emptyState: {
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // ── Corkboard ─────────────────────────────────────────────
  corkboard: {
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(146, 64, 14, 0.3)',
    padding: 12,
    minHeight: 180,
  },
  noticesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  // ── Sticky Note ───────────────────────────────────────────
  note: {
    width: '47%',
    minHeight: 120,
    borderWidth: 2,
    borderRadius: 2,
    padding: 10,
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  pinDot: {
    position: 'absolute',
    top: -6,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  noteTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noteTypeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
  },
  noteControls: {
    flexDirection: 'row',
    gap: 4,
  },
  controlButton: {
    padding: 2,
  },
  controlButtonText: {
    fontSize: 14,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'monospace',
  },
  noteContent: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Marker Felt' : 'monospace',
    flex: 1,
  },
  noteDate: {
    fontSize: 9,
    opacity: 0.6,
    textAlign: 'right',
    marginTop: 8,
  },

  // ── Modal ─────────────────────────────────────────────────
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalCancelButton: {
    padding: 4,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalPostButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  modalPostButtonDisabled: {
    backgroundColor: '#C4B5FD',
  },
  modalPostText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // ── Colour picker ─────────────────────────────────────────
  colourRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  colourOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colourOptionSelected: {
    borderWidth: 3,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  colourEmoji: {
    fontSize: 20,
  },

  // ── Type picker ───────────────────────────────────────────
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  typeOptionSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  typeIcon: {
    fontSize: 14,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeLabelSelected: {
    color: '#6D28D9',
    fontWeight: '600',
  },

  // ── Preview ───────────────────────────────────────────────
  previewSection: {
    marginBottom: 24,
  },
  previewNote: {
    width: '60%',
    alignSelf: 'center',
    transform: [{ rotate: '-1deg' }],
  },
});
