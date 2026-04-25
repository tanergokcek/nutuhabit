import { HabitIcon } from '@/components/ui/HabitIcon';
import { FONTS } from '@/constants/fonts';
import { LAYOUT } from '@/constants/layout';
import { upsertLog } from '@/src/services/habits';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useHabitStore } from '@/src/store/useHabitStore';
import { HabitType, LogStatus } from '@/src/types/habit';
import { getTodayString } from '@/src/utils/date';
import { calculateStreak } from '@/src/utils/streak';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Haftalık şerit (interaktif) ─────────────────────────────────────────────
const DAY_SHORT = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];

function getWeekDays() {
  const today = new Date();
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return {
      dateStr: `${y}-${mo}-${da}`,
      label: DAY_SHORT[i],
      dayNum: d.getDate(),
      month: d.toLocaleString('en', { month: 'short' }).toUpperCase(),
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

interface WeekStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function WeekStrip({ selectedDate, onSelectDate }: WeekStripProps) {
  const days = getWeekDays();
  return (
    <View style={weekStyles.container}>
      {days.map((day, i) => {
        const isSelected = day.dateStr === selectedDate;
        return (
          <TouchableOpacity
            key={i}
            style={[weekStyles.pill, isSelected && weekStyles.pillActive]}
            onPress={() => onSelectDate(day.dateStr)}
            activeOpacity={0.75}
          >
            {isSelected ? (
              <LinearGradient colors={['#7c3aed', '#6d28d9']} style={weekStyles.pillGrad}>
                <Text style={[weekStyles.dayLabel, weekStyles.dayLabelActive]}>{day.label}</Text>
                <Text style={[weekStyles.dayNum, weekStyles.dayNumActive]}>{day.dayNum}</Text>
                <Text style={[weekStyles.dayMonth, weekStyles.dayMonthActive]}>{day.month}</Text>
              </LinearGradient>
            ) : (
              <>
                <Text style={weekStyles.dayLabel}>{day.label}</Text>
                <Text style={weekStyles.dayNum}>{day.dayNum}</Text>
                <Text style={weekStyles.dayMonth}>{day.month}</Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const weekStyles = StyleSheet.create({
  container: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.md, paddingVertical: 10,
    backgroundColor: 'rgba(18,12,48,0.85)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  pill: {
    flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    marginHorizontal: 2, gap: 2, overflow: 'hidden',
  },
  pillActive: { borderColor: 'rgba(192,132,252,0.55)' },
  pillGrad: { flex: 1, width: '100%', alignItems: 'center', paddingVertical: 7, gap: 2 },
  dayLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 },
  dayLabelActive: { color: 'rgba(255,255,255,0.9)' },
  dayNum: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.55)' },
  dayNumActive: { color: '#fff', fontSize: 17 },
  dayMonth: { fontSize: 8, color: 'rgba(255,255,255,0.28)', fontWeight: '600' },
  dayMonthActive: { color: 'rgba(255,255,255,0.75)' },
});

// ─── Yardımcı ─────────────────────────────────────────────────────────────────
function fmt(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}


// ─── Streak Kutlama Overlay ───────────────────────────────────────────────────
interface SavedResult {
  habitName: string;
  habitIcon: string;
  streak: number;
  type: HabitType;
}

const WEEK_DAY_NAMES_OV = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const WEEK_SHORT_OV = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

function StreakOverlay({ result, onDismiss }: { result: SavedResult; onDismiss: () => void }) {
  const todayName = WEEK_DAY_NAMES_OV[new Date().getDay()];
  const todayWeekIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const streakStartIdx = todayWeekIdx - (result.streak - 1);

  const slideY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pillScale = useRef(new Animated.Value(0.7)).current;
  const contentO = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideY.setValue(80);
    opacity.setValue(0);
    pillScale.setValue(0.7);
    contentO.setValue(0);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 55, friction: 9 }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(pillScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
        Animated.timing(contentO, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]).start();
    }, 160);
  }, []);

  const isFirstDay = result.streak === 1;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onDismiss}>
      {/* Backdrop */}
      <Animated.View style={[overlayStyles.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onDismiss} />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View style={[overlayStyles.sheet, { transform: [{ translateY: slideY }], opacity }]}>
        <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={['rgba(88,28,220,0.72)', 'rgba(40,10,120,0.60)', 'rgba(8,4,35,0.40)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        />
        <View style={overlayStyles.specular} />

        {/* Başlık satırı */}
        <View style={overlayStyles.headerRow}>
          <View style={overlayStyles.iconBox}>
            <HabitIcon icon={result.habitIcon} size={18} color="#fff" />
          </View>
          <Text style={overlayStyles.title}>{result.habitName}</Text>
          <TouchableOpacity onPress={onDismiss} style={overlayStyles.closeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={16} color="rgba(255,255,255,0.45)" />
          </TouchableOpacity>
        </View>

        {/* Büyük streak pill */}
        <Animated.View style={[overlayStyles.bigPill, { transform: [{ scale: pillScale }] }]}>
          <Text style={overlayStyles.bigPillFire}>🔥</Text>
          <Text style={overlayStyles.bigPillNum}>{result.streak}</Text>
          <Text style={overlayStyles.bigPillLabel}>. gün</Text>
        </Animated.View>

        {/* Günün adı */}
        <Animated.View style={{ opacity: contentO, alignItems: 'center', marginTop: -8 }}>
          <Text style={overlayStyles.dayName}>{todayName}</Text>
        </Animated.View>

        {/* Haftalık zincir */}
        <Animated.View style={[overlayStyles.chainRow, { opacity: contentO }]}>
          {WEEK_SHORT_OV.map((day, idx) => {
            const done = idx >= streakStartIdx && idx <= todayWeekIdx;
            const isToday = idx === todayWeekIdx;
            const isFuture = idx > todayWeekIdx;
            return (
              <React.Fragment key={day}>
                {idx > 0 && (
                  <View style={[overlayStyles.chainLink, done && overlayStyles.chainLinkDone]} />
                )}
                <View style={[
                  overlayStyles.chainNode,
                  done && overlayStyles.chainNodeDone,
                  isToday && overlayStyles.chainNodeToday,
                  isFuture && overlayStyles.chainNodeFuture,
                ]}>
                  <Text style={[
                    overlayStyles.chainNodeText,
                    done && overlayStyles.chainNodeTextDone,
                    isToday && overlayStyles.chainNodeTextToday,
                  ]}>{day}</Text>
                </View>
              </React.Fragment>
            );
          })}
        </Animated.View>

        {/* Alt mesaj */}
        <Animated.View style={[overlayStyles.msgWrap, { opacity: contentO }]}>
          <Text style={overlayStyles.msgTitle}>
            {isFirstDay ? 'İlk gün! 🎉' : 'Harika gidiyorsun!'}
          </Text>
          <Text style={overlayStyles.msgSub}>
            {isFirstDay ? 'Harika başlangıç, devam et!' : 'Serini kırmıyorsun, süper! 💪'}
          </Text>
        </Animated.View>

        {/* Buton */}
        <Animated.View style={{ opacity: contentO, width: '100%' }}>
          <TouchableOpacity
            style={overlayStyles.btn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDismiss(); }}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#9333ea', '#6d28d9']} style={StyleSheet.absoluteFillObject} />
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={overlayStyles.btnText}>Devam Et</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const overlayStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.25)',
    padding: 24, paddingBottom: 44,
    gap: 18, alignItems: 'center',
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.55, shadowRadius: 40, elevation: 24,
  },
  specular: {
    position: 'absolute', top: 0, left: 24, right: 24, height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // Başlık
  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%',
  },
  iconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(109,40,217,0.55)',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    flex: 1, fontSize: 16, fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    fontFamily: 'InriaSerif_700Bold', letterSpacing: 0.1,
  },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Büyük streak pill
  bigPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(109,40,217,0.45)',
    borderRadius: 99, paddingHorizontal: 28, paddingVertical: 14,
    borderWidth: 1.5, borderColor: 'rgba(192,132,252,0.55)',
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55, shadowRadius: 16, elevation: 8,
  },
  bigPillFire: { fontSize: 30 },
  bigPillNum: {
    fontSize: 52, fontWeight: '800', color: '#e9d5ff',
    fontFamily: 'InriaSerif_700Bold', letterSpacing: -1,
  },
  bigPillLabel: {
    fontSize: 18, fontWeight: '600',
    color: 'rgba(233,213,255,0.60)',
    alignSelf: 'flex-end', marginBottom: 8,
  },

  // Gün adı
  dayName: {
    fontSize: 11, fontWeight: '700',
    color: 'rgba(192,132,252,0.70)',
    letterSpacing: 2.5, textTransform: 'uppercase',
  },

  // Haftalık zincir
  chainRow: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
  },
  chainLink: {
    flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.10)',
  },
  chainLinkDone: { backgroundColor: 'rgba(168,85,247,0.70)' },
  chainNode: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  chainNodeDone: {
    backgroundColor: 'rgba(109,40,217,0.50)',
    borderColor: 'rgba(192,132,252,0.60)',
  },
  chainNodeToday: {
    backgroundColor: 'rgba(109,40,217,0.80)',
    borderColor: '#c084fc', borderWidth: 2,
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 8, elevation: 6,
  },
  chainNodeFuture: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.07)',
  },
  chainNodeText: {
    fontSize: 8, fontWeight: '700',
    color: 'rgba(255,255,255,0.28)', letterSpacing: 0.2,
  },
  chainNodeTextDone: { color: '#e9d5ff' },
  chainNodeTextToday: { color: '#fff', fontWeight: '800' },

  // Mesaj
  msgWrap: { alignItems: 'center', gap: 4 },
  msgTitle: {
    fontSize: 16, fontWeight: '700',
    color: 'rgba(255,255,255,0.90)',
    fontFamily: 'InriaSerif_700Bold',
  },
  msgSub: {
    fontSize: 13, color: 'rgba(196,163,255,0.65)',
    textAlign: 'center', lineHeight: 20,
  },

  // Buton
  btn: {
    width: '100%', paddingVertical: 16,
    borderRadius: 16, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  btnText: {
    color: '#fff', fontWeight: '700', fontSize: 15,
    fontFamily: 'InriaSerif_700Bold',
  },
});

