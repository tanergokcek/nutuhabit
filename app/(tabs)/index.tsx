import { MenuDropdown } from '@/components/MenuDropdown';
import { HabitIcon } from '@/components/ui/HabitIcon';
import { LAYOUT } from '@/constants/layout';
import { textStyles } from '@/constants/typography';
import { ThemeTokens, useAppTheme } from '@/src/hooks/useAppTheme';
import { useStreak } from '@/src/hooks/useStreak';
import { useTranslation } from '@/src/hooks/useTranslation';
import { fetchHabits, fetchLogs, upsertLog, createHabitWithId } from '@/src/services/habits';
import { useAuthStore } from '@/src/store/useAuthStore';
import { SLEEP_HABIT, SLEEP_HABIT_ID, useHabitStore } from '@/src/store/useHabitStore';
import { useLanguageStore } from '@/src/store/useLanguageStore';
import { useThemeStore } from '@/src/store/useThemeStore';
import { BadHabit, DoneHabit, TimeHabit, Habit, HabitLog, HabitType, StreakInfo, LogEntry } from '@/src/types/habit';
import { getTodayString } from '@/src/utils/date';
import { formatMinutes } from '@/src/utils/formatTime';
import { calculateStreak } from '@/src/utils/streak';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
function getWeekDays(labels: string[], offsetWeeks: number = 0) {
  const today = new Date();
  today.setDate(today.getDate() + offsetWeeks * 7);
  // Haftanın başı: Pazartesi
  const dayOfWeek = today.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const realToday = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      dateStr: `${y}-${m}-${day}`,
      label: labels[i],
      dayNum: d.getDate(),
      isToday: d.toDateString() === realToday.toDateString(),
    };
  });
}

function getWeekDaysForDate(labels: string[], dateStr: string) {
  const targetDate = new Date(dateStr);
  const dayOfWeek = targetDate.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const realToday = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(targetDate);
    d.setDate(targetDate.getDate() + mondayOffset + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      dateStr: `${y}-${m}-${day}`,
      label: labels[i],
      dayNum: d.getDate(),
      isToday: d.toDateString() === realToday.toDateString(),
    };
  });
}

function timeDiff(fromH: number, fromM: number, toH: number, toM: number) {
  let mins = (toH * 60 + toM) - (fromH * 60 + fromM);
  if (mins < 0) mins += 24 * 60;
  return mins;
}

function fmtTime(h: number, m: number) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── Uyku Saati Picker Modal ───────────────────────────────────────────────────
interface TimePickerModalProps {
  visible: boolean;
  title: string;
  hour: number;
  minute: number;
  onConfirm: (h: number, m: number) => void;
  onClose: () => void;
}

function TimePickerModal({ visible, title, hour, minute, onConfirm, onClose }: TimePickerModalProps) {
  const i18n = useTranslation();
  const [h, setH] = useState(hour);
  const [m, setM] = useState(minute);

  React.useEffect(() => { setH(hour); setM(minute); }, [hour, minute, visible]);

  const changeH = (delta: number) => setH((prev) => (prev + delta + 24) % 24);
  const changeM = (delta: number) => setM((prev) => (prev + delta + 60) % 60);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pickerStyles.backdrop} onPress={onClose}>
        <Pressable style={pickerStyles.sheet} onPress={(e) => e.stopPropagation()}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFillObject} />
          <LinearGradient
            colors={['rgba(88,28,220,0.55)', 'rgba(15,10,50,0.85)']}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={pickerStyles.title}>{title}</Text>
          <View style={pickerStyles.row}>
            {/* Hour */}
            <View style={pickerStyles.spinnerCol}>
              <TouchableOpacity onPress={() => changeH(1)} style={pickerStyles.arrowBtn}>
                <Ionicons name="chevron-up" size={22} color="rgba(192,132,252,0.9)" />
              </TouchableOpacity>
              <Text style={pickerStyles.timeVal}>{String(h).padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => changeH(-1)} style={pickerStyles.arrowBtn}>
                <Ionicons name="chevron-down" size={22} color="rgba(192,132,252,0.9)" />
              </TouchableOpacity>
            </View>
            <Text style={pickerStyles.colon}>:</Text>
            {/* Minute */}
            <View style={pickerStyles.spinnerCol}>
              <TouchableOpacity onPress={() => changeM(5)} style={pickerStyles.arrowBtn}>
                <Ionicons name="chevron-up" size={22} color="rgba(192,132,252,0.9)" />
              </TouchableOpacity>
              <Text style={pickerStyles.timeVal}>{String(m).padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => changeM(-5)} style={pickerStyles.arrowBtn}>
                <Ionicons name="chevron-down" size={22} color="rgba(192,132,252,0.9)" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={pickerStyles.btnRow}>
            <TouchableOpacity style={pickerStyles.cancelBtn} onPress={onClose}>
              <Text style={pickerStyles.cancelText}>{i18n.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={pickerStyles.confirmBtn} onPress={() => { onConfirm(h, m); onClose(); }}>
              <LinearGradient colors={['#9333ea', '#6d28d9']} style={StyleSheet.absoluteFillObject} />
              <Text style={pickerStyles.confirmText}>{i18n.save}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center' },
  sheet: {
    width: 280, borderRadius: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.28)',
    padding: 28, alignItems: 'center',
    shadowColor: '#6d28d9', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5, shadowRadius: 40, elevation: 20,
  },
  title: { ...textStyles.calloutSemibold, color: 'rgba(255,255,255,0.90)', marginBottom: 24, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28 },
  spinnerCol: { alignItems: 'center', gap: 8 },
  arrowBtn: { padding: 6 },
  timeVal: { ...textStyles.largeTitleBold, fontSize: 52, color: '#fff', width: 74, textAlign: 'center', letterSpacing: -1 },
  colon: { ...textStyles.title1Bold, fontSize: 40, color: 'rgba(255,255,255,0.55)', marginBottom: 4 },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  cancelText: { ...textStyles.callout, color: 'rgba(255,255,255,0.55)' },
  confirmBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 14, overflow: 'hidden',
    alignItems: 'center',
  },
  confirmText: { ...textStyles.calloutSemibold, color: '#fff' },
});

// ─── Uyku Onay Modal'ı ────────────────────────────────────────────────────────
interface SleepConfirmModalProps {
  visible: boolean;
  bedH: number; bedM: number;
  wakeH: number; wakeM: number;
  onConfirm: () => void;
  onClose: () => void;
}

function SleepConfirmModal({ visible, bedH, bedM, wakeH, wakeM, onConfirm, onClose }: SleepConfirmModalProps) {
  const i18n = useTranslation();
  const { language } = useLanguageStore();
  const totalMins = timeDiff(bedH, bedM, wakeH, wakeM);
  const totalHours = totalMins / 60;
  const dH = Math.floor(totalMins / 60);
  const dM = totalMins % 60;
  const durationStr = i18n.language === 'en'
    ? (dM > 0 ? `${dH}h ${dM}m` : `${dH}h`)
    : (dM > 0 ? `${dH} saat ${dM} dakika` : `${dH} saat`);
  const quality = totalHours >= 7.5
    ? { label: i18n.sleepGood, color: '#34d399', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.45)' }
    : totalHours >= 6
      ? { label: i18n.sleepOkay, color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.45)' }
      : { label: i18n.sleepPoor, color: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.45)' };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={scStyles.backdrop} onPress={onClose}>
        <Pressable style={scStyles.sheet} onPress={(e) => e.stopPropagation()}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFillObject} />
          <LinearGradient
            colors={['rgba(88,28,220,0.60)', 'rgba(15,10,50,0.92)']}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Başlık */}
          <View style={scStyles.header}>
            <Text style={scStyles.emoji}>🌙</Text>
            <Text style={scStyles.title}>{i18n.confirmSleep}</Text>
          </View>

          {/* Saat özeti */}
          <View style={scStyles.timesRow}>
            <View style={scStyles.timeBlock}>
              <Text style={scStyles.timeVal}>{fmtTime(bedH, bedM)}</Text>
              <Text style={scStyles.timeLabel}>{i18n.bedtimeModal}</Text>
            </View>
            <Text style={scStyles.arrow}>→</Text>
            <View style={scStyles.timeBlock}>
              <Text style={scStyles.timeVal}>{fmtTime(wakeH, wakeM)}</Text>
              <Text style={scStyles.timeLabel}>{i18n.wakeUpModal}</Text>
            </View>
          </View>

          {/* Süre + kalite */}
          <View style={scStyles.summaryRow}>
            <View style={scStyles.durationBox}>
              <Text style={scStyles.durationVal}>{durationStr}</Text>
              <Text style={scStyles.durationLabel}>{i18n.totalSleep}</Text>
            </View>
            <View style={[scStyles.qualityBadge, { backgroundColor: quality.bg, borderColor: quality.border }]}>
              <Text style={[scStyles.qualityText, { color: quality.color }]}>{quality.label}</Text>
            </View>
          </View>

          {/* Butonlar */}
          <View style={scStyles.btnRow}>
            <TouchableOpacity style={scStyles.cancelBtn} onPress={onClose}>
              <Text style={scStyles.cancelText}>{i18n.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={scStyles.okBtn} onPress={() => { onConfirm(); onClose(); }} activeOpacity={0.85}>
              <LinearGradient colors={['#9333ea', '#6d28d9']} style={StyleSheet.absoluteFillObject} />
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={scStyles.okText}>{i18n.confirm}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const scStyles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.70)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.25)',
    padding: 28, paddingBottom: 40,
    shadowColor: '#6d28d9', shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.55, shadowRadius: 40, elevation: 24,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  emoji: { fontSize: 26 },
  title: { ...textStyles.title3Semibold, color: '#fff', letterSpacing: 0.2 },          // 20pt

  timesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 },
  timeBlock: { alignItems: 'center', gap: 6 },
  timeVal: { ...textStyles.largeTitleBold, fontSize: 38, color: '#7dd3fc', letterSpacing: -1 }, // display num
  timeLabel: { ...textStyles.caption2, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2, textTransform: 'uppercase' },
  arrow: { ...textStyles.title2, color: 'rgba(255,255,255,0.35)', fontWeight: '300', marginBottom: 16 },

  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  durationBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  durationVal: { ...textStyles.title3Semibold, color: '#fff', marginBottom: 2 },      // 20pt
  durationLabel: { ...textStyles.caption2, color: 'rgba(255,255,255,0.40)' },           // 11pt
  qualityBadge: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, alignItems: 'center',
  },
  qualityText: { ...textStyles.calloutSemibold, letterSpacing: 0.5 },                  // 16pt

  btnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  cancelText: { ...textStyles.subhead, color: 'rgba(255,255,255,0.55)' },              // 15pt
  okBtn: {
    flex: 2, paddingVertical: 16, borderRadius: 16, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  okText: { ...textStyles.subheadSemibold, color: '#fff' },                            // 15pt
});

