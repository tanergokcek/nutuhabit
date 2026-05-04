import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '@/src/store/useHabitStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { HabitIcon } from '@/components/ui/HabitIcon';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { HabitType, TimeHabit, BadHabit } from '@/src/types/habit';
import { validateHabitName, validateGoalMinutes, validateLimit } from '@/src/utils/validators';
import { HABIT_ICONS } from '@/constants/templates';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';
import { updateHabitService, deleteHabitService } from '@/src/services/habits';
import { scheduleHabitReminder, cancelHabitReminder } from '@/src/services/notifications';
import { Modal } from 'react-native';
import { useTranslation } from '@/src/hooks/useTranslation';

const TYPE_OPTIONS = (i18n: any): { type: HabitType; label: string; emoji: string; color: string }[] => [
  { type: 'done', label: i18n.typeDone, emoji: '✅', color: COLORS.success },
  { type: 'time', label: i18n.typeTime, emoji: '⏱', color: COLORS.primary[400] },
  { type: 'bad', label: i18n.typeBad, emoji: '🚫', color: COLORS.danger },
];

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const i18n = useTranslation();
  const { habits, updateHabit, deleteHabit } = useHabitStore();
  const { user, isGuest } = useAuthStore();

  const habit = habits.find((h) => h.id === id);

  const [name, setName] = useState(habit?.name ?? '');
  const [type] = useState<HabitType>(habit?.type ?? 'done');
  const [icon, setIcon] = useState(habit?.icon ?? '⭐');
  const [goalMinutes, setGoalMinutes] = useState(
    habit?.type === 'time' ? String((habit as TimeHabit).goalMinutes) : '30'
  );
  const [limitCount, setLimitCount] = useState(
    habit?.type === 'bad' ? String((habit as BadHabit).limitCount || '1') : '1'
  );
  const [limitMinutes, setLimitMinutes] = useState(
    habit?.type === 'bad' ? String((habit as BadHabit).limitMinutes || '60') : '60'
  );
  const [limitType] = useState<"count" | "time">(
    habit?.type === 'bad' ? (habit as BadHabit).limitType || 'count' : 'count'
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(habit?.reminderEnabled ?? false);
  const [reminderTime, setReminderTime] = useState(habit?.reminderTime ?? '08:00');
  const [showTimePicker, setShowTimePicker] = useState(false);

  if (!habit) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#13043e', '#1c0a4a']} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>{i18n.habitNotFound}</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
              <LinearGradient colors={['#9333ea', '#7c3aed']} style={styles.backBtnGrad}>
                <Text style={styles.backBtnText}>{i18n.backBtn}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const handleSave = async () => {
    const nameValidation = validateHabitName(name);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error);
      return;
    }
    setNameError(null);

    if (type === 'time') {
      const goalValidation = validateGoalMinutes(goalMinutes);
      if (!goalValidation.isValid) {
        setGoalError(goalValidation.error);
        return;
      }
      setGoalError(null);
    }

    if (type === 'bad') {
      const valToValidate = limitType === 'count' ? limitCount : limitMinutes;
      const limitValidation = validateLimit(valToValidate);
      if (!limitValidation.isValid) {
        setLimitError(limitValidation.error);
        return;
      }
      setLimitError(null);
    }

    setIsSaving(true);
    try {
      const updates: any = { 
        name: name.trim(), 
        icon,
        reminderEnabled,
        reminderTime,
      };
      
      if (type === 'time') {
        updates.goalMinutes = parseInt(goalMinutes, 10);
      } else if (type === 'bad') {
        updates.limitType = limitType;
        if (limitType === 'count') {
          updates.limitCount = parseInt(limitCount, 10);
        } else {
          updates.limitMinutes = parseInt(limitMinutes, 10);
        }
      }

      // Firebase update
      if (!isGuest && user?.id) {
        await updateHabitService(habit.id, updates);
        
        if (reminderEnabled) {
          await scheduleHabitReminder(habit.id, name.trim(), reminderTime);
        } else {
          await cancelHabitReminder(habit.id);
        }
      }

      // Local update
      updateHabit(habit.id, updates);
      router.back();
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert(i18n.errorTitle, i18n.habitUpdateError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      i18n.deleteHabitTitle,
      i18n.deleteHabitFullConfirm.replace('%s', habit.name),
      [
        { text: i18n.cancel, style: 'cancel' },
        {
          text: i18n.deleteLabel,
          style: 'destructive',
          onPress: async () => {
            await cancelHabitReminder(habit.id);
            await deleteHabitService(habit.id);
            deleteHabit(habit.id);
            router.dismissAll();
          },
        },
      ]
    );
  };

  const currentType = TYPE_OPTIONS(i18n).find((t) => t.type === type);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#13043e', '#1c0a4a', '#13043e']}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(139,92,246,0.30)', 'transparent']}
        style={[StyleSheet.absoluteFillObject]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <LinearGradient
                colors={['rgba(168,85,247,0.35)', 'rgba(109,40,217,0.25)']}
                style={styles.closeBtnGrad}
              >
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.80)" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{i18n.editHabitTitle}</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Type badge (read-only) */}
            {currentType ? (
              <View style={[styles.typeBadge, { backgroundColor: `${currentType.color}18`, borderColor: `${currentType.color}40` }]}>
                <Text style={styles.typeBadgeEmoji}>{currentType.emoji}</Text>
                <Text style={[styles.typeBadgeText, { color: currentType.color }]}>
                  {currentType.label} {i18n.modeCantChange}
                </Text>
              </View>
            ) : null}

            {/* Name */}
            <Input
              value={name}
              onChangeText={setName}
              label={i18n.habitNameLabel}
              placeholder={i18n.habitNamePlaceholder}
              error={nameError}
              maxLength={50}
            />

            {/* Icon picker */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{i18n.iconLabel.toUpperCase()}</Text>
              <TouchableOpacity
                onPress={() => setShowIconPicker(!showIconPicker)}
                style={styles.iconPreview}
                activeOpacity={0.75}
              >
                <View style={styles.iconPreviewBox}>
                  <HabitIcon icon={icon} size={24} color="#c084fc" />
                </View>
                <View style={styles.iconPreviewContent}>
                  <Text style={styles.iconPreviewTitle}>{i18n.iconLabel}</Text>
                  <Text style={styles.iconPreviewSub}>{i18n.changeIcon}</Text>
                </View>
                <Ionicons
                  name={showIconPicker ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="rgba(255,255,255,0.35)"
                />
              </TouchableOpacity>

              {showIconPicker ? (
                <View style={styles.iconGrid}>
                  {HABIT_ICONS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => {
                        setIcon(emoji);
                        setShowIconPicker(false);
                      }}
                      style={[styles.iconOption, icon === emoji && styles.iconOptionActive]}
                      activeOpacity={0.75}
                    >
                      <HabitIcon 
                        icon={emoji} 
                        size={20} 
                        color={icon === emoji ? '#fff' : 'rgba(255,255,255,0.6)'} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>

            {/* Conditional fields */}
            {type === 'time' ? (
              <Input
                value={goalMinutes}
                onChangeText={setGoalMinutes}
                label={i18n.habitGoalMinutesLabel}
                placeholder="30"
                keyboardType="numeric"
                error={goalError}
                maxLength={4}
              />
            ) : null}

            {type === 'bad' ? (
              <Input
                value={limitType === 'count' ? limitCount : limitMinutes}
                onChangeText={limitType === 'count' ? setLimitCount : setLimitMinutes}
                label={limitType === 'count' ? i18n.habitLimitCountLabel : i18n.habitLimitMinutesLabel}
                placeholder={limitType === 'count' ? "5" : "60"}
                keyboardType="numeric"
                error={limitError}
                maxLength={4}
              />
            ) : null}

            {/* Reminder */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{i18n.reminderLabel.toUpperCase()}</Text>
              <View style={styles.reminderCard}>
                <View style={styles.reminderRow}>
                  <Ionicons name="notifications-outline" size={20} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.reminderText}>{i18n.reminderLabel}</Text>
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
                    <Text style={styles.timeSelectLabel}>{i18n.reminderTimeSelectLabel}</Text>
                    <Text style={styles.timeSelectValue}>{reminderTime}</Text>
                    <Ionicons name="time-outline" size={18} color="#c084fc" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

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

            {/* Save */}
            <Button
              onPress={handleSave}
              variant="primary"
              size="lg"
              loading={isSaving}
              style={styles.saveButton}
            >
              {i18n.saveBtn}
            </Button>

            {/* Delete — glass danger style */}
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
              activeOpacity={0.80}
            >
              <Text style={styles.deleteButtonText}>🗑  {i18n.deleteHabitTitle}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.add,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  closeBtnGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold,
    color: 'rgba(255,255,255,0.90)',
  },
  scrollContent: {
    padding: LAYOUT.spacing.md,
    gap: LAYOUT.spacing.md,
    paddingBottom: 48,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
  },
  typeBadgeEmoji: {
    fontSize: 20,
  },
  typeBadgeText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
  },
  section: {
    gap: LAYOUT.spacing.sm,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: FONTS.weight.semibold,
    color: 'rgba(255,255,255,0.32)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  iconPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.25)',
    borderRadius: 20,
    padding: 12,
    paddingRight: 20,
  },
  iconPreviewBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(168,85,247,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  iconPreviewContent: {
    flex: 1,
    gap: 2,
  },
  iconPreviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  iconPreviewSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },

  iconPreviewLabel: {
    flex: 1,
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.45)',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginTop: 8,
  },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  iconOptionActive: {
    backgroundColor: 'rgba(168,85,247,0.35)',
    borderColor: '#c084fc',
    borderWidth: 1.5,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  iconOptionEmoji: {
    fontSize: 22,
  },
  saveButton: {
    marginTop: LAYOUT.spacing.sm,
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
  deleteButton: {
    paddingVertical: 16,
    borderRadius: LAYOUT.radius.xl,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.30)',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
    color: '#F87171',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: LAYOUT.spacing.md,
  },
  notFoundText: {
    fontSize: FONTS.size.lg,
    color: 'rgba(255,255,255,0.55)',
  },
  backBtnWrapper: {
    borderRadius: LAYOUT.radius.lg,
    overflow: 'hidden',
  },
  backBtnGrad: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: LAYOUT.radius.lg,
  },
  backBtnText: {
    color: COLORS.neutral[0],
    fontWeight: FONTS.weight.semibold,
  },
  // Reminder Styles
  reminderCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 12,
    gap: 12,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderText: {
    flex: 1,
    fontSize: FONTS.size.md,
    color: 'rgba(255,255,255,0.8)',
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
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  timeSelectLabel: {
    flex: 1,
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  timeSelectValue: {
    fontSize: FONTS.size.md,
    fontWeight: '700',
    color: '#fff',
  },
});

function TimePickerModal({ visible, title, time, onConfirm, onClose }: { 
  visible: boolean; title: string; time: string; onConfirm: (t: string) => void; onClose: () => void 
}) {
  const i18n = useTranslation();
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
            <TouchableOpacity onPress={onClose} style={tpStyles.btn}><Text style={tpStyles.btnText}>{i18n.cancel}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)} style={[tpStyles.btn, tpStyles.confirmBtn]}>
              <Text style={tpStyles.confirmBtnText}>{i18n.confirm}</Text>
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