// ─── Ana ekran ────────────────────────────────────────────────────────────────
const TYPE_BUTTONS: { key: HabitType; label: string }[] = [
  { key: 'done', label: 'YAPILDI' },
  { key: 'time', label: 'SÜRE' },
  { key: 'bad', label: 'KÖTÜ ALIŞKANLIK' },
];

const STATUS_OPTIONS: { key: LogStatus; label: string; style: 'dashed' | 'outline' | 'filled' }[] = [
  { key: 'failed', label: 'Yapmadım.', style: 'dashed' },
  { key: 'excused', label: 'Mazeretliyim.', style: 'outline' },
  { key: 'done', label: 'Yaptım.', style: 'filled' },
];


export default function LogHabitScreen() {
  const router = useRouter();
  const { habits, updateLog, lastUsedHabitId, setLastUsedHabitId } = useHabitStore();
  const { user, isGuest } = useAuthStore();

  const [selectedType, setSelectedType] = useState<HabitType>('done');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [habitPickerVisible, setHabitPickerVisible] = useState(false);
  const [status, setStatus] = useState<LogStatus | null>('done');
  const [notes, setNotes] = useState('');
  const [openPanel, setOpenPanel] = useState<'notes' | null>('notes');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);

  // TIME — mod ve saat state
  const [timeMode, setTimeMode] = useState<'range' | 'duration'>('range');

  // range mod — default to current time, 0 elapsed
  const [startH, setStartH] = useState(() => { const h = new Date().getHours(); return h % 12 || 12; });
  const [startM, setStartM] = useState(() => new Date().getMinutes());
  const [startPM, setStartPM] = useState(() => new Date().getHours() >= 12);
  const [endH, setEndH] = useState(() => { const h = new Date().getHours(); return h % 12 || 12; });
  const [endM, setEndM] = useState(() => new Date().getMinutes());
  const [endPM, setEndPM] = useState(() => new Date().getHours() >= 12);
  const [activeField, setActiveField] = useState<'start' | 'end'>('start');

  // duration mod
  const [durH, setDurH] = useState(0);
  const [durM, setDurM] = useState(0);

  const activeHabits = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);
  const filteredHabits = useMemo(() => activeHabits.filter((h) => h.type === selectedType), [activeHabits, selectedType]);

  // En son kullanılan veya en son eklenen alışkanlığı otomatik seç
  useEffect(() => {
    if (!activeHabits.length) return;

    // 1) En son seçilen hâlâ aktifse onu al
    if (lastUsedHabitId) {
      const last = activeHabits.find((h) => h.id === lastUsedHabitId);
      if (last) {
        setSelectedType(last.type);
        setSelectedHabitId(last.id);
        return;
      }
    }

    // 2) Fallback: en son eklenen alışkanlık (SLEEP hariç)
    const nonSleep = activeHabits.filter((h) => h.id !== 'habit-sleep');
    if (!nonSleep.length) return;
    const recent = [...nonSleep].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    setSelectedType(recent.type);
    setSelectedHabitId(recent.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Başlangıç/Bitiş modunda geçen süre
  const rangeMinutes = useMemo(() => {
    const startTotal = (startPM ? startH + 12 : startH) * 60 + startM;
    const endTotal = (endPM ? endH + 12 : endH) * 60 + endM;
    let diff = endTotal - startTotal;
    if (diff < 0) diff += 24 * 60;
    return diff;
  }, [startH, startM, startPM, endH, endM, endPM]);

  const elapsedMinutes = durH * 60 + durM;

  const togglePanel = (panel: 'notes') =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  const curH = activeField === 'start' ? startH : endH;
  const curM = activeField === 'start' ? startM : endM;
  const curPM = activeField === 'start' ? startPM : endPM;

  const handleSave = () => {
    if (!selectedHabitId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const habit = activeHabits.find((h) => h.id === selectedHabitId);
    if (!habit) return;

    const noteValue = notes.trim() || undefined;

    if (selectedType === 'time') {
      updateLog(habit.id, selectedDate, { status: 'done', elapsedMinutes, note: noteValue });
    } else if (selectedType === 'bad') {
      const badHabit = habit as import('@/src/types/habit').BadHabit;
      const didIt = status === 'failed';
      if (badHabit.limitType === 'count') {
        // Adet bazlı: usedCount üstüne 1 ekle, status limitCount'a göre hesapla
        const prevLog = useHabitStore.getState().getTodayLog(habit.id);
        const prevCount = prevLog?.usedCount ?? 0;
        const newCount = prevCount + (didIt ? 1 : 0);
        updateLog(habit.id, selectedDate, {
          usedCount: didIt ? 1 : 0,
          status: newCount >= badHabit.limitCount ? 'failed' : 'done',
          note: noteValue,
        });
      } else {
        updateLog(habit.id, selectedDate, { status: didIt ? 'failed' : 'done', note: noteValue });
      }
    } else {
      if (!status) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      updateLog(habit.id, selectedDate, { status, note: noteValue });
    }

    // Firestore senkronizasyonu
    if (!isGuest && user?.id) {
      const logData: any = {
        habitId: habit.id,
        date: selectedDate,
        note: noteValue,
      };

      if (selectedType === 'time') {
        logData.elapsedMinutes = elapsedMinutes;
        logData.status = 'done';
      } else if (selectedType === 'bad') {
        const badHabit = habit as import('@/src/types/habit').BadHabit;
        const didIt = status === 'failed';
        if (badHabit.limitType === 'count') {
          const prevLog = useHabitStore.getState().getTodayLog(habit.id);
          const prevCount = prevLog?.usedCount ?? 0;
          const newCount = prevCount + (didIt ? 1 : 0);
          logData.usedCount = didIt ? 1 : 0;
          logData.status = newCount >= badHabit.limitCount ? 'failed' : 'done';
        } else {
          logData.status = didIt ? 'failed' : 'done';
        }
      } else {
        logData.status = status;
      }

      upsertLog(user.id, logData, selectedType);
    }

    // Zustand güncellemesi senkron — log kaydedildikten hemen sonra streak hesapla
    const updatedLogs = useHabitStore.getState().getLogsForHabit(habit.id);
    const streakInfo = calculateStreak(updatedLogs, selectedType);

    if (streakInfo.currentStreak > 0) {
      setSavedResult({
        habitName: habit.name,
        habitIcon: habit.icon,
        streak: streakInfo.currentStreak,
        type: selectedType,
      });
    } else {
      // Streak yok (kötü alışkanlık başarısız vs.) — doğrudan geri git
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={['#1e0530', '#12043a', '#0c1535', '#050d20']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(139,92,246,0.70)', 'transparent']}
          style={[StyleSheet.absoluteFillObject, { top: -100, left: -60, width: '80%', height: '55%', borderRadius: 400 }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(217,70,239,0.42)', 'transparent']}
          style={[StyleSheet.absoluteFillObject, { top: -60, right: -40, width: '60%', height: '48%', borderRadius: 400 }]}
          start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
        />

        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Header ── */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.85}>
                <LinearGradient colors={['#7c3aed', '#6d28d9']} style={styles.backGrad}>
                  <Ionicons name="chevron-back" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>KAYIT</Text>
              <View style={{ width: 44 }} />
            </View>

            <View style={styles.divider} />

            {/* ── Choose Habit Type ── */}
            <Text style={styles.centerLabel}>Alışkanlık Türü Seç</Text>
            <View style={styles.typeRow}>
              {TYPE_BUTTONS.map((btn) => {
                const isActive = selectedType === btn.key;
                return (
                  <TouchableOpacity
                    key={btn.key}
                    onPress={() => {
                      const newType = btn.key;
                      setSelectedType(newType);
                      setStatus(newType === 'done' ? 'done' : newType === 'bad' ? 'failed' : null);
                      setOpenPanel(null);
                      // lastUsedHabitId bu tipe aitse koru, yoksa en son eklenenini seç
                      const typeHabits = activeHabits.filter((h) => h.type === newType);
                      const keepLast = lastUsedHabitId && typeHabits.find((h) => h.id === lastUsedHabitId);
                      if (keepLast) {
                        setSelectedHabitId(lastUsedHabitId);
                      } else {
                        const recent = [...typeHabits].sort(
                          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        )[0];
                        setSelectedHabitId(recent?.id ?? null);
                      }
                    }}
                    style={[
                      styles.typeBtn,
                      isActive && styles.typeBtnActive,
                      btn.key !== 'bad' && styles.typeBtnBorder,
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.typeBtnText, isActive && styles.typeBtnTextActive]}>
                      {btn.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Habit Seçimi ── */}
            {filteredHabits.length === 0 ? (
              <View style={styles.emptyHabits}>
                <Text style={styles.emptyHabitsText}>Bu tipte alışkanlık yok.</Text>
                <TouchableOpacity onPress={() => router.push('/habit/new')} activeOpacity={0.75}>
                  <Text style={styles.emptyHabitsLink}>+ Yeni alışkanlık ekle</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.habitPickerRow}
                  onPress={() => setHabitPickerVisible(true)}
                  activeOpacity={0.75}
                >
                  {(() => {
                    const sel = filteredHabits.find((h) => h.id === selectedHabitId);
                    return sel ? (
                      <View style={styles.habitPickerSelected}>
                        <HabitIcon icon={sel.icon} size={24} color="rgba(255,255,255,0.90)" />
                        <Text style={styles.habitPickerName} numberOfLines={1}>{sel.name}</Text>
                      </View>
                    ) : (
                      <Text style={styles.habitPickerPlaceholder}>Alışkanlık seç…</Text>
                    );
                  })()}
                  <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.38)" />
                </TouchableOpacity>

                <Modal
                  visible={habitPickerVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setHabitPickerVisible(false)}
                >
                  <Pressable style={styles.pickerBackdrop} onPress={() => setHabitPickerVisible(false)}>
                    <Pressable style={styles.pickerSheet} onPress={(e) => e.stopPropagation()}>
                      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
                      <LinearGradient
                        colors={['rgba(60,20,130,0.92)', 'rgba(20,8,60,0.96)']}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <Text style={styles.pickerTitle}>Alışkanlık Seç</Text>
                      <View style={styles.pickerDivider} />
                      {filteredHabits.map((h) => {
                        const isActive = selectedHabitId === h.id;
                        return (
                          <TouchableOpacity
                            key={h.id}
                            style={[styles.pickerItem, isActive && styles.pickerItemActive]}
                            onPress={() => { setSelectedHabitId(h.id); setLastUsedHabitId(h.id); setHabitPickerVisible(false); }}
                            activeOpacity={0.75}
                          >
                            <HabitIcon icon={h.icon} size={24} color="rgba(255,255,255,0.90)" />
                            <Text style={[styles.pickerItemName, isActive && styles.pickerItemNameActive]} numberOfLines={1}>
                              {h.name}
                            </Text>
                            {isActive && <Ionicons name="checkmark" size={15} color="#c084fc" />}
                          </TouchableOpacity>
                        );
                      })}
                    </Pressable>
                  </Pressable>
                </Modal>
              </>
            )}

            {/* ══ TIME layout ══ */}
            {selectedType === 'time' ? (
              <>
                {/* Notes expandable */}
                <TouchableOpacity style={styles.expandRow} onPress={() => togglePanel('notes')} activeOpacity={0.7}>
                  <Text style={styles.expandText}>Notlar</Text>
                  <Ionicons name={openPanel === 'notes' ? 'chevron-up' : 'chevron-down'} size={13} color="rgba(255,255,255,0.38)" />
                </TouchableOpacity>
                <View style={styles.expandDivider} />
                {openPanel === 'notes' && (
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Bugün nasıl geçti?..."
                    placeholderTextColor="rgba(255,255,255,0.22)"
                    multiline numberOfLines={3} textAlignVertical="top"
                  />
                )}

                {/* ── Duration card ── */}
                <View style={styles.durationCard}>
                  <LinearGradient
                    colors={['rgba(168,85,247,0.10)', 'rgba(109,40,217,0.05)']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  />

                  {/* Tarih göstergesi */}
                  <View style={styles.dateLabelRow}>
                    <Ionicons name="calendar-outline" size={13} color="rgba(192,132,252,0.70)" />
                    <Text style={styles.dateLabelText}>
                      {selectedDate === getTodayString() ? 'Bugün' : selectedDate}
                    </Text>
                  </View>

                  {/* Süre Spinner */}
                  <View style={styles.durationSpinner}>
                    {/* Saat */}
                    <View style={styles.spinCol}>
                      <TouchableOpacity style={styles.spinBtn} onPress={() => setDurH((h) => Math.min(23, h + 1))} activeOpacity={0.7}>
                        <Ionicons name="chevron-up" size={24} color="rgba(192,132,252,0.85)" />
                      </TouchableOpacity>
                      <View style={styles.spinValBox}>
                        <Text style={styles.spinVal}>{String(durH).padStart(2, '0')}</Text>
                        <Text style={styles.spinUnit}>saat</Text>
                      </View>
                      <TouchableOpacity style={styles.spinBtn} onPress={() => setDurH((h) => Math.max(0, h - 1))} activeOpacity={0.7}>
                        <Ionicons name="chevron-down" size={24} color="rgba(192,132,252,0.85)" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.spinColon}>:</Text>

                    {/* Dakika */}
                    <View style={styles.spinCol}>
                      <TouchableOpacity style={styles.spinBtn} onPress={() => setDurM((m) => (m + 5) % 60)} activeOpacity={0.7}>
                        <Ionicons name="chevron-up" size={24} color="rgba(192,132,252,0.85)" />
                      </TouchableOpacity>
                      <View style={styles.spinValBox}>
                        <Text style={styles.spinVal}>{String(durM).padStart(2, '0')}</Text>
                        <Text style={styles.spinUnit}>dakika</Text>
                      </View>
                      <TouchableOpacity style={styles.spinBtn} onPress={() => setDurM((m) => (m - 5 + 60) % 60)} activeOpacity={0.7}>
                        <Ionicons name="chevron-down" size={24} color="rgba(192,132,252,0.85)" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Hızlı seçim */}
                  <View style={styles.presetRow}>
                    {[
                      { label: '30 dk', h: 0, m: 30 },
                      { label: '1 saat', h: 1, m: 0 },
                      { label: '1.5 saat', h: 1, m: 30 },
                      { label: '2 saat', h: 2, m: 0 },
                    ].map((p) => {
                      const isActive = durH === p.h && durM === p.m;
                      return (
                        <TouchableOpacity
                          key={p.label}
                          style={[styles.presetChip, isActive && styles.presetChipActive]}
                          onPress={() => { setDurH(p.h); setDurM(p.m); Haptics.selectionAsync(); }}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.presetChipText, isActive && styles.presetChipTextActive]}>
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Süre özeti */}
                  <View style={styles.elapsedRow}>
                    <Text style={styles.elapsedLabel}>Geçen süre</Text>
                    <Text style={[styles.elapsedVal, elapsedMinutes === 0 && styles.elapsedValZero]}>
                      {elapsedMinutes === 0
                        ? '0 dakika'
                        : elapsedMinutes < 60
                          ? `${elapsedMinutes} dakika`
                          : `${Math.floor(elapsedMinutes / 60)} saat ${elapsedMinutes % 60 > 0 ? `${elapsedMinutes % 60} dakika` : ''}`}
                    </Text>
                  </View>

                </View>
              </>
            ) : (
              <>
                {/* ══ DONE / BAD layout ══ */}
                <TouchableOpacity style={styles.expandRow} onPress={() => togglePanel('notes')} activeOpacity={0.7}>
                  <Text style={styles.expandText}>Notlar</Text>
                  <Ionicons name={openPanel === 'notes' ? 'chevron-up' : 'chevron-down'} size={13} color="rgba(255,255,255,0.38)" />
                </TouchableOpacity>
                <View style={styles.expandDivider} />
                {openPanel === 'notes' && (
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Bugün nasıl geçti?..."
                    placeholderTextColor="rgba(255,255,255,0.22)"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                )}

                {selectedType === 'bad' ? (
                  <View style={styles.badStatusRow}>
                    <TouchableOpacity
                      style={styles.statusItem}
                      onPress={() => setStatus(status === 'failed' ? null : 'failed')}
                      activeOpacity={0.75}
                    >
                      <View style={[
                        styles.statusBox, styles.statusOutline,
                        status === 'failed' && styles.statusSelected,
                      ]}>
                        {status === 'failed' && <Ionicons name="checkmark" size={22} color="#fff" />}
                      </View>
                      <Text style={[styles.statusLabel, status === 'failed' && styles.statusLabelActive]}>
                        Yaptım.
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.statusRow}>
                    {STATUS_OPTIONS.map((opt) => {
                      const isSelected = status === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={styles.statusItem}
                          onPress={() => setStatus(opt.key)}
                          activeOpacity={0.75}
                        >
                          <View style={[
                            styles.statusBox,
                            opt.style === 'dashed' && styles.statusDashed,
                            opt.style === 'outline' && styles.statusOutline,
                            opt.style === 'filled' && styles.statusFilled,
                            isSelected && styles.statusSelected,
                          ]}>
                            {isSelected && <Ionicons name="checkmark" size={22} color="#fff" />}
                          </View>
                          <Text style={[styles.statusLabel, isSelected && styles.statusLabelActive]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            )}

            {/* ── Footer ── */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} activeOpacity={0.75}>
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#9333ea', '#7c3aed', '#6d28d9']}
                  style={styles.saveGrad}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.saveText}>Kaydet</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </SafeAreaView>
      </View>

      {/* Streak Kutlama */}
      {savedResult && (
        <StreakOverlay
          result={savedResult}
          onDismiss={() => {
            setSavedResult(null);
            setTimeout(() => router.back(), 50);
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: LAYOUT.spacing.md, paddingBottom: 24 },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: LAYOUT.spacing.md, marginBottom: 18,
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  backGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontSize: 22, fontWeight: FONTS.weight.bold,
    color: 'rgba(255,255,255,0.95)', letterSpacing: 3,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 22 },

  centerLabel: {
    fontSize: 12, color: 'rgba(255,255,255,0.42)',
    textAlign: 'center', marginBottom: 10, fontStyle: 'italic', letterSpacing: 0.3,
  },

  typeRow: {
    flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(168,85,247,0.45)',
    borderRadius: 12, overflow: 'hidden', marginBottom: 22,
  },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: 'transparent' },
  typeBtnBorder: { borderRightWidth: 1, borderRightColor: 'rgba(168,85,247,0.30)' },
  typeBtnActive: { backgroundColor: 'rgba(168,85,247,0.22)' },
  typeBtnText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.38)', letterSpacing: 0.6 },
  typeBtnTextActive: { color: 'rgba(255,255,255,0.95)' },

  // Habit picker dropdown row
  habitPickerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.35)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 22,
  },
  habitPickerSelected: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1 },
  habitPickerEmoji: { fontSize: 20 },
  habitPickerName: { fontSize: 15, fontWeight: '600', color: '#fff', textAlign: 'center' },
  habitPickerPlaceholder: { fontSize: 14, color: 'rgba(255,255,255,0.35)', flex: 1, textAlign: 'center' },

  // Habit picker modal
  pickerBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center',
  },
  pickerSheet: {
    width: '78%', borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.35)',
  },
  pickerTitle: {
    fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.6, textTransform: 'uppercase',
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10,
  },
  pickerDivider: { height: 1, backgroundColor: 'rgba(168,85,247,0.20)', marginHorizontal: 12 },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 18, paddingVertical: 14,
  },
  pickerItemActive: { backgroundColor: 'rgba(168,85,247,0.15)' },
  pickerItemEmoji: { fontSize: 20 },
  pickerItemName: { flex: 1, fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.75)' },
  pickerItemNameActive: { color: '#c084fc', fontWeight: '700' },
  emptyHabits: {
    alignItems: 'center', gap: 8, marginBottom: 22,
    paddingVertical: 18, borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.20)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  emptyHabitsText: { fontSize: 13, color: 'rgba(255,255,255,0.40)', fontStyle: 'italic' },
  emptyHabitsLink: { fontSize: 13, color: '#a78bfa', fontWeight: '700' },

  expandRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 7,
  },
  expandDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.09)', marginBottom: 4 },
  expandText: { fontSize: 13, color: 'rgba(255,255,255,0.50)', fontStyle: 'italic' },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: 'rgba(255,255,255,0.75)',
    marginTop: 8, marginBottom: 4, minHeight: 80,
  },

  // Mod toggle
  modeToggleRow: {
    flexDirection: 'row', borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.35)',
    marginBottom: 4,
  },
  modeBtn: {
    flex: 1, paddingVertical: 11, alignItems: 'center',
    overflow: 'hidden',
  },
  modeBtnActive: {},
  modeBtnText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.38)', letterSpacing: 0.3 },
  modeBtnTextActive: { color: '#fff' },

  // Tarih göstergesi
  dateLabelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.25)',
  },
  dateLabelText: { fontSize: 12, fontWeight: '600', color: 'rgba(192,132,252,0.90)' },

  // Süre spinner
  durationSpinner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12,
  },
  spinCol: { alignItems: 'center', gap: 6 },
  spinBtn: { padding: 8 },
  spinValBox: {
    width: 90, height: 90, borderRadius: 18,
    backgroundColor: 'rgba(109,40,217,0.25)',
    borderWidth: 1.5, borderColor: 'rgba(168,85,247,0.45)',
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  spinVal: { fontSize: 38, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  spinUnit: { fontSize: 10, fontWeight: '600', color: 'rgba(192,132,252,0.70)', letterSpacing: 0.5 },
  spinColon: { fontSize: 36, fontWeight: '300', color: 'rgba(255,255,255,0.30)', marginBottom: 20 },

  // Preset chips
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.35)',
    backgroundColor: 'rgba(168,85,247,0.10)',
  },
  presetChipActive: {
    borderColor: '#a855f7',
    backgroundColor: 'rgba(168,85,247,0.30)',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(192,132,252,0.70)',
    letterSpacing: 0.3,
  },
  presetChipTextActive: {
    color: '#e9d5ff',
  },

  // Duration card
  durationCard: {
    borderRadius: 24, borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.30)',
    overflow: 'hidden', marginTop: 16,
    paddingVertical: 20, paddingHorizontal: 16,
    alignItems: 'center', gap: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#14003C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28, shadowRadius: 40, elevation: 14,
  },

  // Time boxes
  timeRangeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 16, width: '100%',
  },
  timeBox: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.28)',
    gap: 2,
  },
  timeBoxActive: {
    borderColor: '#c084fc',
    backgroundColor: 'rgba(168,85,247,0.18)',
    shadowColor: '#a855f7', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.50, shadowRadius: 10, elevation: 6,
  },
  timeBoxSub: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1,
    color: 'rgba(192,132,252,0.60)',
  },
  timeBoxVal: {
    fontSize: 22, fontWeight: '800', letterSpacing: 2,
    color: 'rgba(255,255,255,0.65)',
  },
  timeBoxValActive: { color: 'rgba(255,255,255,0.96)' },
  timeBoxAmPm: {
    fontSize: 9, fontWeight: '700', color: 'rgba(192,132,252,0.50)', letterSpacing: 0.5,
  },
  arrowWrap: { alignItems: 'center', gap: 2 },
  arrowLine: { width: 1, height: 22, backgroundColor: 'rgba(168,85,247,0.30)' },

  // AM/PM toggle
  ampmToggleRow: {
    flexDirection: 'row', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10, padding: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  ampmBtn: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 8,
  },
  ampmBtnActive: {
    backgroundColor: 'rgba(168,85,247,0.40)',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.50)',
  },
  ampmBtnText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.38)' },
  ampmBtnTextActive: { color: '#fff' },

  // Elapsed summary
  elapsedRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', paddingHorizontal: 4,
    paddingVertical: 10, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  elapsedLabel: { fontSize: 11, color: 'rgba(255,255,255,0.40)', fontStyle: 'italic' },
  elapsedVal: {
    fontSize: 15, fontWeight: '700', color: '#c084fc', letterSpacing: 0.5,
  },
  elapsedValZero: { color: 'rgba(255,255,255,0.28)' },

  // Editable time inputs
  timeInputRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  timeNumInput: {
    fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1, textAlign: 'center', minWidth: 34,
    paddingVertical: 2, paddingHorizontal: 2,
  },
  timeNumInputActive: { color: 'rgba(255,255,255,0.96)' },
  timeColonText: { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.40)' },
  ampmMiniRow: { flexDirection: 'row', gap: 4, marginTop: 2 },
  ampmMiniBtn: {
    paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.20)',
  },
  ampmMiniBtnActive: {
    backgroundColor: 'rgba(168,85,247,0.38)',
    borderColor: 'rgba(192,132,252,0.55)',
  },
  ampmMiniTxt: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.30)', letterSpacing: 0.5 },
  ampmMiniTxtActive: { color: 'rgba(255,255,255,0.90)' },

  // Status
  statusRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 28, marginBottom: 30,
  },
  badStatusRow: { alignItems: 'center', marginTop: 28, marginBottom: 30 },
  statusItem: { alignItems: 'center', gap: 8 },
  statusBox: { width: 58, height: 58, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusDashed: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.30)',
    borderStyle: 'dashed', backgroundColor: 'transparent',
  },
  statusOutline: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)', backgroundColor: 'transparent' },
  statusFilled: {
    backgroundColor: 'rgba(109,40,217,0.55)',
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.55)',
  },
  statusSelected: {
    borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.40)',
    shadowColor: '#a855f7', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.60, shadowRadius: 10, elevation: 6,
  },
  statusLabel: {
    fontSize: 10, color: 'rgba(255,255,255,0.42)',
    fontStyle: 'italic', textAlign: 'center', maxWidth: 72,
  },
  statusLabelActive: { color: 'rgba(255,255,255,0.80)' },

  footer: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.60)' },
  saveBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  saveGrad: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