interface StreakCelebrationProps {
  visible: boolean;
  streakCount: number;
  onClose: () => void;
}

// ─── Streak Kutlama Modal'ı ────────────────────────────────────────────────────
function StreakCelebrationModal({ visible, streakCount, onClose }: StreakCelebrationProps) {
  const i18n = useTranslation();
  const WEEK_DAY_NAMES = i18n.weekDaysFull;
  const WEEK_SHORT = i18n.weekDays;

  const todayName = WEEK_DAY_NAMES[new Date().getDay()];
  const todayWeekIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const streakStartIdx = todayWeekIdx - (streakCount - 1);

  const slideY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pillScale = useRef(new Animated.Value(0.7)).current;
  const contentO = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideY.setValue(60);
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
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[celebStyles.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View style={[celebStyles.sheet, { transform: [{ translateY: slideY }], opacity }]}>
        <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={['rgba(88,28,220,0.72)', 'rgba(40,10,120,0.60)', 'rgba(8,4,35,0.40)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        />
        {/* Üst specular */}
        <View style={celebStyles.specular} />

        {/* Başlık satırı */}
        <View style={celebStyles.headerRow}>
          <View style={celebStyles.iconBox}>
            <Text style={{ fontSize: 16 }}>🌙</Text>
          </View>
          <Text style={celebStyles.title}>{i18n.sleepStreakTitle}</Text>
          <TouchableOpacity onPress={onClose} style={celebStyles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={16} color="rgba(255,255,255,0.45)" />
          </TouchableOpacity>
        </View>

        {/* Büyük streak pill */}
        <Animated.View style={[celebStyles.bigPill, { transform: [{ scale: pillScale }] }]}>
          <Text style={celebStyles.bigPillFire}>🔥</Text>
          <Text style={celebStyles.bigPillNum}>{streakCount}</Text>
          <Text style={celebStyles.bigPillLabel}>{i18n.streakDayLabel}</Text>
        </Animated.View>

        {/* Günün adı */}
        <Animated.View style={[celebStyles.dayRow, { opacity: contentO }]}>
          <Text style={celebStyles.dayName}>{todayName}</Text>
        </Animated.View>

        {/* Haftalık zincir */}
        <Animated.View style={[celebStyles.chainRow, { opacity: contentO }]}>
          {WEEK_SHORT.map((day, idx) => {
            const done = idx >= streakStartIdx && idx <= todayWeekIdx;
            const isToday = idx === todayWeekIdx;
            const isFuture = idx > todayWeekIdx;
            return (
              <React.Fragment key={day}>
                {idx > 0 && (
                  <View style={[celebStyles.chainLink, done && celebStyles.chainLinkDone]} />
                )}
                <View style={[
                  celebStyles.chainNode,
                  done && celebStyles.chainNodeDone,
                  isToday && celebStyles.chainNodeToday,
                  isFuture && celebStyles.chainNodeFuture,
                ]}>
                  <Text style={[
                    celebStyles.chainNodeText,
                    done && celebStyles.chainNodeTextDone,
                    isToday && celebStyles.chainNodeTextToday,
                  ]}>{day}</Text>
                </View>
              </React.Fragment>
            );
          })}
        </Animated.View>

        {/* Alt mesaj */}
        <Animated.View style={[celebStyles.msgWrap, { opacity: contentO }]}>
          <Text style={celebStyles.msgTitle}>{i18n.greatJobTitle}</Text>
          <Text style={celebStyles.msgSub}>{i18n.sleepStreakSub}</Text>
        </Animated.View>

        {/* Kapat butonu */}
        <Animated.View style={{ opacity: contentO, width: '100%' }}>
          <TouchableOpacity
            style={celebStyles.btn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose(); }}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#9333ea', '#6d28d9']} style={StyleSheet.absoluteFillObject} />
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={celebStyles.btnText}>{i18n.continueBtn}</Text>
          </TouchableOpacity>
        </Animated.View>

      </Animated.View>
    </Modal>
  );
}

const celebStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.25)',
    padding: 24, paddingBottom: 44,
    gap: 18,
    alignItems: 'center',
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
    flexDirection: 'row', alignItems: 'center', gap: 10,
    width: '100%',
  },
  iconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(109,40,217,0.55)',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    ...textStyles.calloutSemibold,                  // 16pt semibold
    flex: 1,
    color: 'rgba(255,255,255,0.92)',
    fontFamily: 'InriaSerif_700Bold',
    letterSpacing: 0.1,
  },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Büyük streak pill — sleep card streakPill'in büyütülmüş hali
  bigPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(109,40,217,0.45)',
    borderRadius: 99,
    paddingHorizontal: 28, paddingVertical: 14,
    borderWidth: 1.5, borderColor: 'rgba(192,132,252,0.55)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55, shadowRadius: 16, elevation: 8,
  },
  bigPillFire: { fontSize: 30 },
  bigPillNum: {
    ...textStyles.largeTitleBold, fontSize: 52,     // hero number — intentionally oversized
    color: '#e9d5ff',
    fontFamily: 'InriaSerif_700Bold',
    letterSpacing: -1,
  },
  bigPillLabel: {
    ...textStyles.title3,                           // 20pt
    color: 'rgba(233,213,255,0.60)',
    alignSelf: 'flex-end',
    marginBottom: 8,
  },

  // Günün adı
  dayRow: { alignItems: 'center' },
  dayName: {
    ...textStyles.caption2Medium,                   // 11pt
    color: 'rgba(192,132,252,0.70)',
    letterSpacing: 2.5, textTransform: 'uppercase',
    marginTop: -8,
  },

  // Haftalık zincir
  chainRow: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%',
  },
  chainLink: {
    flex: 1, height: 2,
    backgroundColor: 'rgba(255,255,255,0.10)',
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
    borderColor: '#c084fc',
    borderWidth: 2,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 8, elevation: 6,
  },
  chainNodeFuture: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.07)',
  },
  chainNodeText: {
    fontSize: 8, fontWeight: '700',                 // below HIG min — decorative only
    color: 'rgba(255,255,255,0.28)', letterSpacing: 0.2,
  },
  chainNodeTextDone: { color: '#e9d5ff' },
  chainNodeTextToday: { color: '#fff', fontWeight: '800' },

  // Alt mesaj
  msgWrap: { alignItems: 'center', gap: 4 },
  msgTitle: {
    ...textStyles.calloutSemibold,                  // 16pt semibold
    color: 'rgba(255,255,255,0.90)',
    fontFamily: 'InriaSerif_700Bold',
  },
  msgSub: {
    ...textStyles.footnote,                         // 13pt
    color: 'rgba(196,163,255,0.65)',
    textAlign: 'center',
  },

  // Buton
  btn: {
    width: '100%', paddingVertical: 16,
    borderRadius: 16, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  btnText: {
    ...textStyles.subheadSemibold,                  // 15pt semibold
    color: '#fff',
    fontFamily: 'InriaSerif_700Bold',
  },
});

// ─── Uyku Kartı ───────────────────────────────────────────────────────────────
interface SleepCardProps {
  bedH: number; bedM: number;
  wakeH: number; wakeM: number;
  streak: number;
  hasData: boolean;
  onSave: (bedH: number, bedM: number, wakeH: number, wakeM: number) => void;
  t: ThemeTokens;
}

