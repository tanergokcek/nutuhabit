import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore, SLEEP_HABIT_ID, SLEEP_HABIT } from '@/src/store/useHabitStore';
import { useTranslation } from '@/src/hooks/useTranslation';
import { HabitIcon } from '@/components/ui/HabitIcon';
import { formatMinutes } from '@/src/utils/formatTime';
import { useAuthStore } from '@/src/store/useAuthStore';
import { upsertLog } from '@/src/services/habits';
import { HabitLog, LogEntry, BadHabit, TimeHabit } from '@/src/types/habit';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

export default function DailyRecordsScreen() {
  const router = useRouter();
  const i18n = useTranslation();
  const { logs, habits, updateLog } = useHabitStore();
  const { user, isGuest } = useAuthStore();

  const [editingEntry, setEditingEntry] = useState<{ entry: LogEntry; log: HabitLog; habitType: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const allEntries = useMemo(() => {
    const entries: { entry: LogEntry; log: HabitLog; habitName: string; habitIcon: string; habitColor: string; type: string }[] = [];
    logs.forEach(log => {
      const habit = habits.find(h => h.id === log.habitId) || (log.habitId === SLEEP_HABIT_ID ? SLEEP_HABIT : undefined);
      if (!habit) return;
      const type = habit.type;
      
      if (log.entries && Array.isArray(log.entries) && log.entries.length > 0) {
        log.entries.forEach(entry => {
          entries.push({
            entry,
            log,
            habitName: habit.name || 'Habit',
            habitIcon: habit.icon || 'star',
            habitColor: (habit as any).color || '#a855f7',
            type
          });
        });
      } else {
        if (log.status && log.status !== 'skipped') {
           entries.push({
             entry: { id: log.id, minutes: 0, createdAt: log.updatedAt || log.createdAt || new Date().toISOString(), note: log.note },
             log,
             habitName: habit.name || 'Habit',
             habitIcon: habit.icon || 'star',
             habitColor: (habit as any).color || '#a855f7',
             type
           });
        }
      }
    });
    return entries.sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());
  }, [logs, habits]);

  const handleDelete = (entryId: string, log: HabitLog, habitType: string) => {
    Alert.alert(
      i18n.deleteEntryTitle,
      i18n.deleteHabitConfirm(''),
      [
        { text: i18n.cancel, style: 'cancel' },
        {
          text: i18n.deleteLabel,
          style: 'destructive',
          onPress: async () => {
            let updates: Partial<HabitLog> = {};
            const habit = habits.find(h => h.id === log.habitId);
            
            if (log.entries && log.entries.find(e => e.id === entryId)) {
              const newEntries = log.entries.filter(e => e.id !== entryId);
              updates.entries = newEntries;
              if (habitType === 'time') {
                updates.elapsedMinutes = newEntries.reduce((sum, e) => sum + e.minutes, 0);
                updates.status = (updates.elapsedMinutes || 0) >= (habit as TimeHabit).goalMinutes ? 'done' : 'failed';
              } else if (habitType === 'bad') {
                const badH = habit as BadHabit;
                if (badH.limitType === 'time') {
                  const total = newEntries.reduce((sum, e) => sum + e.minutes, 0);
                  updates.usedMinutes = total;
                  updates.status = total <= (badH.limitMinutes || 60) ? 'done' : 'failed';
                } else {
                  updates.usedCount = newEntries.length;
                  updates.status = newEntries.length > (badH.limitCount || 1) ? 'failed' : 'done';
                }
              }
            } else {
              updates.status = 'skipped';
              updates.note = '';
            }

            updateLog(log.habitId, log.date, updates);
            if (!isGuest && user?.id) {
              await upsertLog(user.id, { ...log, ...updates } as HabitLog, habitType as any);
            }
          }
        }
      ]
    );
  };

  const handleEdit = (entry: LogEntry, log: HabitLog, habitType: string) => {
    setEditingEntry({ entry, log, habitType });
    if (habitType === 'time' || (habitType === 'bad' && entry.minutes > 0)) {
      setEditValue(String(entry.minutes));
    } else {
      setEditValue(log.status);
    }
  };

  const saveEdit = async () => {
    if (!editingEntry) return;
    const { entry, log, habitType } = editingEntry;
    
    let updates: Partial<HabitLog> = {};
    const habit = habits.find(h => h.id === log.habitId);

    if (habitType === 'time' || (habitType === 'bad' && entry.minutes > 0)) {
      const newMins = parseInt(editValue, 10);
      if (isNaN(newMins)) return;

      const newEntries = (log.entries || []).map(e => e.id === entry.id ? { ...e, minutes: newMins } : e);
      updates.entries = newEntries;
      
      if (habitType === 'time') {
        updates.elapsedMinutes = newEntries.reduce((sum, e) => sum + e.minutes, 0);
        updates.status = (updates.elapsedMinutes || 0) >= (habit as TimeHabit).goalMinutes ? 'done' : 'failed';
      } else if (habitType === 'bad') {
        const badH = habit as BadHabit;
        if (badH.limitType === 'time') {
          const total = newEntries.reduce((sum, e) => sum + e.minutes, 0);
          updates.usedMinutes = total;
          updates.status = total <= (badH.limitMinutes || 60) ? 'done' : 'failed';
        }
      }
    } else {
      updates.status = editValue as any;
    }

    updateLog(log.habitId, log.date, updates);
    if (!isGuest && user?.id) {
      await upsertLog(user.id, { ...log, ...updates } as HabitLog, habitType as any);
    }
    setEditingEntry(null);
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1e0530', '#15032a', '#060412']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{i18n.menuDailyRecords}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {allEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{i18n.noDataToday}</Text>
            </View>
          ) : (
            allEntries.map(({ entry, log, habitName, habitIcon, habitColor, type }) => (
              <BlurView key={entry.id} intensity={20} tint="dark" style={styles.card}>
                <View style={[styles.accent, { backgroundColor: habitColor }]} />
                <View style={styles.cardInner}>
                  <View style={styles.row}>
                    <View style={styles.habitInfo}>
                      <View style={[styles.iconBox, { backgroundColor: `${habitColor}33` }]}>
                        <HabitIcon icon={habitIcon} size={18} color={habitColor} />
                      </View>
                      <View>
                        <Text style={styles.habitName}>{habitName}</Text>
                        <Text style={styles.dateText}>{formatDate(log.date)} • {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                    </View>
                    <View style={styles.actions}>
                      <TouchableOpacity onPress={() => handleEdit(entry, log, type)} style={styles.actionBtn}>
                        <Ionicons name="create-outline" size={18} color="rgba(255,255,255,0.4)" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(entry.id, log, type)} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={18} color="#f87171" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.entryBody}>
                    <Text style={styles.valueText}>
                      {type === 'time' || (type === 'bad' && entry.minutes > 0)
                        ? formatMinutes(entry.minutes)
                        : (log.status === 'done' ? i18n.completed : (log.status === 'failed' ? i18n.notCompleted : (log.status === 'excused' ? i18n.excused : log.status)))
                      }
                    </Text>
                    {entry.note && (type === 'time' || type === 'bad') && !entry.note.startsWith('{"bedH"') && (
                      <Text style={styles.noteText}>{entry.note}</Text>
                    )}
                  </View>
                </View>
              </BlurView>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Edit Modal */}
      <Modal visible={!!editingEntry} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.edit}</Text>
            
            {editingEntry?.habitType === 'time' || (editingEntry?.habitType === 'bad' && editingEntry?.entry.minutes > 0) ? (
              <TextInput
                style={styles.modalInput}
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="number-pad"
                autoFocus
              />
            ) : (
              <View style={{ gap: 10 }}>
                {editingEntry?.habitType === 'bad' ? (
                  <TouchableOpacity onPress={() => setEditValue('failed')} style={[styles.modalBtnRow, editValue === 'failed' && styles.modalBtnRowActive]}>
                    <Text style={styles.modalBtnRowText}>{i18n.completed}</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity onPress={() => setEditValue('done')} style={[styles.modalBtnRow, editValue === 'done' && styles.modalBtnRowActive]}>
                      <Text style={styles.modalBtnRowText}>{i18n.completed}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditValue('failed')} style={[styles.modalBtnRow, editValue === 'failed' && styles.modalBtnRowActive]}>
                      <Text style={styles.modalBtnRowText}>{i18n.notCompleted}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditValue('excused')} style={[styles.modalBtnRow, editValue === 'excused' && styles.modalBtnRowActive]}>
                      <Text style={styles.modalBtnRowText}>{i18n.excused}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setEditingEntry(null)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>{i18n.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} style={styles.modalSave}>
                <Text style={styles.modalSaveText}>{i18n.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.5,
  },
  scrollContent: { padding: 16, gap: 12 },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
  },
  accent: { width: 4 },
  cardInner: { flex: 1, padding: 14, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  habitInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  habitName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  dateText: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 8 },
  entryBody: {
    paddingLeft: 48,
  },
  valueText: {
    fontSize: 16, fontWeight: '600', color: '#c084fc',
  },
  noteText: {
    fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4,
  },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 16 },
  
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modalContent: {
    width: '100%', maxWidth: 300,
    backgroundColor: '#1a1a2e', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center' },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16,
    fontSize: 18, color: '#fff', textAlign: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  modalCancelText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600' },
  modalSave: { flex: 1, backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalSaveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalBtnRow: { padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  modalBtnRowActive: { backgroundColor: 'rgba(168,85,247,0.3)', borderColor: 'rgba(168,85,247,0.8)', borderWidth: 1 },
  modalBtnRowText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
