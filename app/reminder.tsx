import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Switch, Alert, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '@/src/store/useHabitStore';
import { HabitIcon } from '@/components/ui/HabitIcon';

import { updateHabitService } from '@/src/services/habits';
import { scheduleHabitReminder, cancelHabitReminder } from '@/src/services/notifications';

function TimePickerModal({ visible, title, time, onConfirm, onClose }: { 
  visible: boolean; title: string; time: string; onConfirm: (t: string) => void; onClose: () => void 
}) {
  const [h, setH] = useState(parseInt(time.split(':')[0], 10));
  const [m, setM] = useState(parseInt(time.split(':')[1], 10));

  useEffect(() => {
    setH(parseInt(time.split(':')[0], 10));
    setM(parseInt(time.split(':')[1], 10));
  }, [time]);

  const changeH = (delta: number) => setH((prev) => (prev + delta + 24) % 24);
  const changeM = (delta: number) => setM((prev) => (prev + delta + 60) % 60);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={tpStyles.backdrop}>
        <View style={tpStyles.sheet}>
          <Text style={tpStyles.title}>{title}</Text>
          <View style={tpStyles.row}>
            <View style={tpStyles.col}>
              <TouchableOpacity onPress={() => changeH(1)}><Ionicons name="chevron-up" size={24} color="#c084fc" /></TouchableOpacity>
              <Text style={tpStyles.val}>{String(h).padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => changeH(-1)}><Ionicons name="chevron-down" size={24} color="#c084fc" /></TouchableOpacity>
            </View>
            <Text style={tpStyles.colon}>:</Text>
            <View style={tpStyles.col}>
              <TouchableOpacity onPress={() => changeM(5)}><Ionicons name="chevron-up" size={24} color="#c084fc" /></TouchableOpacity>
              <Text style={tpStyles.val}>{String(m).padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => changeM(-5)}><Ionicons name="chevron-down" size={24} color="#c084fc" /></TouchableOpacity>
            </View>
          </View>
          <View style={tpStyles.btnRow}>
            <TouchableOpacity onPress={onClose} style={tpStyles.btn}><Text style={tpStyles.btnText}>İptal</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)} style={[tpStyles.btn, tpStyles.confirmBtn]}>
              <Text style={tpStyles.confirmBtnText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const tpStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  sheet: { width: 280, backgroundColor: '#1a103d', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(192,132,252,0.3)' },
  title: { fontSize: 18, fontFamily: 'InriaSerif_700Bold', color: '#fff', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  col: { alignItems: 'center', gap: 5 },
  val: { fontSize: 44, fontFamily: 'InriaSerif_700Bold', color: '#fff', minWidth: 60, textAlign: 'center' },
  colon: { fontSize: 40, fontFamily: 'InriaSerif_700Bold', color: 'rgba(255,255,255,0.4)', marginBottom: 5 },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  btn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  btnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  confirmBtn: { backgroundColor: '#7c3aed' },
  confirmBtnText: { color: '#fff', fontWeight: '700' },
});

export default function ReminderScreen() {
  const router = useRouter();
  const { habits, updateHabit } = useHabitStore();
  const activeHabits = habits.filter(h => !h.isArchived);

  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggle = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const habit = activeHabits.find(h => h.id === id);
    if (!habit) return;

    // Local update
    updateHabit(id, { reminderEnabled: newStatus });
    // Firebase update
    await updateHabitService(id, { reminderEnabled: newStatus });
    
    // Device notification update
    if (newStatus) {
      await scheduleHabitReminder(id, habit.name, habit.reminderTime || '08:00');
    } else {
      await cancelHabitReminder(id);
    }
  };

  const handleTimeConfirm = async (time: string) => {
    if (selectedHabitId) {
      const habit = activeHabits.find(h => h.id === selectedHabitId);
      if (!habit) return;

      // Local update
      updateHabit(selectedHabitId, { reminderTime: time });
      // Firebase update
      await updateHabitService(selectedHabitId, { reminderTime: time });
      
      // Device notification update if enabled
      if (habit.reminderEnabled) {
        await scheduleHabitReminder(selectedHabitId, habit.name, time);
      }

      setShowTimePicker(false);
      setSelectedHabitId(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0e0428', '#180840', '#0d1448', '#050d20']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Purple gradient top header bar */}
      <LinearGradient
        colors={['#7c3aed', '#6d28d9', 'transparent']}
        style={styles.headerGrad}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <View style={styles.backCircle}>
              <Ionicons name="chevron-back" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hatırlatıcı</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionLabel}>ALIŞKANLIK HATIRLATICILARI</Text>

          {activeHabits.map(habit => (
            <View key={habit.id} style={styles.reminderCard}>
              {/* Icon */}
              <View style={styles.iconBox}>
                <HabitIcon icon={habit.icon} size={22} color="rgba(255,255,255,0.90)" />
              </View>

              {/* Info */}
              <View style={styles.infoCol}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.habitTime}>🔔 {habit.reminderTime || '08:00'}</Text>
              </View>

              {/* Düzenle */}
              <TouchableOpacity
                style={styles.editBtn}
                activeOpacity={0.75}
                onPress={() => {
                  setSelectedHabitId(habit.id);
                  setShowTimePicker(true);
                }}
              >
                <Text style={styles.editBtnText}>Düzenle</Text>
              </TouchableOpacity>

              {/* Toggle */}
              <Switch
                value={habit.reminderEnabled ?? false}
                onValueChange={() => toggle(habit.id, habit.reminderEnabled ?? false)}
                trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#7c3aed' }}
                thumbColor={habit.reminderEnabled ? '#fff' : 'rgba(255,255,255,0.70)' }
                ios_backgroundColor="rgba(255,255,255,0.15)"
              />
            </View>
          ))}

          <TimePickerModal
            visible={showTimePicker}
            title="Hatırlatıcı Saati"
            time={activeHabits.find(h => h.id === selectedHabitId)?.reminderTime || '08:00'}
            onConfirm={handleTimeConfirm}
            onClose={() => {
              setShowTimePicker(false);
              setSelectedHabitId(null);
            }}
          />

          {activeHabits.length === 0 && (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Henüz alışkanlık yok.</Text>
              <Text style={styles.emptySubText}>Ana sayfadan alışkanlık ekleyin.</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  headerGrad: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 140,
  },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  backCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20, color: '#fff',
    fontFamily: 'InriaSerif_700Bold', letterSpacing: 0.3,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 11, fontFamily: 'InriaSerif_700Bold', letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.42)', marginBottom: 14, marginTop: 4,
  },

  reminderCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 14, marginBottom: 10,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.20)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  infoCol: { flex: 1, gap: 3 },
  habitName: { fontSize: 15, fontFamily: 'InriaSerif_700Bold', color: '#fff' },
  habitTime: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },

  editBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 99, borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.55)',
    backgroundColor: 'rgba(168,85,247,0.10)',
  },
  editBtnText: {
    fontSize: 12, fontFamily: 'InriaSerif_700Bold',
    color: 'rgba(192,132,252,0.90)',
  },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontFamily: 'InriaSerif_700Bold', color: 'rgba(255,255,255,0.55)' },
  emptySubText: { fontSize: 13, color: 'rgba(255,255,255,0.30)' },
});
