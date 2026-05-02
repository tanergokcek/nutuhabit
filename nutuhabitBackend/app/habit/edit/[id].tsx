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
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { HabitType, TimeHabit, BadHabit } from '@/src/types/habit';
import { validateHabitName, validateGoalMinutes, validateLimit } from '@/src/utils/validators';
import { HABIT_ICONS } from '@/constants/templates';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

const TYPE_OPTIONS: { type: HabitType; label: string; emoji: string; color: string }[] = [
  { type: 'done', label: 'Yapıldı', emoji: '✅', color: COLORS.success },
  { type: 'time', label: 'Zaman', emoji: '⏱', color: COLORS.primary[400] },
  { type: 'bad', label: 'Kötü Alışkanlık', emoji: '🚫', color: COLORS.danger },
];

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, updateHabit, deleteHabit } = useHabitStore();

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

  if (!habit) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#13043e', '#1c0a4a']} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>Alışkanlık bulunamadı</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
              <LinearGradient colors={['#9333ea', '#7c3aed']} style={styles.backBtnGrad}>
                <Text style={styles.backBtnText}>Geri Dön</Text>
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
      const updates: Record<string, unknown> = { name: name.trim(), icon };
      if (type === 'time') updates.goalMinutes = parseInt(goalMinutes, 10);
      if (type === 'bad') {
        updates.limitType = limitType;
        if (limitType === 'count') updates.limitCount = parseInt(limitCount, 10);
        else updates.limitMinutes = parseInt(limitMinutes, 10);
      }
      updateHabit(habit.id, updates as Parameters<typeof updateHabit>[1]);
      router.back();
    } catch {
      Alert.alert('Hata', 'Alışkanlık güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Alışkanlığı Sil',
      `"${habit.name}" ve tüm kayıtları silinecek. Bu işlem geri alınamaz.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deleteHabit(habit.id);
            router.dismissAll();
          },
        },
      ]
    );
  };

  const currentType = TYPE_OPTIONS.find((t) => t.type === type);

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
            <Text style={styles.headerTitle}>Alışkanlığı Düzenle</Text>
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
                  {currentType.label} modu (değiştirilemez)
                </Text>
              </View>
            ) : null}

            {/* Name */}
            <Input
              value={name}
              onChangeText={setName}
              label="Alışkanlık Adı"
              placeholder="Alışkanlık adı"
              error={nameError}
              maxLength={50}
            />

            {/* Icon picker */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>İKON</Text>
              <TouchableOpacity
                onPress={() => setShowIconPicker(!showIconPicker)}
                style={styles.iconPreview}
                activeOpacity={0.75}
              >
                <Text style={styles.iconPreviewEmoji}>{icon}</Text>
                <Text style={styles.iconPreviewLabel}>İkonu değiştir</Text>
                <Ionicons
                  name={showIconPicker ? 'chevron-up' : 'chevron-down'}
                  size={16}
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
                      <Text style={styles.iconOptionEmoji}>{emoji}</Text>
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
                label="Hedef Süre (dakika)"
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
                label={limitType === 'count' ? "Limit (kez)" : "Günlük Limit (dakika)"}
                placeholder={limitType === 'count' ? "5" : "60"}
                keyboardType="numeric"
                error={limitError}
                maxLength={4}
              />
            ) : null}

            {/* Save */}
            <Button
              onPress={handleSave}
              variant="primary"
              size="lg"
              loading={isSaving}
              style={styles.saveButton}
            >
              Kaydet
            </Button>

            {/* Delete — glass danger style */}
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
              activeOpacity={0.80}
            >
              <Text style={styles.deleteButtonText}>🗑  Alışkanlığı Sil</Text>
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
    gap: LAYOUT.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: LAYOUT.radius.md,
    padding: 12,
  },
  iconPreviewEmoji: {
    fontSize: 28,
  },
  iconPreviewLabel: {
    flex: 1,
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.45)',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: LAYOUT.spacing.sm,
  },
  iconOption: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconOptionActive: {
    backgroundColor: 'rgba(168,85,247,0.30)',
    borderWidth: 1.5,
    borderColor: 'rgba(192,132,252,0.55)',
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
});
