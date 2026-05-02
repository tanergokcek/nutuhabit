import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '@/src/store/useHabitStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { createHabit } from '@/src/services/habits';
import { scheduleHabitReminder } from '@/src/services/notifications';
import { serverTimestamp } from 'firebase/firestore';
import { HabitIcon } from '@/components/ui/HabitIcon';
import { HabitType, DoneHabit, TimeHabit, BadHabit, BadLimitPeriod } from '@/src/types/habit';
import { validateHabitName, validateGoalMinutes } from '@/src/utils/validators';
import { HABIT_ICONS } from '@/constants/templates';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';

const COLOR_OPTIONS = [
  '#7C3AED', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#F97316', '#EF4444', '#EC4899',
];

export default function NewHabitScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const i18n = useTranslation();
  const addHabit = useHabitStore((state) => state.addHabit);

  const FREQUENCY_OPTIONS = [i18n.freqEveryday, i18n.freqWeekdays, i18n.freqWeekends, i18n.freqCustom];
  const DAY_LABELS = i18n.weekDays; // use common week days
  const PERIOD_OPTIONS: { key: BadLimitPeriod; label: string }[] = [
    { key: 'daily', label: i18n.periodDayLabel },
    { key: 'weekly', label: i18n.periodWeekLabel },
    { key: 'monthly', label: i18n.periodMonthLabel },
  ];

  // ── Form state (tüm mantık korundu) ─────────────────────────────────────
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('done');
  const [icon, setIcon] = useState('star-outline');
  const [goalMinutes, setGoalMinutes] = useState('30');
  const [limitPeriod, setLimitPeriod] = useState<BadLimitPeriod>('daily');
  const [limitCount, setLimitCount] = useState(1);
  const [frequency, setFrequency] = useState(i18n.freqEveryday);
  const [customDays, setCustomDays] = useState<boolean[]>(Array(7).fill(false));

  const toggleDay = (idx: number) =>
    setCustomDays((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  const [color, setColor] = useState('#7C3AED');
  const [nameError, setNameError] = useState<string | null>(null);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Expandable panel state
  const [openPanel, setOpenPanel] = useState<'frequency' | 'reminder' | 'icon' | 'period' | null>(null);

  const togglePanel = (panel: 'frequency' | 'reminder' | 'icon' | 'period') =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  const handleSave = async () => {
    const nameValidation = validateHabitName(name);
    if (!nameValidation.isValid) { setNameError(nameValidation.error); return; }
    setNameError(null);

    const { user, isGuest } = useAuthStore.getState();
    if (isGuest || !user) {
      Alert.alert(i18n.deleteHabitTitle, i18n.loginRequiredMsg);
      return;
    }

    setIsSaving(true);
    try {
      // ── Firebase Kayıt ──────────────────────────────────────────────
      const habitTypeMap: Record<HabitType, string> = {
        done: 'check',
        time: 'duration',
        bad: 'bad'
      };

      const habitData: any = {
        userId: user.id,
        type: habitTypeMap[type],
        name: name.trim(),
        icon: icon,
        createdAt: serverTimestamp(),
        reminderEnabled,
        reminderTime,
      };

      if (type === 'done' || type === 'time') {
        habitData.frequency = frequency === i18n.freqCustom ? 'Özel' : (frequency === i18n.freqEveryday ? 'Her gün' : frequency);
        if (frequency === 'Özel') {
          habitData.customDays = customDays;
        }
      }

      if (type === 'time') {
        habitData.color = color;
      }

      if (type === 'bad') {
        habitData.limitCount = limitCount;
        habitData.limitPeriod = limitPeriod;
        habitData.limitType = 'count';
      }

      const newHabit = await createHabit(habitData);
      
      if (newHabit && reminderEnabled) {
        await scheduleHabitReminder(newHabit.id, newHabit.name, reminderTime);
      }
      
      // ── Local Store Güncelleme ──────────────────────────────────────
      const base = { name: name.trim(), icon, type, color: type === 'time' ? color : undefined };
      if (type === 'done') {
        addHabit(base as Omit<DoneHabit, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'isArchived' | 'sortOrder'>);
      } else if (type === 'time') {
        addHabit({ ...base, goalMinutes: 0 } as Omit<TimeHabit, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'isArchived' | 'sortOrder'>);
      } else {
        addHabit({
          ...base,
          limitType: 'count',
          limitPeriod,
          limitMinutes: 0,
          limitCount,
          reminderEnabled,
          reminderTime,
        } as Omit<BadHabit, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'isArchived' | 'sortOrder'>);
      }
      
      router.back();
    } catch (error) {
      console.error("Habit save error:", error);
      Alert.alert(i18n.deleteHabitTitle, i18n.dbSaveError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.screenBg }]}>
      <StatusBar barStyle={t.statusBar} />

      {/* Liquid Glass background */}
      <LinearGradient
        colors={t.gradBg as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
      />
      <LinearGradient
        colors={t.orb1 as any}
        style={[StyleSheet.absoluteFillObject, { top: -90, left: -70, width: '80%', height: '52%', borderRadius: 400 }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={t.orb2 as any}
        style={[StyleSheet.absoluteFillObject, { top: -60, right: -50, width: '60%', height: '45%', borderRadius: 400 }]}
        start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7c3aed', '#5b21b6']}
                style={styles.backGrad}
              >
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: t.t1 }]}>{i18n.newHabitTitle}</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* ── Divider ── */}
          <View style={[styles.divider, { backgroundColor: t.divider }]} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Choose Habit Type ── */}
            <View style={styles.centeredLabelRow}>
              <View style={[styles.labelLine, { backgroundColor: t.tLabel }]} />
              <Text style={[styles.centeredLabel, { color: t.tLabel }]}>{i18n.habitTypeSelect}</Text>
              <View style={[styles.labelLine, { backgroundColor: t.tLabel }]} />
            </View>

            <View style={styles.typeRow}>
              {([
                { key: 'done' as HabitType, label: i18n.typeDone },
                { key: 'time' as HabitType, label: i18n.typeTime },
                { key: 'bad' as HabitType, label: i18n.typeBad },
              ] as { key: HabitType; label: string }[]).map((opt) => {
                const isActive = type === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setType(opt.key)}
                    activeOpacity={0.75}
                    style={styles.typeButtonWrapper}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={['rgba(168,85,247,0.55)', 'rgba(109,40,217,0.45)']}
                        style={styles.typeButtonActive}
                      >
                        <Text style={styles.typeTextActive} numberOfLines={1} adjustsFontSizeToFit>{opt.label}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.typeButtonInactive, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}>
                        <Text style={[styles.typeTextInactive, { color: t.t3 }]} numberOfLines={1} adjustsFontSizeToFit>{opt.label}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Habit Name ── */}
            <View style={styles.centeredLabelRow}>
              <View style={[styles.labelLine, { backgroundColor: t.tLabel }]} />
              <Text style={[styles.centeredLabel, { color: t.tLabel }]}>{i18n.habitNameLabel}</Text>
              <View style={[styles.labelLine, { backgroundColor: t.tLabel }]} />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.nameInput,
                  { backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.inputText },
                  nameError ? styles.nameInputError : null,
                ]}
                value={name}
                onChangeText={(tv) => { setName(tv); if (nameError) setNameError(null); }}
                placeholder={i18n.habitNamePlaceholder}
                placeholderTextColor={t.inputPlaceholder}
                autoFocus
                maxLength={50}
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}
            </View>

            {/* ── Detail Section ── */}
            <View style={styles.detailHeaderRow}>
              <View style={[styles.detailLine, { backgroundColor: t.divider }]} />
              <Text style={[styles.detailHeaderText, { color: t.t2 }]}>{i18n.detailLabel}</Text>
              <View style={[styles.detailLine, { backgroundColor: t.divider }]} />
            </View>

            {/* Frequency row — yalnızca done/time türleri için */}
            {type !== 'bad' && (
              <>
                <TouchableOpacity
                  style={[styles.detailRow, { borderBottomColor: t.divider }]}
                  onPress={() => togglePanel('frequency')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.detailRowText, { color: t.tLabel }]}>{i18n.frequencyLabel}</Text>
                  <Text style={[styles.detailRowValue, { color: t.t3 }]}>{frequency}</Text>
                  <Ionicons
                    name={openPanel === 'frequency' ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={t.tLabel}
                  />
                </TouchableOpacity>
                {openPanel === 'frequency' && (
                  <View style={[styles.expandedPanel, { backgroundColor: t.panelBg, borderColor: t.panelBorder }]}>
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          styles.optionRow,
                          { borderBottomColor: t.divider },
                          frequency === opt && styles.optionRowActive,
                        ]}
                        onPress={() => { setFrequency(opt); setOpenPanel(null); }}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.optionText, { color: t.t2 }, frequency === opt && styles.optionTextActive]}>
                          {opt}
                        </Text>
                        {frequency === opt && (
                          <Ionicons name="checkmark" size={14} color="#c084fc" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Limit row — yalnızca kötü alışkanlık için */}
            {type === 'bad' && (
              <>
                <TouchableOpacity
                  style={[styles.detailRow, { borderBottomColor: t.divider }]}
                  onPress={() => togglePanel('period')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.detailRowText, { color: t.tLabel }]}>{i18n.limitLabel}</Text>
                  <Text style={[styles.detailRowValue, { color: t.t3 }]}>
                    {`${limitCount} ${i18n.stepperTimes} / ${PERIOD_OPTIONS.find((p) => p.key === limitPeriod)?.label ?? i18n.periodDayLabel}`}
                  </Text>
                  <Ionicons
                    name={openPanel === 'period' ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={t.tLabel}
                  />
                </TouchableOpacity>
                {openPanel === 'period' && (
                  <View style={[styles.limitPanel, { backgroundColor: t.panelBg, borderColor: t.panelBorder }]}>
                    {/* Period seçici */}
                    <Text style={[styles.limitPanelLabel, { color: t.t3 }]}>{i18n.periodLabel}</Text>
                    <View style={styles.periodBtnRow}>
                      {PERIOD_OPTIONS.map((opt) => {
                        const active = limitPeriod === opt.key;
                        return active ? (
                          <LinearGradient
                            key={opt.key}
                            colors={['rgba(168,85,247,0.55)', 'rgba(109,40,217,0.45)']}
                            style={styles.periodBtnActive}
                          >
                            <TouchableOpacity onPress={() => setLimitPeriod(opt.key)} activeOpacity={0.8} style={styles.periodBtnInner}>
                              <Text style={styles.periodBtnTextActive}>{opt.label}</Text>
                            </TouchableOpacity>
                          </LinearGradient>
                        ) : (
                          <TouchableOpacity
                            key={opt.key}
                            onPress={() => setLimitPeriod(opt.key)}
                            activeOpacity={0.75}
                            style={[styles.periodBtnInactive, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}
                          >
                            <Text style={[styles.periodBtnText, { color: t.t3 }]}>{opt.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Kaç kez stepper */}
                    <Text style={[styles.limitPanelLabel, { color: t.t3, marginTop: 14 }]}>{i18n.timesLabel}</Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        onPress={() => setLimitCount((c) => Math.max(1, c - 1))}
                        style={[styles.stepperBtn, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="remove" size={18} color={t.t2} />
                      </TouchableOpacity>
                      <Text style={[styles.stepperValue, { color: t.t1 }]}>{limitCount}</Text>
                      <TouchableOpacity
                        onPress={() => setLimitCount((c) => Math.min(99, c + 1))}
                        style={[styles.stepperBtn, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="add" size={18} color={t.t2} />
                      </TouchableOpacity>
                      <Text style={[styles.stepperUnit, { color: t.t3 }]}>{i18n.stepperTimes}</Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Özel gün seçici — yalnızca "Özel" seçiliyken görünür */}
            {frequency === i18n.freqCustom && openPanel !== 'frequency' && (
              <View style={[styles.customDayPanel, { backgroundColor: t.panelBg, borderColor: t.panelBorder }]}>
                <Text style={[styles.customDayTitle, { color: t.t3 }]}>{i18n.customDayTitle}</Text>
                <View style={styles.customDayRow}>
                  {DAY_LABELS.map((label, idx) => {
                    const active = customDays[idx];
                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => toggleDay(idx)}
                        activeOpacity={0.75}
                        style={styles.dayBtnWrapper}
                      >
                        {active ? (
                          <LinearGradient
                            colors={['#9333ea', '#6d28d9']}
                            style={styles.dayBtnActive}
                          >
                            <Text style={styles.dayBtnTextActive}>{label}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={[styles.dayBtnInactive, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}>
                            <Text style={[styles.dayBtnText, { color: t.t3 }]}>{label}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {customDays.every((d) => !d) && (
                  <Text style={[styles.customDayHint, { color: t.t3 }]}>{i18n.customDayHint}</Text>
                )}
              </View>
            )}



            {/* Reminder row */}
            <TouchableOpacity
              style={[styles.detailRow, { borderBottomColor: t.divider }]}
              onPress={() => togglePanel('reminder')}
              activeOpacity={0.7}
            >
              <Text style={[styles.detailRowText, { color: t.tLabel }]}>{i18n.reminderLabel}</Text>
              <Text style={[styles.detailRowValue, { color: t.t3 }]}>
                {reminderEnabled ? reminderTime : i18n.reminderOff}
              </Text>
              <Ionicons
                name={openPanel === 'reminder' ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={t.tLabel}
              />
            </TouchableOpacity>
            {openPanel === 'reminder' && (
              <View style={[styles.expandedPanel, { backgroundColor: t.panelBg, borderColor: t.panelBorder }]}>
                <View style={styles.reminderToggleRow}>
                  <Text style={[styles.reminderLabel, { color: t.t2 }]}>{i18n.reminderToggleLabel}</Text>
                  <TouchableOpacity 
                    onPress={() => setReminderEnabled(!reminderEnabled)}
                    style={[
                      styles.toggleBtn, 
                      { backgroundColor: reminderEnabled ? '#7c3aed' : 'rgba(255,255,255,0.1)' }
                    ]}
                  >
                    <View style={[styles.toggleCircle, { transform: [{ translateX: reminderEnabled ? 20 : 0 }] }]} />
                  </TouchableOpacity>
                </View>
                
                {reminderEnabled && (
                  <TouchableOpacity 
                    style={styles.timeSelectBtn}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={[styles.timeSelectLabel, { color: t.t3 }]}>{i18n.reminderTimeSelectLabel}</Text>
                    <Text style={[styles.timeSelectValue, { color: t.t1 }]}>{reminderTime}</Text>
                    <Ionicons name="time-outline" size={18} color="#c084fc" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TimePickerModal
              visible={showTimePicker}
              title={i18n.reminderTimePickerTitle}
              time={reminderTime}
              onConfirm={(time) => {
                setReminderTime(time);
                setShowTimePicker(false);
              }}
              onClose={() => setShowTimePicker(false)}
            />

            {/* Renk seçici — yalnızca time türü için */}
            {type === 'time' && (
              <View style={[styles.detailRow, { borderBottomColor: t.divider }]}>
                <Text style={[styles.detailRowText, { color: t.tLabel }]}>{i18n.colorLabel}</Text>
                <View style={styles.colorPickerRow}>
                  {COLOR_OPTIONS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setColor(c)}
                      activeOpacity={0.75}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c },
                        color === c && styles.colorDotSelected,
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Choose Icon row */}
            <TouchableOpacity
              style={[styles.detailRow, styles.detailRowLast]}
              onPress={() => togglePanel('icon')}
              activeOpacity={0.7}
            >
              <Text style={[styles.detailRowText, { color: t.tLabel }]}>{i18n.iconLabel}</Text>
              <HabitIcon icon={icon} size={22} color="#c084fc" />
              <Ionicons
                name={openPanel === 'icon' ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={t.tLabel}
              />
            </TouchableOpacity>
            {openPanel === 'icon' && (
              <View style={[styles.iconGrid, { backgroundColor: t.panelBg, borderColor: t.panelBorder }]}>
                {HABIT_ICONS.map((iconName) => {
                  const isActive = icon === iconName;
                  return (
                    <TouchableOpacity
                      key={iconName}
                      onPress={() => { setIcon(iconName); setOpenPanel(null); }}
                      style={[
                        styles.iconCell,
                        { backgroundColor: t.rowBg, borderColor: t.rowBorder },
                        isActive && styles.iconCellActive,
                      ]}
                      activeOpacity={0.75}
                    >
                      <HabitIcon
                        icon={iconName}
                        size={22}
                        color={isActive ? '#c084fc' : 'rgba(255,255,255,0.72)'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* ── Footer: Cancel + Save ── */}
          <View style={[
            styles.footer,
            { backgroundColor: t.dark ? 'rgba(13,4,46,0.85)' : 'rgba(255,255,255,0.92)', borderTopColor: t.divider },
          ]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}
              onPress={() => router.back()}
              activeOpacity={0.75}
            >
              <Text style={[styles.cancelText, { color: t.t2 }]}>{i18n.cancelBtn}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveWrapper}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={isSaving}
            >
              <LinearGradient
                colors={['#7c3aed', '#5b21b6']}
                style={styles.saveGrad}
              >
                <Text style={styles.saveText}>{isSaving ? i18n.savingBtn : i18n.saveBtn}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#5b21b6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.50,
    shadowRadius: 10,
    elevation: 6,
  },
  backGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontSize: 20,
    fontWeight: FONTS.weight.bold,
    letterSpacing: -0.3,
  },

  divider: {
    height: 1,
    marginHorizontal: LAYOUT.spacing.md,
    marginBottom: 32,
  },

  scroll: {
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingTop: 8,
    paddingBottom: 12,
  },

  // Centered label (Choose Habit Type / Habit Name)
  centeredLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  labelLine: {
    flex: 1,
    height: 1,
    opacity: 0.25,
  },
  centeredLabel: {
    fontSize: 12,
    fontFamily: 'InriaSerif_700Bold',
    letterSpacing: 0.3,
  },

  // Type selector
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 36,
  },
  typeButtonWrapper: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  typeButtonActive: {
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(192,132,252,0.55)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 5,
  },
  typeButtonInactive: {
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeTextActive: {
    fontSize: 11,
    fontFamily: 'InriaSerif_700Bold',
    color: '#fff',
    letterSpacing: 0.8,
  },
  typeTextInactive: {
    fontSize: 11,
    fontFamily: 'InriaSerif_700Bold',
    letterSpacing: 0.8,
  },

  // Name input
  inputWrapper: { marginBottom: 36 },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'InriaSerif_400Regular',
  },
  nameInputError: {
    borderColor: 'rgba(239,68,68,0.60)',
  },
  errorText: {
    fontSize: 11,
    color: '#f87171',
    marginTop: 5,
    marginLeft: 4,
  },
  errorTextInline: {
    fontSize: 10,
    color: '#f87171',
    marginLeft: 8,
  },

  // Detail section
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  detailLine: {
    flex: 1,
    height: 1,
  },
  detailHeaderText: {
    fontSize: 13,
    fontFamily: 'InriaSerif_700Bold',
    letterSpacing: 0.5,
  },

  // Detail rows (Frequency / Reminder / Icon)
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    gap: 8,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailRowText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'InriaSerif_400Regular',
  },
  detailRowValue: {
    fontSize: 13,
    marginRight: 4,
  },
  selectedIconPreview: {
    fontSize: 22,
    marginRight: 4,
  },
  inlineInput: {
    fontSize: 14,
    fontFamily: 'InriaSerif_700Bold',
    textAlign: 'right',
    minWidth: 48,
    paddingVertical: 0,
  },
  // Limit panel (bad habit)
  limitPanel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 4,
  },
  limitPanelLabel: {
    fontSize: 11,
    fontFamily: 'InriaSerif_700Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  periodBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodBtnActive: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(192,132,252,0.55)',
  },
  periodBtnInner: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  periodBtnInactive: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  periodBtnTextActive: {
    fontSize: 14,
    fontFamily: 'InriaSerif_700Bold',
    color: '#fff',
  },
  periodBtnText: {
    fontSize: 14,
    fontFamily: 'InriaSerif_700Bold',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 24,
    fontFamily: 'InriaSerif_700Bold',
    minWidth: 36,
    textAlign: 'center',
  },
  stepperUnit: {
    fontSize: 14,
    fontFamily: 'InriaSerif_400Regular',
  },

  limitTypeToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  limitTypeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  limitTypeBtnActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#c084fc',
  },
  // Reminder styles
  reminderToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  reminderLabel: {
    fontSize: 14,
    fontFamily: 'InriaSerif_700Bold',
  },
  toggleBtn: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 4,
    justifyContent: 'center',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  timeSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  timeSelectLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'InriaSerif_400Regular',
  },
  timeSelectValue: {
    fontSize: 16,
    fontFamily: 'InriaSerif_700Bold',
  },
  limitTypeBtnText: {
    fontSize: 13,
    fontFamily: 'InriaSerif_700Bold',
  },
  limitTypeBtnTextActive: {
    color: '#c084fc',
    fontFamily: 'InriaSerif_700Bold',
  },

  // Custom day picker
  customDayPanel: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 4,
    gap: 10,
  },
  customDayTitle: {
    fontSize: 11,
    fontFamily: 'InriaSerif_700Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  customDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayBtnWrapper: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  dayBtnActive: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  dayBtnInactive: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
  },
  dayBtnTextActive: {
    fontSize: 11,
    fontFamily: 'InriaSerif_700Bold',
    color: '#fff',
  },
  dayBtnText: {
    fontSize: 11,
    fontFamily: 'InriaSerif_700Bold',
  },
  customDayHint: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.7,
  },

  // Expanded panels
  expandedPanel: {
    borderRadius: 14,
    marginBottom: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  optionRowActive: {
    backgroundColor: 'rgba(168,85,247,0.15)',
  },
  optionText: { fontSize: 14, fontWeight: '500' },
  optionTextActive: { color: '#c084fc', fontWeight: '700' },
  reminderNote: {
    fontSize: 13,
    padding: 16,
    lineHeight: 20,
  },

  // Color picker
  colorPickerRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 5,
  },

  // Icon grid
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  iconCell: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconCellActive: {
    backgroundColor: 'rgba(168,85,247,0.30)',
    borderColor: 'rgba(192,132,252,0.55)',
    borderWidth: 1.5,
  },

  // Footer buttons
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'InriaSerif_700Bold',
  },
  saveWrapper: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#5b21b6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
  saveGrad: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 16,
    fontFamily: 'InriaSerif_700Bold',
    color: '#fff',
    letterSpacing: 0.3,
  },
});

function TimePickerModal({ visible, title, time, onConfirm, onClose }: { 
  visible: boolean; title: string; time: string; onConfirm: (t: string) => void; onClose: () => void 
}) {
  const [h, setH] = useState(parseInt(time.split(':')[0], 10));
  const [m, setM] = useState(parseInt(time.split(':')[1], 10));

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
  title: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  col: { alignItems: 'center', gap: 5 },
  val: { fontSize: 44, fontWeight: '800', color: '#fff', minWidth: 60, textAlign: 'center' },
  colon: { fontSize: 40, fontWeight: '800', color: 'rgba(255,255,255,0.4)', marginBottom: 5 },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  btn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  btnText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  confirmBtn: { backgroundColor: '#7c3aed' },
  confirmBtnText: { color: '#fff', fontWeight: '700' },
});
