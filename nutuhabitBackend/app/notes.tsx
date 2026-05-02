import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, TextInput, Modal, Pressable,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HabitIcon } from '@/components/ui/HabitIcon';
import { useAuthStore } from '@/src/store/useAuthStore';
import { addNote, fetchNotes, deleteNote, FirebaseNote } from '@/src/services/notes';

// ── Helpers ───────────────────────────────────────────────────────────────────
const TR_MONTHS = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];

function toDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${TR_MONTHS[m - 1]} ${y}`;
}

function todaySort(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function NotesScreen() {
  const router = useRouter();
  const { user, isGuest } = useAuthStore();

  const [notes, setNotes] = useState<FirebaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [newText, setNewText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'habit' | 'personal'>('all');

  // Firebase'den notları çek
  const loadNotes = useCallback(async () => {
    if (isGuest || !user?.id) {
      setLoading(false);
      return;
    }
    try {
      const fetched = await fetchNotes(user.id);
      setNotes(fetched);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, isGuest]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotes();
  }, [loadNotes]);

  // Filtrelenmiş notlar
  const filteredNotes = useMemo(() => {
    if (filterType === 'all') return notes;
    return notes.filter((n) => n.status === filterType);
  }, [notes, filterType]);

  // Kişisel not ekle
  const handleAddNote = async () => {
    if (!newText.trim()) return;
    if (isGuest || !user?.id) {
      Alert.alert('Giriş Gerekli', 'Not eklemek için giriş yapmalısın.');
      return;
    }

    const today = todaySort();
    const result = await addNote(user.id, {
      text: newText.trim(),
      status: 'personal',
      date: today,
    });

    if (result) {
      setNotes((prev) => [result, ...prev]);
    }
    setNewText('');
    setAddVisible(false);
  };

  // Not sil
  const handleDelete = (noteId: string) => {
    Alert.alert(
      'Notu Sil',
      'Bu notu silmek istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(noteId);
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0e0428', '#180840', '#0d1448', '#050d20']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <View style={styles.backCircle}>
              <Ionicons name="chevron-back" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notlar</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Filter tabs */}
        <View style={styles.legend}>
          {([
            { key: 'all', label: 'Tümü', color: '#a855f7' },
            { key: 'habit', label: 'Alışkanlık notu', color: '#a855f7' },
            { key: 'personal', label: 'Kişisel not', color: '#60a5fa' },
          ] as { key: 'all' | 'habit' | 'personal'; label: string; color: string }[]).map((tab) => {
            const active = filterType === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterTab, active && { borderColor: tab.color, backgroundColor: `${tab.color}22` }]}
                onPress={() => setFilterType(tab.key)}
                activeOpacity={0.75}
              >
                <View style={[styles.legendDot, { backgroundColor: tab.color, opacity: active ? 1 : 0.4 }]} />
                <Text style={[styles.legendText, active && { color: tab.color, opacity: 1 }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#a855f7" />
            <Text style={styles.loadingText}>Notlar yükleniyor...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#a855f7"
                colors={['#a855f7']}
              />
            }
          >
            {filteredNotes.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>
                  Henüz not yok.{'\n'}Alışkanlık eklerken veya + butonuyla not oluşturabilirsin.
                </Text>
              </View>
            )}

            {filteredNotes.map((item) =>
              item.status === 'habit' ? (
                // ── Alışkanlık notu ────────────────────────────────────────────
                <Pressable
                  key={item.id}
                  style={styles.habitNoteCard}
                  onLongPress={() => handleDelete(item.id)}
                >
                  <View style={styles.habitAccentBar} />
                  <View style={styles.habitNoteInner}>
                    <View style={styles.habitNoteHeader}>
                      <View style={styles.habitBadge}>
                        {item.habitIcon && (
                          <HabitIcon icon={item.habitIcon} size={13} color="#d8b4fe" />
                        )}
                        <Text style={styles.habitBadgeName} numberOfLines={1}>
                          {item.habitName || 'Alışkanlık'}
                        </Text>
                      </View>
                      <Text style={styles.habitNoteDate}>{toDisplay(item.date)}</Text>
                    </View>
                    <Text style={styles.habitNoteText}>{item.text}</Text>
                  </View>
                </Pressable>
              ) : (
                // ── Kişisel not ────────────────────────────────────────────────
                <Pressable
                  key={item.id}
                  style={styles.personalNoteCard}
                  onLongPress={() => handleDelete(item.id)}
                >
                  <View style={styles.personalNoteHeader}>
                    <View style={styles.personalBadge}>
                      <Ionicons name="person" size={11} color="#93c5fd" />
                      <Text style={styles.personalBadgeText}>Kişisel</Text>
                    </View>
                    <Text style={styles.personalNoteDate}>{toDisplay(item.date)}</Text>
                  </View>
                  <Text style={styles.personalNoteText}>{item.text}</Text>
                </Pressable>
              )
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => setAddVisible(true)}
        >
          <LinearGradient
            colors={['#3b82f6', '#2563eb']}
            style={styles.fabGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Add personal note modal */}
      <Modal visible={addVisible} transparent animationType="slide" onRequestClose={() => setAddVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAddVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['rgba(30,50,120,0.97)', 'rgba(15,8,50,0.99)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <Ionicons name="person" size={16} color="#93c5fd" />
              <Text style={styles.modalTitle}>Kişisel Not</Text>
            </View>
            <TextInput
              style={styles.noteInput}
              value={newText}
              onChangeText={setNewText}
              placeholder="Bugün ne hissettirdi?"
              placeholderTextColor="rgba(255,255,255,0.25)"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              autoFocus
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddNote} activeOpacity={0.85}>
              <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.saveBtnGrad}>
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  backCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20, fontWeight: '800', color: '#fff',
    letterSpacing: 0.3,
  },

  // Filter tabs
  legend: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontSize: 11, color: 'rgba(255,255,255,0.40)', fontWeight: '600' },

  // Loading state
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: 'rgba(255,255,255,0.35)' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontSize: 14, color: 'rgba(255,255,255,0.35)',
    textAlign: 'center', lineHeight: 22,
  },

  // ── Alışkanlık notu ───────────────────────────────────────────────────────
  habitNoteCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(147,51,234,0.10)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  habitAccentBar: {
    width: 4,
    backgroundColor: '#a855f7',
    borderRadius: 2,
  },
  habitNoteInner: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  habitNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  habitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(168,85,247,0.20)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: '65%',
  },
  habitBadgeName: {
    fontSize: 11, fontWeight: '700',
    color: '#d8b4fe', flex: 1,
  },
  habitNoteDate: {
    fontSize: 10, fontWeight: '600', letterSpacing: 0.8,
    color: 'rgba(168,85,247,0.60)',
  },
  habitNoteText: {
    fontSize: 14, color: 'rgba(255,255,255,0.78)',
    lineHeight: 20,
  },

  // ── Kişisel not ───────────────────────────────────────────────────────────
  personalNoteCard: {
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.22)',
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  personalNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59,130,246,0.18)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  personalBadgeText: {
    fontSize: 10, fontWeight: '700', color: '#93c5fd',
  },
  personalNoteDate: {
    fontSize: 10, fontWeight: '600', letterSpacing: 0.8,
    color: 'rgba(96,165,250,0.60)',
  },
  personalNoteText: {
    fontSize: 14, color: 'rgba(255,255,255,0.78)',
    lineHeight: 20,
  },

  // FAB
  fab: {
    position: 'absolute', bottom: 28, right: 24,
    width: 56, height: 56, borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 16, elevation: 12,
  },
  fabGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    overflow: 'hidden', padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '800', color: '#fff',
  },
  noteInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.30)',
    padding: 14, fontSize: 15,
    color: '#fff', minHeight: 120, marginBottom: 16,
  },
  saveBtn: { borderRadius: 14, overflow: 'hidden' },
  saveBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