function SleepCard({ bedH, bedM, wakeH, wakeM, streak, hasData, onSave, t }: SleepCardProps) {
  const i18n = useTranslation();
  const { language } = useLanguageStore();
  const totalMins = hasData ? timeDiff(bedH, bedM, wakeH, wakeM) : 0;
  const totalHours = totalMins / 60;
  const durationH = Math.floor(totalMins / 60);
  const durationM = totalMins % 60;
  const durationStr = (durationM > 0)
    ? `${durationH}${i18n.hourUnitShort} ${durationM}${i18n.minUnitShort}`
    : `${durationH} ${i18n.hourUnit}`;

  const quality = totalHours >= 7.5
    ? { label: i18n.sleepGood, color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.40)' }
    : totalHours >= 6
      ? { label: i18n.sleepOkay, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.40)' }
      : { label: i18n.sleepPoor, color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.40)' };

  // Kart küçültme durumu
  const [cardCollapsed, setCardCollapsed] = useState(false);
  const cardCollapseAnim = useRef(new Animated.Value(1)).current;
  const toggleCardCollapse = () => {
    const next = !cardCollapsed;
    setCardCollapsed(next);
    if (next && expanded) {
      setExpanded(false);
      Animated.spring(expandAnim, { toValue: 0, useNativeDriver: false, friction: 9 }).start();
    }
    Animated.spring(cardCollapseAnim, { toValue: next ? 0 : 1, useNativeDriver: false, friction: 9, tension: 70 }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const cardBodyMaxH = cardCollapseAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 400] });
  const cardBodyOpacity = cardCollapseAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0, 1] });

  // Dropdown genişleme durumu
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  // Dropdown içindeki düzenleme saatleri
  const [editBedH, setEditBedH] = useState(bedH);
  const [editBedM, setEditBedM] = useState(bedM);
  const [editWakeH, setEditWakeH] = useState(wakeH);
  const [editWakeM, setEditWakeM] = useState(wakeM);

  useEffect(() => {
    setEditBedH(bedH); setEditBedM(bedM);
    setEditWakeH(wakeH); setEditWakeM(wakeM);
  }, [bedH, bedM, wakeH, wakeM]);

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      // Dropdown açılırken mevcut değerleri sıfırla
      setEditBedH(bedH); setEditBedM(bedM);
      setEditWakeH(wakeH); setEditWakeM(wakeM);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.spring(expandAnim, {
      toValue: next ? 1 : 0,
      useNativeDriver: false,
      friction: 9, tension: 70,
    }).start();
  };

  const handleSave = () => {
    onSave(editBedH, editBedM, editWakeH, editWakeM);
    setExpanded(false);
    Animated.spring(expandAnim, { toValue: 0, useNativeDriver: false, friction: 9 }).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const changeH = (setter: React.Dispatch<React.SetStateAction<number>>, delta: number) =>
    setter(prev => (prev + delta + 24) % 24);
  const changeM = (setter: React.Dispatch<React.SetStateAction<number>>, delta: number) =>
    setter(prev => (prev + delta + 60) % 60);

  const dropdownH = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 196] });
  const dropdownOpacity = expandAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] });

  // Bounce animation for the "no data" prompt arrow
  const bounceAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!hasData && !expanded) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -5, duration: 520, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [hasData, expanded]);

  return (
    <View style={[sleepStyles.card, { borderColor: t.cardBorder, shadowColor: t.cardShadow }, cardCollapsed && sleepStyles.cardCollapsed]}>
      <BlurView intensity={25} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(88,30,200,0.70)', 'rgba(40,10,120,0.55)', 'rgba(8,4,35,0.35)']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <View style={[sleepStyles.specular, { backgroundColor: t.specular }]} />

      {/* Başlık — kart küçültme */}
      <TouchableOpacity onPress={toggleCardCollapse} activeOpacity={0.80} style={sleepStyles.headerRow}>
        <View style={[sleepStyles.iconBox, cardCollapsed && sleepStyles.iconBoxSm]}>
          <Text style={{ fontSize: cardCollapsed ? 13 : 16 }}>🌙</Text>
        </View>
        <Text style={[sleepStyles.cardTitle, { color: t.t1 }, cardCollapsed && sleepStyles.cardTitleSm]}>{i18n.sleepSchedule}</Text>
        <View style={sleepStyles.streakPill}>
          <Text style={sleepStyles.streakFire}>🔥</Text>
          <Text style={sleepStyles.streakPillText}>{streak}</Text>
        </View>
        {hasData && !expanded && (
          <View style={[sleepStyles.badge, { backgroundColor: quality.bg, borderColor: quality.border }]}>
            <Text style={[sleepStyles.badgeText, { color: quality.color }]}>{quality.label}</Text>
          </View>
        )}
        <Ionicons
          name={cardCollapsed ? 'chevron-down' : 'chevron-up'}
          size={14}
          color="rgba(167,139,250,0.65)"
          style={{ marginLeft: 2 }}
        />
      </TouchableOpacity>

      {/* Kart içeriği — açılıp kapanabilir */}
      <Animated.View style={{ maxHeight: cardBodyMaxH, opacity: cardBodyOpacity, overflow: 'hidden' }}>

        {/* Saatler özet — tıklanarak düzenleme açılır */}
        {!expanded && (
          <TouchableOpacity onPress={toggleExpand} activeOpacity={0.75} style={sleepStyles.timesRow}>
            <View style={sleepStyles.timeBlock}>
              <Text style={[sleepStyles.timeValue, !hasData && sleepStyles.timeValueEmpty]}>
                {hasData ? fmtTime(bedH, bedM) : '--:--'}
              </Text>
              <Text style={[sleepStyles.timeLabel, { color: t.t3 }]}>{i18n.bedtimeLabel}</Text>
            </View>
            <View style={sleepStyles.arrowWrap}>
              <Text style={[sleepStyles.arrowText, { color: t.t3 }]}>→</Text>
            </View>
            <View style={sleepStyles.timeBlock}>
              <Text style={[sleepStyles.timeValue, !hasData && sleepStyles.timeValueEmpty]}>
                {hasData ? fmtTime(wakeH, wakeM) : '--:--'}
              </Text>
              <Text style={[sleepStyles.timeLabel, { color: t.t3 }]}>{i18n.wakeUpLabel}</Text>
            </View>
            <View style={[sleepStyles.timeBlock, { alignItems: 'flex-end' }]}>
              <Text style={[sleepStyles.durationValue, { color: hasData ? t.t1 : t.t3 }]}>
                {hasData ? durationStr : `0 ${i18n.hourUnit}`}
              </Text>
              <Text style={[sleepStyles.timeLabel, { color: t.t3 }]}>{i18n.durationLabel}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Dropdown saat seçici */}
        <Animated.View style={[sleepStyles.dropdown, { height: dropdownH, opacity: dropdownOpacity }]}>
          <View style={sleepStyles.dropRow}>
            {/* Yatış saati */}
            <View style={sleepStyles.dropCol}>
              <Text style={sleepStyles.dropLabel}>🌙 {i18n.bedtimeLabel}</Text>
              <View style={sleepStyles.dropSpinner}>
                {/* Saat */}
                <View style={sleepStyles.spinCol}>
                  <TouchableOpacity onPress={() => changeH(setEditBedH, 1)} style={sleepStyles.spinArrow}>
                    <Ionicons name="chevron-up" size={18} color="rgba(192,132,252,0.85)" />
                  </TouchableOpacity>
                  <Text style={sleepStyles.spinNum}>{String(editBedH).padStart(2, '0')}</Text>
                  <TouchableOpacity onPress={() => changeH(setEditBedH, -1)} style={sleepStyles.spinArrow}>
                    <Ionicons name="chevron-down" size={18} color="rgba(192,132,252,0.85)" />
                  </TouchableOpacity>
                </View>
                <Text style={sleepStyles.spinColon}>:</Text>
                {/* Dakika */}
                <View style={sleepStyles.spinCol}>
                  <TouchableOpacity onPress={() => changeM(setEditBedM, 5)} style={sleepStyles.spinArrow}>
                    <Ionicons name="chevron-up" size={18} color="rgba(192,132,252,0.85)" />
                  </TouchableOpacity>
                  <Text style={sleepStyles.spinNum}>{String(editBedM).padStart(2, '0')}</Text>
                  <TouchableOpacity onPress={() => changeM(setEditBedM, -5)} style={sleepStyles.spinArrow}>
                    <Ionicons name="chevron-down" size={18} color="rgba(192,132,252,0.85)" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={sleepStyles.dropDivider} />

            {/* Uyanış saati */}
            <View style={sleepStyles.dropCol}>
              <Text style={sleepStyles.dropLabel}>☀️ {i18n.wakeUpLabel}</Text>
              <View style={sleepStyles.dropSpinner}>
                {/* Saat */}
                <View style={sleepStyles.spinCol}>
                  <TouchableOpacity onPress={() => changeH(setEditWakeH, 1)} style={sleepStyles.spinArrow}>
                    <Ionicons name="chevron-up" size={18} color="rgba(192,132,252,0.85)" />
                  </TouchableOpacity>
                  <Text style={sleepStyles.spinNum}>{String(editWakeH).padStart(2, '0')}</Text>
                  <TouchableOpacity onPress={() => changeH(setEditWakeH, -1)} style={sleepStyles.spinArrow}>
                    <Ionicons name="chevron-down" size={18} color="rgba(192,132,252,0.85)" />
                  </TouchableOpacity>
                </View>
                <Text style={sleepStyles.spinColon}>:</Text>
                {/* Dakika */}
                <View style={sleepStyles.spinCol}>
                  <TouchableOpacity onPress={() => changeM(setEditWakeM, 5)} style={sleepStyles.spinArrow}>
                    <Ionicons name="chevron-up" size={18} color="rgba(192,132,252,0.85)" />
                  </TouchableOpacity>
                  <Text style={sleepStyles.spinNum}>{String(editWakeM).padStart(2, '0')}</Text>
                  <TouchableOpacity onPress={() => changeM(setEditWakeM, -5)} style={sleepStyles.spinArrow}>
                    <Ionicons name="chevron-down" size={18} color="rgba(192,132,252,0.85)" />
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </View>

          {/* Kaydet butonu */}
          <TouchableOpacity onPress={handleSave} activeOpacity={0.82} style={sleepStyles.saveBtn}>
            <LinearGradient
              colors={['#7c3aed', '#9333ea', '#a855f7']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />
            <Ionicons name="checkmark" size={15} color="#fff" />
            <Text style={sleepStyles.saveBtnText}>{i18n.save}</Text>
          </TouchableOpacity>
        </Animated.View>
        {/* İlk uyku vakti yönlendirme — veri yokken ve dropdown kapalıyken */}
        {!hasData && !expanded && (
          <TouchableOpacity onPress={toggleExpand} activeOpacity={0.7} style={sleepStyles.promptRow}>
            <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
              <Ionicons name="arrow-up" size={13} color="#A78BFA" />
            </Animated.View>
            <Text style={sleepStyles.promptText}>{i18n.sleepHint}</Text>
            <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
              <Ionicons name="arrow-up" size={13} color="#A78BFA" />
            </Animated.View>
          </TouchableOpacity>
        )}

      </Animated.View>
    </View>
  );
}

const sleepStyles = StyleSheet.create({
  card: {
    borderRadius: 22, overflow: 'hidden',
    borderWidth: 1,
    padding: 16, gap: 10, marginBottom: 20,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55, shadowRadius: 36, elevation: 18,
  },
  // Collapsed halde DailyTimeBarCard ile aynı görünüm
  cardCollapsed: {
    borderRadius: 18,
    padding: 13,
    gap: 9,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 8,
  },
  specular: {
    position: 'absolute', top: 0, left: 18, right: 18, height: 1,
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: 'rgba(109,40,217,0.55)',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  // Collapsed halde dBarStyles.iconBox ile eşdeğer
  iconBoxSm: { width: 26, height: 26, borderRadius: 7 },
  cardTitle: {
    ...textStyles.subheadSemibold,                  // 15pt semibold
    flex: 1,
    letterSpacing: 0.1,
    fontFamily: 'InriaSerif_700Bold',
  },
  // Collapsed halde dBarStyles.title ile eşdeğer (13pt)
  cardTitleSm: { ...textStyles.footnoteSemibold, fontFamily: 'InriaSerif_700Bold' },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(109,40,217,0.40)',
    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.50)',
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.40, shadowRadius: 6, elevation: 4,
  },
  streakFire: { fontSize: 10 },
  streakPillText: { ...textStyles.caption1Medium, color: '#e9d5ff', letterSpacing: 0.2 }, // 12pt
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1.5 },
  badgeText: { ...textStyles.caption2Medium, letterSpacing: 1.1 },                       // 11pt

  timesRow: { flexDirection: 'row', alignItems: 'flex-end' },
  timeBlock: { flex: 1, gap: 3 },
  arrowWrap: { paddingBottom: 16, paddingHorizontal: 5 },
  arrowText: { ...textStyles.title3, fontWeight: '300' },                               // 20pt
  timeValue: {
    ...textStyles.title1Bold,                       // 28pt bold
    fontSize: 30,                                   // slight upsizing for sleep card hero
    color: '#7dd3fc',
    letterSpacing: -1, fontFamily: 'InriaSerif_700Bold',
  },
  timeValueEmpty: {
    color: 'rgba(167,139,250,0.35)',
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(139,92,246,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.20)',
    marginTop: 2,
  },
  promptText: {
    fontSize: 11,
    color: 'rgba(196,163,255,0.70)',
    fontFamily: 'InriaSerif_400Regular_Italic',
    letterSpacing: 0.2,
    flexShrink: 1,
    textAlign: 'center',
  },
  durationValue: {
    ...textStyles.title2Bold,                       // 22pt bold
    letterSpacing: -0.5,
    fontFamily: 'InriaSerif_700Bold',
  },
  timeLabel: {
    ...textStyles.caption2,                         // 11pt (9 HIG min'in altı — caps olduğu için tolere)
    fontSize: 9,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },

  progressTrack: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -2 },
  pctText: { ...textStyles.caption2Medium },      // 11pt medium
  sleptText: { ...textStyles.caption2 },            // 11pt

  // Dropdown
  dropdown: {
    overflow: 'hidden',
  },
  dropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  dropCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  dropLabel: {
    ...textStyles.caption2Medium,                   // 11pt (11 = HIG min)
    color: 'rgba(196,163,255,0.75)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dropSpinner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dropDivider: {
    width: 1,
    height: 80,
    backgroundColor: 'rgba(167,139,250,0.18)',
    marginHorizontal: 4,
  },
  spinCol: {
    alignItems: 'center',
    gap: 2,
  },
  spinArrow: {
    padding: 4,
  },
  spinNum: {
    ...textStyles.title1Bold,                       // 28pt bold — spinner digit
    fontSize: 26,
    color: '#e9d5ff',
    fontFamily: 'InriaSerif_700Bold',
    letterSpacing: -0.5,
    minWidth: 34,
    textAlign: 'center',
  },
  spinColon: {
    ...textStyles.title2Bold,                       // 22pt bold — colon separator
    color: 'rgba(167,139,250,0.6)',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  saveBtnText: {
    ...textStyles.footnoteSemibold,                 // 13pt semibold
    color: '#fff',
    letterSpacing: 0.3,
  },
});

