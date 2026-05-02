import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '@/src/store/useHabitStore';
import { HabitIcon } from '@/components/ui/HabitIcon';

// Default reminder times per habit (mock)
const DEFAULT_TIMES: Record<string, string> = {
  Meditation: '07:30',
  Reading: '21:00',
  Water: '09:00',
  Exercise: '06:00',
  Sleep: '22:30',
};

function getDefaultTime(name: string): string {
  return DEFAULT_TIMES[name] ?? '08:00';
}

export default function ReminderScreen() {
  const router = useRouter();
  const { habits } = useHabitStore();
  const activeHabits = habits.filter(h => !h.isArchived);

  // Toggle state per habit id
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    activeHabits.forEach(h => { init[h.id] = true; });
    return init;
  });
  // Times per habit
  const [times] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    activeHabits.forEach(h => { init[h.id] = getDefaultTime(h.name); });
    return init;
  });

  const toggle = (id: string) => setEnabled(prev => ({ ...prev, [id]: !prev[id] }));

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
          <Text style={styles.headerTitle}>Reminder</Text>
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
                <Text style={styles.habitTime}>🔔 {times[habit.id] ?? '08:00'}</Text>
              </View>

              {/* Düzenle */}
              <TouchableOpacity
                style={styles.editBtn}
                activeOpacity={0.75}
                onPress={() => Alert.alert('Düzenle', `${habit.name} hatırlatıcısını düzenle`)}
              >
                <Text style={styles.editBtnText}>Düzenle</Text>
              </TouchableOpacity>

              {/* Toggle */}
              <Switch
                value={enabled[habit.id] ?? true}
                onValueChange={() => toggle(habit.id)}
                trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#7c3aed' }}
                thumbColor={enabled[habit.id] ? '#fff' : 'rgba(255,255,255,0.70)' }
                ios_backgroundColor="rgba(255,255,255,0.15)"
              />
            </View>
          ))}

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
    fontSize: 20, fontWeight: '800', color: '#fff',
    fontFamily: 'InriaSerif_700Bold', letterSpacing: 0.3,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
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
  habitName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  habitTime: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },

  editBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 99, borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.55)',
    backgroundColor: 'rgba(168,85,247,0.10)',
  },
  editBtnText: {
    fontSize: 12, fontWeight: '700',
    color: 'rgba(192,132,252,0.90)',
  },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.55)' },
  emptySubText: { fontSize: 13, color: 'rgba(255,255,255,0.30)' },
});