// ─── Günlük 24 Saatlik Zaman Barı ────────────────────────────────────────────
const TOTAL_DAY_MINUTES = 24 * 60; // 1440

function DailyTimeBarCard({ habits, selectedDate, t }: { habits: Habit[]; selectedDate: string; t: ThemeTokens }) {
  const i18n = useTranslation();
  const logs = useHabitStore((state) => state.logs);
  const { language } = useLanguageStore();

  const bounceAnim = useRef(new Animated.Value(0)).current;

  const [collapsed, setCollapsed] = useState(false);
  const collapseAnim = useRef(new Animated.Value(1)).current;
  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    Animated.spring(collapseAnim, { toValue: next ? 0 : 1, useNativeDriver: false, friction: 9, tension: 70 }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const bodyMaxH = collapseAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });
  const bodyOpacity = collapseAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -5, duration: 520, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const segments = useMemo(() => {
    const timeHabits = habits.filter((h) => !h.isArchived && (h.type === 'time' || (h.type === 'bad' && (h as BadHabit).limitType === 'time')));
    // Add sleep habit if not present
    const list = [...timeHabits];
    if (!list.some(h => h.id === SLEEP_HABIT_ID)) {
      list.unshift(SLEEP_HABIT);
    }

    return list.map((h) => {
      const log = logs.find((l) => l.habitId === h.id && l.date === selectedDate);
      const isBad = h.type === 'bad';
      return {
        id: h.id,
        name: h.name,
        icon: h.icon,
        color: isBad ? '#ef4444' : (h.color ?? '#8B5CF6'),
        minutes: isBad ? (log?.usedMinutes ?? 0) : (log?.elapsedMinutes ?? 0),
        isBad
      };
    }).filter((s) => s.minutes > 0);
  }, [habits, logs, selectedDate]);

  const totalMinutes = useMemo(() => segments.reduce((sum, s) => sum + s.minutes, 0), [segments]);
  const cappedTotal = Math.min(TOTAL_DAY_MINUTES, totalMinutes);
  const remaining = TOTAL_DAY_MINUTES - cappedTotal;
  const totalPct = Math.round((cappedTotal / TOTAL_DAY_MINUTES) * 100);

  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? (m > 0 ? `${h}${i18n.hourUnitShort} ${m}${i18n.minUnitShort}` : `${h}${i18n.hourUnitShort}`) : `${m}${i18n.minUnitShort}`;
  };

  return (
    <View style={[dBarStyles.card, { borderColor: t.cardBorder, shadowColor: t.cardShadow }]}>
      <BlurView intensity={18} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(60,20,130,0.38)', 'rgba(18,6,55,0.32)']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <View style={dBarStyles.specular} />

      {/* Header — kart küçültme */}
      <TouchableOpacity onPress={toggleCollapse} activeOpacity={0.75} style={dBarStyles.header}>
        <View style={dBarStyles.iconBox}>
          <Text style={{ fontSize: 13 }}>⏰</Text>
        </View>
        <Text style={[dBarStyles.title, { color: t.t1 }]}>{i18n.dailyTime}</Text>
        <View style={dBarStyles.pctBadge}>
          <Text style={dBarStyles.pctBadgeText}>{totalPct}%</Text>
        </View>
        <Text style={[dBarStyles.subtitleText, { color: t.t3 }]}>{fmt(cappedTotal)} / 24{i18n.hourUnitShort}</Text>
        <Ionicons
          name={collapsed ? 'chevron-down' : 'chevron-up'}
          size={14}
          color="rgba(167,139,250,0.65)"
        />
      </TouchableOpacity>

      {/* İçerik — açılıp kapanabilir */}
      <Animated.View style={{ maxHeight: bodyMaxH, opacity: bodyOpacity, overflow: 'hidden' }}>
        {/* 24 saatlik bar */}
        <View style={dBarStyles.track}>
          {segments.map((seg, idx) => {
            const width = (seg.minutes / TOTAL_DAY_MINUTES) * 100;
            return (
              <View
                key={seg.id}
                style={[
                  dBarStyles.segmentFill,
                  { width: `${width}%` as `${number}%`, backgroundColor: seg.color }
                ]}
              />
            );
          })}
        </View>
        {/* infoRow kaldırıldı (başlıkta zaten özet var) */}

        {/* Legend */}
        {segments.length > 0 ? (
          <View style={dBarStyles.legendRow}>
            {segments.map((seg) => (
              <View key={seg.id} style={dBarStyles.legendItem}>
                <View style={[dBarStyles.legendDot, { backgroundColor: seg.color }]} />
                <HabitIcon icon={seg.icon} size={11} color={t.t3} />
                <Text style={[dBarStyles.legendText, { color: t.t3 }]} numberOfLines={1}>
                  {fmt(seg.minutes)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={dBarStyles.emptyPromptRow}>
            <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
              <Ionicons name="arrow-up" size={13} color="#A78BFA" />
            </Animated.View>
            <Text style={dBarStyles.emptyPromptText}>
              {i18n.timeHint}
            </Text>
            <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
              <Ionicons name="arrow-up" size={13} color="#A78BFA" />
            </Animated.View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const dBarStyles = StyleSheet.create({
  card: {
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1,
    padding: 13, gap: 9, marginBottom: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30, shadowRadius: 16, elevation: 8,
  },
  specular: {
    position: 'absolute', top: 0, left: 14, right: 14, height: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  iconBox: {
    width: 26, height: 26, borderRadius: 7,
    backgroundColor: 'rgba(109,40,217,0.45)',
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.28)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    ...textStyles.footnoteSemibold,                 // 13pt semibold
    flex: 1, letterSpacing: 0.1,
    fontFamily: 'InriaSerif_700Bold',
  },
  pctBadge: {
    backgroundColor: 'rgba(109,40,217,0.38)',
    borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(192,132,252,0.42)',
  },
  pctBadgeText: { ...textStyles.caption2Medium, color: '#e9d5ff' },                    // 11pt
  subtitleText: { ...textStyles.caption2 },                                            // 11pt

  track: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 3, overflow: 'hidden', flexDirection: 'row'
  },
  segmentFill: { height: '100%' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -2 },
  pctText: { ...textStyles.caption2Medium },      // 11pt medium
  sleptText: { ...textStyles.caption2 },            // 11pt

  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { ...textStyles.caption2 },           // 11pt
  emptyPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(139,92,246,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.20)',
    marginTop: 2,
  },
  emptyPromptText: {
    fontSize: 11,
    color: 'rgba(196,163,255,0.70)',
    fontFamily: 'InriaSerif_400Regular_Italic',
    letterSpacing: 0.2,
    flexShrink: 1,
    textAlign: 'center',
  },
});

// ─── Daktilo (Typewriter) Hook ────────────────────────────────────────────────
function useTypewriter(phrases: string[], typingSpeed = 80, deletingSpeed = 45, pauseMs = 1600) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = phrases[phraseIdx];

    const tick = () => {
      if (!deleting) {
        if (charIdx < current.length) {
          setDisplayed(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
          timeoutRef.current = setTimeout(tick, typingSpeed);
        } else {
          timeoutRef.current = setTimeout(() => setDeleting(true), pauseMs);
        }
      } else {
        if (charIdx > 0) {
          setDisplayed(current.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
          timeoutRef.current = setTimeout(tick, deletingSpeed);
        } else {
          setDeleting(false);
          setPhraseIdx((p) => (p + 1) % phrases.length);
          timeoutRef.current = setTimeout(tick, 300);
        }
      }
    };

    timeoutRef.current = setTimeout(tick, deleting ? deletingSpeed : typingSpeed);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [charIdx, deleting, phraseIdx]);

  return displayed;
}

// ─── Bölüm başlığı (ACTIVE HABIT / TIME HABIT / BAD HABIT) ───────────────────
function SectionRow({ label, onChange, t }: { label: string; onChange: () => void; t: ThemeTokens }) {
  const i18n = useTranslation();
  return (
    <View style={secStyles.row}>
      <Text style={[secStyles.label, { color: t.t3 }]}>{label}</Text>
      <TouchableOpacity style={[secStyles.changeBtn, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]} onPress={onChange} activeOpacity={0.7}>
        <Text style={[secStyles.changeText, { color: t.tLabel }]}>{i18n.change}</Text>
        <Ionicons name="chevron-forward" size={10} color={t.tLabel} />
      </TouchableOpacity>
    </View>
  );
}

const secStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 },
  label: { ...textStyles.caption2Medium, letterSpacing: 1.8, textTransform: 'uppercase' }, // 11pt caps
  changeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
  },
  changeText: { ...textStyles.caption2Medium, letterSpacing: 0.8 },                    // 11pt
});

function WeekDotRow({ logs, selectedDate }: { logs: { dateStr: string; status?: string }[]; selectedDate: string }) {
  const STATUS_COLORS = {
    done: '#a855f7',    // Mor (Yaptım)
    failed: '#ec4899',  // Pembe (Yapmadım)
    excused: '#f59e0b', // Turuncu/Sarı (Mazeretliyim)
  };

  return (
    <View style={dotRowStyles.row}>
      {logs.map(({ dateStr, status }) => {
        const dotColor = status ? STATUS_COLORS[status as keyof typeof STATUS_COLORS] : null;

        return (
          <View key={dateStr} style={dotRowStyles.col}>
            <View style={[
              dotRowStyles.dot,
              dotColor ? { backgroundColor: dotColor, borderColor: dotColor } : { backgroundColor: 'rgba(255,255,255,0.15)' },
            ]} />
            {dateStr === selectedDate && <View style={dotRowStyles.activeIndicator} />}
          </View>
        );
      })}
    </View>
  );
}

const dotRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, marginTop: 8 },
  col: { flex: 1, alignItems: 'center' },
  dot: {
    width: '88%',
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

// ─── Featured Habit Cards ─────────────────────────────────────────────────────
function ActiveHabitCard({ habit, selectedDate, onPress, t }: { habit: DoneHabit; selectedDate: string; onPress: () => void; t: ThemeTokens }) {
  const i18n = useTranslation();
  const allLogs = useHabitStore((state) => state.logs);
  const streak = useStreak(habit.id, selectedDate);
  const logs = useMemo(() => allLogs.filter((l) => l.habitId === habit.id), [allLogs, habit.id]);
  const weekDays = getWeekDaysForDate(i18n.weekDays, selectedDate);
  const weekLogs = weekDays.map((d) => ({
    dateStr: d.dateStr,
    status: logs.find((l) => l.date === d.dateStr)?.status,
  }));

  const currentStreak = streak.currentStreak || 0;

  return (
    <TouchableOpacity style={[darkCardStyles.card, { borderColor: t.cardBorder, shadowColor: t.cardShadow }]} onPress={onPress} activeOpacity={0.90}>
      <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.cardGrad as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <View style={[darkCardStyles.specular, { backgroundColor: t.specular }]} />
      <View style={[darkCardStyles.glassOverlay, { backgroundColor: t.glassOverlay }]} />
      <View style={darkCardStyles.inner}>
        <View style={darkCardStyles.iconBox}>
          <HabitIcon icon={habit.icon} size={24} color="rgba(255,255,255,0.92)" />
        </View>
        <View style={darkCardStyles.nameCol}>
          <Text style={[darkCardStyles.name, { color: t.t1 }]}>{habit.name}</Text>
          <Text style={[darkCardStyles.sub, { color: t.t2 }]}>{i18n.daily} · {currentStreak > 0 ? `🔥 ${currentStreak}. ${i18n.dayUnit}` : i18n.startStreak}</Text>
          <WeekDotRow logs={weekLogs} selectedDate={selectedDate} />
        </View>
        <View style={darkCardStyles.rightCol}>
          <Text style={[darkCardStyles.bigNum, { color: t.t1 }]}>{currentStreak}<Text style={[darkCardStyles.unit, { color: t.t2 }]}> {i18n.dayUnit}</Text></Text>
          <Text style={[darkCardStyles.bigLabel, { color: t.t2 }]}>{currentStreak > 0 ? i18n.fireStreak : i18n.noStreak}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TimeHabitFeaturedCard({ habit, selectedDate, onPress, t }: { habit: TimeHabit; selectedDate: string; onPress: () => void; t: ThemeTokens }) {
  const i18n = useTranslation();
  const allLogs = useHabitStore((state) => state.logs);
  const streak = useStreak(habit.id, selectedDate);
  const logs = useMemo(() => allLogs.filter((l) => l.habitId === habit.id), [allLogs, habit.id]);
  const weekDays = getWeekDaysForDate(i18n.weekDays, selectedDate);

  const dayMins = useMemo(() => {
    const log = logs.find((l) => l.date === selectedDate);
    return log?.elapsedMinutes ?? 0;
  }, [logs, selectedDate]);

  const weekLogs = weekDays.map((d) => {
    const log = logs.find((l) => l.date === d.dateStr);
    const completed = log?.status === 'done' || (log && log.elapsedMinutes !== undefined && log.elapsedMinutes > 0);
    return { dateStr: d.dateStr, status: completed ? 'done' : undefined };
  });

  return (
    <TouchableOpacity style={[darkCardStyles.card, { borderColor: t.cardBorder, shadowColor: t.cardShadow }]} onPress={onPress} activeOpacity={0.90}>
      <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.cardGrad as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <View style={[darkCardStyles.specular, { backgroundColor: t.specular }]} />
      <View style={[darkCardStyles.glassOverlay, { backgroundColor: t.glassOverlay }]} />
      <View style={darkCardStyles.inner}>
        <View style={darkCardStyles.iconBox}>
          <HabitIcon icon={habit.icon} size={24} color="rgba(255,255,255,0.92)" />
        </View>
        <View style={darkCardStyles.nameCol}>
          <Text style={[darkCardStyles.name, { color: t.t1 }]}>{habit.name}</Text>
          <Text style={[darkCardStyles.sub, { color: t.t2 }]}>{streak.currentStreak > 0 ? `🔥 ${streak.currentStreak} ${i18n.dayUnit}` : ''}</Text>
          <WeekDotRow logs={weekLogs} selectedDate={selectedDate} />
        </View>
        <View style={darkCardStyles.rightCol}>
          <Text style={[darkCardStyles.bigNum, { color: t.t1 }]}>
            {dayMins}
            <Text style={[darkCardStyles.unit, { color: t.t2, fontSize: 13, fontWeight: '400' }]}> / {habit.goalMinutes} {i18n.minUnit}</Text>
          </Text>
          <Text style={[darkCardStyles.bigLabel, { color: t.t2 }]}>{i18n.today}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function BadHabitFeaturedCard({ habit, selectedDate, onPress, t }: { habit: BadHabit; selectedDate: string; onPress: () => void; t: ThemeTokens }) {
  const i18n = useTranslation();
  const allLogs = useHabitStore((state) => state.logs);
  const logs = useMemo(() => allLogs.filter((l) => l.habitId === habit.id), [allLogs, habit.id]);
  const weekDays = getWeekDaysForDate(i18n.weekDays, selectedDate);

  const isTime = habit.limitType === 'time';
  const limitVal = isTime ? (habit.limitMinutes || 0) : (habit.limitCount || 0);

  // Periyot bazında kullanımı (süre veya adet) hesapla
  const periodUsage = useMemo(() => {
    const selDate = new Date(selectedDate);
    const sumUsage = (targetLogs: HabitLog[]) => {
      return targetLogs.reduce((acc, l) => {
        if (isTime) return acc + (l.usedMinutes || 0);
        return acc + (l.usedCount ?? (l.status === 'failed' ? 1 : 0));
      }, 0);
    };

    if (habit.limitPeriod === 'daily') {
      const targetLog = logs.find((l) => l.date === selectedDate);
      if (!targetLog) return 0;
      return isTime ? (targetLog.usedMinutes || 0) : (targetLog.usedCount ?? (targetLog.status === 'failed' ? 1 : 0));
    }

    if (habit.limitPeriod === 'monthly') {
      const monthStr = `${selDate.getFullYear()}-${String(selDate.getMonth() + 1).padStart(2, '0')}`;
      const monthLogs = logs.filter((l) => l.date.startsWith(monthStr));
      return sumUsage(monthLogs);
    }

    // weekly (default) - uses current weekDays for now, which is consistent with the UI strip
    const weekLogs = logs.filter(l => weekDays.some(d => d.dateStr === l.date));
    return sumUsage(weekLogs);
  }, [logs, weekDays, habit.limitPeriod, habit.limitType, isTime, selectedDate]);

  const exceeded = periodUsage > limitVal;

  const weekLogs = weekDays.map((d) => {
    const log = logs.find((l) => l.date === d.dateStr);
    const hasViolation = isTime 
      ? (log?.usedMinutes || 0) > habit.limitMinutes 
      : (log?.usedCount ?? (log?.status === 'failed' ? 1 : 0)) > habit.limitCount;
    // İhlal varsa pembe (failed), yoksa ve kayıt varsa mor (done)
    return { dateStr: d.dateStr, status: hasViolation ? 'failed' : (log ? 'done' : undefined) };
  });

  return (
    <TouchableOpacity style={[darkCardStyles.card, { borderColor: t.cardBorder, shadowColor: t.cardShadow }]} onPress={onPress} activeOpacity={0.90}>
      <BlurView intensity={20} tint={t.blurTint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={t.cardGrad as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <View style={[darkCardStyles.specular, { backgroundColor: t.specular }]} />
      <View style={[darkCardStyles.glassOverlay, { backgroundColor: t.glassOverlay }]} />
      <View style={darkCardStyles.inner}>
        <View style={darkCardStyles.iconBox}>
          <HabitIcon icon={habit.icon} size={24} color="rgba(255,255,255,0.92)" />
        </View>
        <View style={darkCardStyles.nameCol}>
          <Text style={[darkCardStyles.name, { color: t.t1 }]}>{habit.name}</Text>
          <Text style={[darkCardStyles.sub, { color: t.t2 }]}>
            {i18n.limitLabel + ' '}{isTime ? formatMinutes(habit.limitMinutes || 0) : `${habit.limitCount || 0} ${i18n.timesUnit}`}{' · '}{habit.limitPeriod === 'daily' ? i18n.daily : habit.limitPeriod === 'weekly' ? i18n.weekly : i18n.monthly}
          </Text>
          <WeekDotRow logs={weekLogs} selectedDate={selectedDate} />
        </View>
        <View style={darkCardStyles.rightCol}>
          <Text style={[darkCardStyles.bigNum, { color: t.t1 }, exceeded && { color: '#f87171' }]}>
            {isTime ? formatMinutes(periodUsage) : periodUsage}
            {!isTime && <Text style={[darkCardStyles.unit, { color: t.t2 }]}>×</Text>}
          </Text>
          <Text style={[darkCardStyles.bigLabel, { color: t.t2 }, exceeded && { color: '#fca5a5' }]}>
            {exceeded
              ? i18n.exceeded
              : habit.limitPeriod === 'daily'
                ? i18n.todayLabel
                : habit.limitPeriod === 'monthly'
                  ? i18n.monthlyLabel
                  : i18n.weeklyLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const darkCardStyles = StyleSheet.create({
  card: {
    borderRadius: 20, overflow: 'hidden', marginBottom: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45, shadowRadius: 28, elevation: 14,
  },
  specular: {
    position: 'absolute', top: 0, left: 16, right: 16, height: 1,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  inner: { padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  nameCol: { flex: 1, gap: 2 },
  name: { ...textStyles.headline, letterSpacing: -0.2 },                           // 17pt semibold
  sub: { ...textStyles.caption1 },                                                 // 12pt
  rightCol: { alignItems: 'flex-end', gap: 2 },
  bigNum: { ...textStyles.title1Bold },                                               // 28pt bold
  unit: { ...textStyles.calloutSemibold },                                          // 16pt semibold
  bigLabel: { ...textStyles.caption2 },                                                 // 11pt
});

// ─── Haftalık gün şeridi (cam/liquid efekt) ───────────────────────────────────
const WEEKS_AROUND = 52;
const WEEKS_DATA = Array.from({ length: WEEKS_AROUND * 2 + 1 }, (_, i) => i - WEEKS_AROUND);

function WeekStrip({ selectedDate, onSelectDate, t }: { selectedDate: string; onSelectDate: (d: string) => void; t: ThemeTokens }) {
  const i18n = useTranslation();
  const flatListRef = useRef<FlatList>(null);
  
  // Ekran genişliği - dış marginler (16*2) - border (1*2) - padding (10*2)
  const contentWidth = Dimensions.get('window').width - LAYOUT.spacing.md * 2 - 22;

  const renderItem = ({ item: offset }: { item: number }) => {
    const days = getWeekDays(i18n.weekDays, offset);
    return (
      <View style={[stripStyles.row, { width: contentWidth }]}>
        {days.map(({ label, dayNum, dateStr, isToday }, i) => {
          const isSelected = dateStr === selectedDate;
          return (
            <TouchableOpacity key={i} onPress={() => onSelectDate(dateStr)} style={stripStyles.col}>
              <Text style={[
                stripStyles.letter, 
                isSelected ? stripStyles.letterToday : (isToday ? { color: '#c084fc', fontWeight: '700' } : { color: 'rgba(255,255,255,0.38)' })
              ]}>
                {label}
              </Text>
              <View style={[
                stripStyles.numWrap, 
                isSelected ? stripStyles.numWrapToday : stripStyles.numWrapNormal,
                !isSelected && isToday && { borderColor: 'rgba(192,132,252,0.4)', backgroundColor: 'rgba(192,132,252,0.1)' }
              ]}>
                {isSelected && (
                  <>
                    <LinearGradient
                      colors={['#a855f7', '#7c3aed']}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
                    />
                    {/* İç parlaklık (liquid cam efekti) */}
                    <View style={stripStyles.liquidSheen} />
                  </>
                )}
                <Text style={[
                  stripStyles.num, 
                  isSelected ? stripStyles.numToday : (isToday ? { color: '#e9d5ff', fontWeight: '700' } : { color: 'rgba(255,255,255,0.52)' })
                ]}>
                  {dayNum}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={stripStyles.touchable}>
      {/* Dış gölge/halo */}
      <View style={stripStyles.glowHalo} />

      {/* Cam kapsayıcı */}
      <View style={stripStyles.glassCard}>
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={['rgba(130,60,240,0.28)', 'rgba(60,20,130,0.38)', 'rgba(10,4,40,0.22)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        />
        {/* Üst yansıma çizgisi */}
        <View style={stripStyles.specular} />

        <FlatList
          ref={flatListRef}
          data={WEEKS_DATA}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.toString()}
          renderItem={renderItem}
          initialScrollIndex={WEEKS_AROUND}
          getItemLayout={(data, index) => ({
            length: contentWidth,
            offset: contentWidth * index,
            index,
          })}
        />
      </View>
    </View>
  );
}

const stripStyles = StyleSheet.create({
  touchable: {
    marginHorizontal: LAYOUT.spacing.md,
    marginBottom: 10,
    marginTop: 6,
  },
  glowHalo: {
    position: 'absolute',
    top: 4, left: 12, right: 12, bottom: 0,
    borderRadius: 22,
    backgroundColor: 'transparent',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 12,
  },
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  specular: {
    position: 'absolute', top: 0, left: 22, right: 22, height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  letter: {
    ...textStyles.caption2Medium,                   // 11pt — gün harfi
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  letterToday: {
    ...textStyles.caption2Medium,                   // 11pt — bugün vurgusu
    letterSpacing: 0.5, textTransform: 'uppercase',
    color: 'rgba(216,180,254,0.95)',
  },
  numWrapNormal: {
    width: 34, height: 34, borderRadius: 11, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  numWrap: {
    alignItems: 'center', justifyContent: 'center',
  },
  numWrapToday: {
    width: 38, height: 38, borderRadius: 13, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#9333ea', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.75, shadowRadius: 14, elevation: 10,
  },
  liquidSheen: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: '48%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderTopLeftRadius: 13, borderTopRightRadius: 13,
  },
  num: { ...textStyles.subheadSemibold },       // 15pt semibold — gün sayısı
  numToday: { ...textStyles.calloutSemibold, color: '#fff' }, // 16pt — bugün vurgusu
});

// ─── Ana ekran ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const i18n = useTranslation();
  const { homeLayout } = useThemeStore();
  const { habits, setFilter, setScrollToHabitId, getTodayLog, updateLog, setHabits, setLogs, logs, selectedDate, setSelectedDate, activeHomeTab, setActiveHomeTab } = useHabitStore();
  const sleepStreak = useStreak(SLEEP_HABIT_ID, selectedDate);
  const { user, isGuest } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);

  // Veritabanından verileri çek
  const loadData = useCallback(async (showLoading = false) => {
    if (!isGuest && user?.id) {
      if (showLoading) setRefreshing(true);
      try {
        const dbHabits = await fetchHabits(user.id);
        const currentHabits = useHabitStore.getState().habits;
        const sleepHabit = currentHabits.find(h => h.id === SLEEP_HABIT_ID);
        const otherHabits = (dbHabits || []).filter(h => h.id !== SLEEP_HABIT_ID);
        setHabits(sleepHabit ? [sleepHabit, ...otherHabits] : (dbHabits || []));

        // Son 1 yıllık logları çek (seri takibi için yeterli olması adına)
        const end = getTodayString();
        const start = new Date();
        start.setDate(start.getDate() - 365);
        const startStr = start.toISOString().split('T')[0];

        const dbLogs = await fetchLogs(user.id, startStr, end);
        setLogs(dbLogs || []);
      } catch (error) {
        console.error('HomeScreen loadData error:', error);
      } finally {
        if (showLoading) setRefreshing(false);
      }
    }
  }, [user?.id, isGuest, setHabits, setLogs]);

  // Sayfa odaklandığında (başka sayfadan dönüldüğünde) verileri yenile
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // Daktilo selamlama
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return i18n.goodMorning;
    if (h < 18) return i18n.goodAfternoon;
    return i18n.goodEvening;
  })();
  const firstName = !isGuest && user?.displayName ? user.displayName.split(' ')[0] : null;
  const typewriterText = useTypewriter(
    firstName
      ? [`${greeting} ${firstName}`, `${i18n.welcomeUser} ${firstName}`, `${i18n.howAreYou} ${firstName}?`]
      : [greeting, i18n.welcomeUser, i18n.howAreYou]
  );

  // Uyku saatleri — store'dan seçili tarihteki log okunarak başlatılır
  const sleepLog = logs.find(l => l.habitId === SLEEP_HABIT_ID && l.date === selectedDate);
  const parsedSleepTimes = useMemo(() => {
    if (sleepLog?.note) {
      try { return JSON.parse(sleepLog.note) as { bedH: number; bedM: number; wakeH: number; wakeM: number }; }
      catch { return null; }
    }
    return null;
  }, [sleepLog?.note]);

  const sleepHasData = parsedSleepTimes !== null;
  const [bedH, setBedH] = useState(parsedSleepTimes?.bedH ?? 22);
  const [bedM, setBedM] = useState(parsedSleepTimes?.bedM ?? 30);
  const [wakeH, setWakeH] = useState(parsedSleepTimes?.wakeH ?? 7);
  const [wakeM, setWakeM] = useState(parsedSleepTimes?.wakeM ?? 0);

  // Seçili tarih değiştiğinde veya yeni log geldiğinde saatleri güncelle
  useEffect(() => {
    if (parsedSleepTimes) {
      setBedH(parsedSleepTimes.bedH);
      setBedM(parsedSleepTimes.bedM);
      setWakeH(parsedSleepTimes.wakeH);
      setWakeM(parsedSleepTimes.wakeM);
    } else {
      // O gün için kayıt yoksa varsayılanlara dön
      setBedH(22);
      setBedM(30);
      setWakeH(7);
      setWakeM(0);
    }
  }, [parsedSleepTimes]);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [streakCelebVisible, setStreakCelebVisible] = useState(false);
  const [celebStreakCount, setCelebStreakCount] = useState(1);

  // Uyku süresi store'a kaydet
  const saveSleepLog = async () => {
    const totalMins = timeDiff(bedH, bedM, wakeH, wakeM);
    const dateToSave = selectedDate;

    // Seçili tarihte zaten başarılı log var mı? (kutlamayı tekrar gösterme)
    const wasAlreadyDoneToday = sleepLog?.status === 'done';

    const sleepEntry: LogEntry = {
      id: `sleep-${Date.now()}`,
      minutes: totalMins,
      createdAt: new Date().toISOString(),
      note: `${String(bedH).padStart(2, '0')}:${String(bedM).padStart(2, '0')} - ${String(wakeH).padStart(2, '0')}:${String(wakeM).padStart(2, '0')}`
    };

    updateLog(SLEEP_HABIT_ID, dateToSave, {
      elapsedMinutes: totalMins,
      status: 'done', // Sleep always counts as done if logged
      note: JSON.stringify({ bedH, bedM, wakeH, wakeM }),
      entries: [sleepEntry] // Sleep typically has one entry per day
    });

    // Firestore senkronizasyonu
    if (!isGuest && user?.id) {
      // Habit'in var olup olmadığını kontrol et
      const existingHabit = useHabitStore.getState().habits.find(h => h.id === SLEEP_HABIT_ID);
      if (!existingHabit) {
        // Yoksa Firebase'e varsayılan zaman alışkanlığı olarak kaydet
        const newHabit = {
          name: i18n.sleepHabitTitle,
          icon: '🌙',
          color: '#7C3AED',
          type: 'duration' as any, // duration olarak kaydedilir, fetch sırasında time'a dönüşür
          goalMinutes: 480, // 8 saat
          isArchived: false,
          sortOrder: 0,
          userId: user.id,
          frequency: i18n.freqEveryday,
        };
        const savedHabit = await createHabitWithId(SLEEP_HABIT_ID, newHabit);
        if (savedHabit) {
          // Local store için tipi 'time' olarak düzelt
          savedHabit.type = 'time';
          useHabitStore.getState().setHabits([savedHabit, ...useHabitStore.getState().habits]);
        }
      }

      upsertLog(user.id, {
        habitId: SLEEP_HABIT_ID,
        date: dateToSave,
        elapsedMinutes: totalMins,
        status: 'done',
        note: JSON.stringify({ bedH, bedM, wakeH, wakeM }),
        entries: [sleepEntry]
      }, 'time');
    }

    // Sadece bugün ilk kez girildiyse kutlama göster
    if (!wasAlreadyDoneToday && dateToSave === getTodayString()) {
      const updatedLogs = useHabitStore.getState().getLogsForHabit(SLEEP_HABIT_ID);
      const updatedStreak = calculateStreak(updatedLogs, SLEEP_HABIT);
      setCelebStreakCount(updatedStreak.currentStreak);
      setTimeout(() => setStreakCelebVisible(true), 350);
    }
  };

  // Menu
  const [menuVisible, setMenuVisible] = useState(false);

  // Öne çıkan alışkanlık indeksleri
  const [doneIdx, setDoneIdx] = useState(0);
  const [timeIdx, setTimeIdx] = useState(0);
  const [badIdx, setBadIdx] = useState(0);

  const activeHabits = useMemo(() => habits.filter((h) => !h.isArchived && h.id !== SLEEP_HABIT_ID), [habits]);
  const doneHabits = useMemo(() => activeHabits.filter((h) => h.type === 'done') as DoneHabit[], [activeHabits]);
  const timeHabits = useMemo(() => activeHabits.filter((h) => h.type === 'time') as TimeHabit[], [activeHabits]);
  // Uyku dahil TÜM zaman alışkanlıkları (günlük bar için)
  const allTimeHabits = useMemo(() => {
    const timeHabits = habits.filter((h) => !h.isArchived && h.type === 'time') as TimeHabit[];
    if (!timeHabits.some((h) => h.id === SLEEP_HABIT_ID)) {
      timeHabits.unshift(SLEEP_HABIT);
    }
    return timeHabits;
  }, [habits]);
  const badHabits = useMemo(() => activeHabits.filter((h) => h.type === 'bad') as BadHabit[], [activeHabits]);

  const featuredDone = doneHabits[doneIdx % Math.max(1, doneHabits.length)];
  const featuredTime = timeHabits[timeIdx % Math.max(1, timeHabits.length)];
  const featuredBad = badHabits[badIdx % Math.max(1, badHabits.length)];

  const navigateToHabit = (type: 'done' | 'time' | 'bad', id: string) => {
    router.push({
      pathname: '/logHabit',
      params: { habitId: id, type, date: selectedDate }
    });
  };

  const styles = useMemo(() => makeStyles(t), [t]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={t.statusBar} />

      {/* Arka plan gradyanları */}
      <LinearGradient
        colors={t.gradBg as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
      />
      <LinearGradient
        colors={t.orb1 as any}
        style={[StyleSheet.absoluteFillObject, styles.orb1]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={t.orb2 as any}
        style={[StyleSheet.absoluteFillObject, styles.orb2]}
        start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── Üst başlık ── */}
        <View style={styles.topBar}>
          {/* Daktilo selamlama */}
          <View style={styles.greetRow}>
            <Text style={[styles.greetName, { color: t.t1 }]}>{typewriterText}</Text>
            <Text style={styles.cursor}>|</Text>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push('/habit/new')}
              activeOpacity={0.80}
            >
              <LinearGradient
                colors={['#9333ea', '#7c3aed']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                pointerEvents="none"
              />
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>{i18n.addNewHabit}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <MenuDropdown visible={menuVisible} onClose={() => setMenuVisible(false)} />

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={t.t1}
              colors={['#9333ea']}
            />
          }
        >
          {/* ── Günlük Zaman Barı ── */}
          <DailyTimeBarCard habits={habits} selectedDate={selectedDate} t={t} />

          {/* ── Sleep Schedule ── */}
          <SleepCard
            bedH={bedH} bedM={bedM} wakeH={wakeH} wakeM={wakeM}
            streak={sleepStreak.currentStreak}
            hasData={sleepHasData}
            onSave={(bH, bM, wH, wM) => {
              setBedH(bH); setBedM(bM);
              setWakeH(wH); setWakeM(wM);
              setConfirmVisible(true);
            }}
            t={t}
          />

          {/* ── Tabs (if homeLayout === 'tabs') ── */}
          {homeLayout === 'tabs' && activeHabits.length > 0 && (
            <View style={styles.tabContainer}>
              {doneHabits.length > 0 && (
                <TouchableOpacity onPress={() => setActiveHomeTab('done')} activeOpacity={0.8} style={[styles.tabBtn, activeHomeTab === 'done' && styles.tabBtnActive]}>
                  <Text style={[styles.tabText, activeHomeTab === 'done' && styles.tabTextActive]} numberOfLines={1}>{i18n.activeHabitSection}</Text>
                </TouchableOpacity>
              )}
              {timeHabits.length > 0 && (
                <TouchableOpacity onPress={() => setActiveHomeTab('time')} activeOpacity={0.8} style={[styles.tabBtn, activeHomeTab === 'time' && styles.tabBtnActive]}>
                  <Text style={[styles.tabText, activeHomeTab === 'time' && styles.tabTextActive]} numberOfLines={1}>{i18n.timeHabitSection}</Text>
                </TouchableOpacity>
              )}
              {badHabits.length > 0 && (
                <TouchableOpacity onPress={() => setActiveHomeTab('bad')} activeOpacity={0.8} style={[styles.tabBtn, activeHomeTab === 'bad' && styles.tabBtnActive]}>
                  <Text style={[styles.tabText, activeHomeTab === 'bad' && styles.tabTextActive]} numberOfLines={1}>{i18n.badHabitSection}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── Active Habit (Done) ── */}
          {doneHabits.length > 0 && homeLayout === 'stacked' && (
            <View>
              <SectionRow
                label={i18n.activeHabitSection}
                onChange={() => setDoneIdx((p) => (p + 1) % doneHabits.length)}
                t={t}
              />
              <ActiveHabitCard
                habit={featuredDone}
                selectedDate={selectedDate}
                onPress={() => navigateToHabit('done', featuredDone.id)}
                t={t}
              />
            </View>
          )}
          {doneHabits.length > 0 && homeLayout === 'tabs' && activeHomeTab === 'done' && (
            <View style={{ gap: 0 }}>
              {doneHabits.map((habit) => (
                <ActiveHabitCard
                  key={habit.id}
                  habit={habit}
                  selectedDate={selectedDate}
                  onPress={() => navigateToHabit('done', habit.id)}
                  t={t}
                />
              ))}
            </View>
          )}

          {/* ── Time Habit ── */}
          {timeHabits.length > 0 && homeLayout === 'stacked' && (
            <View>
              <SectionRow
                label={i18n.timeHabitSection}
                onChange={() => setTimeIdx((p) => (p + 1) % timeHabits.length)}
                t={t}
              />
              <TimeHabitFeaturedCard
                habit={featuredTime}
                selectedDate={selectedDate}
                onPress={() => navigateToHabit('time', featuredTime.id)}
                t={t}
              />
            </View>
          )}
          {timeHabits.length > 0 && homeLayout === 'tabs' && activeHomeTab === 'time' && (
            <View style={{ gap: 0 }}>
              {timeHabits.map((habit) => (
                <TimeHabitFeaturedCard
                  key={habit.id}
                  habit={habit}
                  selectedDate={selectedDate}
                  onPress={() => navigateToHabit('time', habit.id)}
                  t={t}
                />
              ))}
            </View>
          )}

          {/* ── Bad Habit ── */}
          {badHabits.length > 0 && homeLayout === 'stacked' && (
            <View>
              <SectionRow
                label={i18n.badHabitSection}
                onChange={() => setBadIdx((p) => (p + 1) % badHabits.length)}
                t={t}
              />
              <BadHabitFeaturedCard
                habit={featuredBad}
                selectedDate={selectedDate}
                onPress={() => navigateToHabit('bad', featuredBad.id)}
                t={t}
              />
            </View>
          )}
          {badHabits.length > 0 && homeLayout === 'tabs' && activeHomeTab === 'bad' && (
            <View style={{ gap: 0 }}>
              {badHabits.map((habit) => (
                <BadHabitFeaturedCard
                  key={habit.id}
                  habit={habit}
                  selectedDate={selectedDate}
                  onPress={() => navigateToHabit('bad', habit.id)}
                  t={t}
                />
              ))}
            </View>
          )}

          {/* Boş durum */}
          {activeHabits.length === 0 && (
            <View style={styles.emptyState}>
              <Image
                source={require('@/assets/brand/favicon.png')}
                style={styles.emptyLogo}
                resizeMode="contain"
              />
              <Text style={[styles.emptyTitle, { color: t.t2 }]}>{i18n.noHabitsYet}</Text>
              <Text style={[styles.emptyText, { color: t.t3 }]}>{i18n.noHabitsHint}</Text>
            </View>
          )}

          <View style={{ height: 12 }} />
        </ScrollView>

        {/* ── Haftalık şerit ── */}
        <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} t={t} />
      </SafeAreaView>

      {/* ── AI Koç FAB ── */}
      <TouchableOpacity
        style={styles.aiFab}
        onPress={() => router.push('/aiCoach')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#a855f7', '#7c3aed', '#6d28d9']}
          style={styles.aiFabGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="sparkles" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <SleepConfirmModal
        visible={confirmVisible}
        bedH={bedH} bedM={bedM}
        wakeH={wakeH} wakeM={wakeM}
        onConfirm={saveSleepLog}
        onClose={() => setConfirmVisible(false)}
      />
      <StreakCelebrationModal
        visible={streakCelebVisible}
        streakCount={celebStreakCount}
        onClose={() => setStreakCelebVisible(false)}
      />
    </View>
  );
}

function makeStyles(t: ThemeTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.screenBg },
    safe: { flex: 1 },
    orb1: { top: -120, left: -90, width: '80%', height: '55%', borderRadius: 400 },
    orb2: { top: -80, right: -60, width: '60%', height: '48%', borderRadius: 400 },

    topBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: LAYOUT.spacing.md, paddingTop: 12, paddingBottom: 14,
    },
    greetRow: { flexDirection: 'row', alignItems: 'center' },
    greetName: {
      ...textStyles.headline,                       // 17pt semibold
      fontFamily: 'InriaSerif_700Bold',
      letterSpacing: 0.2,
    },
    cursor: {
      ...textStyles.title3,                         // 20pt — daktilo imleci
      color: '#a855f7', fontWeight: '300', marginLeft: 1,
    },
    addBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 18, paddingVertical: 12,
      borderRadius: 99, overflow: 'hidden',
      borderWidth: 1.5, borderColor: 'rgba(192,132,252,0.60)',
      shadowColor: '#9333ea', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.55, shadowRadius: 12, elevation: 8,
    },
    addBtnText: { ...textStyles.calloutSemibold, color: '#fff' },                      // 16pt semibold
    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    menuBtn: {
      width: 38, height: 38, borderRadius: 12, overflow: 'hidden',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: 'rgba(168,85,247,0.35)',
    },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: LAYOUT.spacing.md, paddingBottom: 10 },

    emptyState: { alignItems: 'center', paddingVertical: 48 },
    emptyLogo: { width: 72, height: 72, marginBottom: 14 },
    emptyTitle: { ...textStyles.headline, marginBottom: 6 },                           // 17pt semibold
    emptyText: { ...textStyles.footnote, textAlign: 'center' },                       // 13pt

    tabContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 18,
      paddingHorizontal: 2,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 6,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.03)',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    tabBtnActive: {
      backgroundColor: 'rgba(109,40,217,0.35)',
      borderColor: 'rgba(192,132,252,0.35)',
      shadowColor: '#9333ea',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 4,
    },
    tabText: {
      ...textStyles.caption1Medium,
      color: 'rgba(255,255,255,0.40)',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    tabTextActive: {
      color: '#e9d5ff',
      fontWeight: '700',
    },

    // AI FAB
    aiFab: {
      position: 'absolute',
      bottom: 95,
      right: 20,
      width: 52,
      height: 52,
      borderRadius: 26,
      overflow: 'hidden',
      shadowColor: '#7c3aed',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.65,
      shadowRadius: 16,
      elevation: 12,
      borderWidth: 1.5,
      borderColor: 'rgba(192,132,252,0.50)',
    },
    aiFabGrad: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
