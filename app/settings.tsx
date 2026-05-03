import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useHabitStore } from '@/src/store/useHabitStore';
import { useLanguageStore } from '@/src/store/useLanguageStore';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useTimerStore } from '@/src/store/useTimerStore';
import { useTodoStore } from '@/src/store/useTodoStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { resetUserData } from '@/src/services/habits';
import { resetAllTodos } from '@/src/services/todos';
import { resetAllNotes } from '@/src/services/notes';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView, StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RowToggle {
  type: 'toggle';
  id: string;
  emoji: string;
  iconBg: string;
  title: string;
  subtitle: string;
}
interface RowArrow {
  type: 'arrow';
  id: string;
  emoji: string;
  iconBg: string;
  title: string;
  subtitle: string;
  danger?: boolean;
}
type SettingRow = RowToggle | RowArrow;

interface Section { label: string; rows: SettingRow[] }

export default function SettingsScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const i18n = useTranslation();
  const { theme, toggleTheme, resetTheme } = useThemeStore();
  const { language, toggleLanguage, resetLanguage } = useLanguageStore();
  const { user, isGuest, signOut } = useAuthStore();
  const { resetHabits } = useHabitStore();
  const { resetTodos } = useTodoStore();
  const { resetTimerStore } = useTimerStore();

  const displayName = user?.displayName ?? i18n.userDefault;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const SECTIONS: Section[] = [
    {
      label: i18n.sectionAppearance,
      rows: [
        { type: 'toggle', id: 'darkMode', emoji: '🌙', iconBg: '#1e1b4b', title: i18n.darkMode, subtitle: i18n.darkModeSubtitle },
        { type: 'toggle', id: 'notifs', emoji: '🔔', iconBg: '#78350f', title: i18n.notifications, subtitle: i18n.notificationsSubtitle },
        { type: 'arrow', id: 'lang', emoji: '🌍', iconBg: '#1e3a5f', title: i18n.language, subtitle: i18n.languageCurrent },
      ],
    },
    {
      label: i18n.sectionApp,
      rows: [
        { type: 'arrow', id: 'reset', emoji: '🗑️', iconBg: '#2d0a0a', title: i18n.resetData, subtitle: i18n.resetDataSubtitle, danger: true },
      ],
    },
    {
      label: i18n.sectionAbout,
      rows: [
        { type: 'arrow', id: 'about', emoji: '📱', iconBg: '#1e1b4b', title: i18n.aboutApp, subtitle: i18n.aboutVersion },
        { type: 'arrow', id: 'rate', emoji: '⭐', iconBg: '#78350f', title: i18n.rateUs, subtitle: i18n.rateSubtitle },
      ],
    },
  ];

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    notifs: true,
    weeklyReport: true,
  });

  const toggle = (id: string) => {
    if (id === 'darkMode') {
      toggleTheme();
    } else {
      setToggles(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const getToggleValue = (id: string): boolean => {
    if (id === 'darkMode') return theme === 'dark';
    return toggles[id] ?? false;
  };

  const handleArrow = (id: string, title: string) => {
    if (id === 'reset') {
      Alert.alert(
        i18n.resetDataConfirmTitle,
        i18n.resetDataConfirmMsg,
        [
          { text: i18n.cancel, style: 'cancel' },
          {
            text: i18n.resetDataBtn,
            style: 'destructive',
            onPress: async () => {
              const { user } = useAuthStore.getState();
              if (user?.id) {
                // Firebase Reset
                await resetUserData(user.id);
                await resetAllTodos(user.id);
                await resetAllNotes(user.id);
              }
              
              // Local Store Reset
              useHabitStore.getState().resetHabits();
              useTodoStore.getState().resetTodos();
              useTimerStore.getState().resetTimerStore();
              
              await AsyncStorage.clear();
              Alert.alert(i18n.resetDone);
            }
          },
        ]
      );
    } else if (id === 'lang') {
      toggleLanguage();
    } else {
      Alert.alert(title, i18n.comingSoonMsg);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.screenBg }]}>
      <StatusBar barStyle={t.statusBar} />
      <LinearGradient
        colors={t.gradBg as any}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={t.orb1 as any}
        style={[StyleSheet.absoluteFillObject, styles.orb]}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <View style={[styles.backCircle, { backgroundColor: t.rowBg, borderColor: t.rowBorder, borderWidth: 1 }]}>
              <Ionicons name="chevron-back" size={18} color={t.t1} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: t.t1 }]}>{i18n.settingsTitle}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile card */}
          {isGuest ? (
            /* ── Misafir profil ─────────────────────────── */
            <View style={styles.profileSection}>
              <View style={styles.avatarWrap}>
                <LinearGradient
                  colors={['#374151', '#1f2937']}
                  style={styles.avatar}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="person-outline" size={30} color="rgba(255,255,255,0.55)" />
                </LinearGradient>
              </View>
              <Text style={[styles.profileName, { color: t.t1 }]}>{i18n.guestUser}</Text>
              <Text style={styles.guestNote}>{i18n.guestSubtitle}</Text>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => signOut()}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#9333ea', '#7c3aed', '#6d28d9']}
                  style={styles.loginBtnGrad}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="log-in-outline" size={18} color="#fff" />
                  <Text style={styles.loginBtnText}>{i18n.loginRegister}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Giriş yapmış profil ───────────────────── */
            <View style={styles.profileSection}>
              <View style={styles.avatarWrap}>
                <LinearGradient
                  colors={['#ec4899', '#a855f7']}
                  style={styles.avatar}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarLetter}>{avatarLetter}</Text>
                </LinearGradient>
              </View>
              <Text style={[styles.profileName, { color: t.t1 }]}>{displayName}</Text>
              <TouchableOpacity onPress={() => Alert.alert('Premium', i18n.comingSoonMsg)}>
                <Text style={styles.profileLink}>{i18n.freeMember}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sections */}
          {SECTIONS.map(section => (
            <View key={section.label} style={styles.section}>
              <Text style={[styles.sectionLabel, { color: t.t3 }]}>{section.label}</Text>
              <View style={[styles.sectionCard, { backgroundColor: t.panelBg, borderColor: t.panelBorder }]}>
                {section.rows.map((row, i) => (
                  <View key={row.id}>
                    {row.type === 'toggle' ? (
                      <View style={styles.settingRow}>
                        <View style={[styles.iconBox, { backgroundColor: row.iconBg }]}>
                          <Text style={styles.rowEmoji}>{row.emoji}</Text>
                        </View>
                        <View style={styles.rowInfo}>
                          <Text style={[styles.rowTitle, { color: t.t1 }]}>{row.title}</Text>
                          <Text style={[styles.rowSub, { color: t.t3 }]}>{row.subtitle}</Text>
                        </View>
                        <Switch
                          value={getToggleValue(row.id)}
                          onValueChange={() => toggle(row.id)}
                          trackColor={{ false: t.rowBg, true: '#7c3aed' }}
                          thumbColor="#fff"
                          ios_backgroundColor={t.rowBg}
                        />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => handleArrow(row.id, row.title)}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.iconBox, { backgroundColor: row.iconBg }]}>
                          <Text style={styles.rowEmoji}>{row.emoji}</Text>
                        </View>
                        <View style={styles.rowInfo}>
                          <Text style={[styles.rowTitle, { color: t.t1 }, row.danger && styles.rowTitleDanger]}>
                            {row.title}
                          </Text>
                          <Text style={[styles.rowSub, { color: t.t3 }]}>
                            {row.id === 'lang' ? (language === 'tr' ? '🇹🇷  Türkçe' : '🇬🇧  English') : row.subtitle}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={t.t3} />
                      </TouchableOpacity>
                    )}
                    {i < section.rows.length - 1 && <View style={[styles.rowDivider, { backgroundColor: t.divider }]} />}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Logout Button (only for logged-in users) */}

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => {
              Alert.alert(
                i18n.signOutTitle,
                i18n.signOutMsg,
                [
                  { text: i18n.cancel, style: 'cancel' },
                  {
                    text: i18n.signOut,
                    style: 'destructive',
                    onPress: async () => {
                      // Merkezi signOut fonksiyonu artık her şeyi temizliyor
                      await signOut();
                    }
                  },
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']}
              style={styles.signOutGrad}
            >
              <Ionicons name="log-out-outline" size={20} color="#f87171" />
              <Text style={styles.signOutText}>{i18n.signOut}</Text>
            </LinearGradient>
          </TouchableOpacity>


          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  orb: { top: -80, left: -60, width: '80%', height: '45%', borderRadius: 400 },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
  },
  backBtn: { padding: 4 },
  backCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20, fontWeight: '800', color: '#fff',
    fontFamily: 'InriaSerif_700Bold', letterSpacing: 0.3,
  },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // Profile
  profileSection: {
    alignItems: 'center', paddingVertical: 24, gap: 8,
  },
  avatarWrap: {
    shadowColor: '#a855f7', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50, shadowRadius: 18, elevation: 10,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 30, fontWeight: '800', color: '#fff',
    fontFamily: 'InriaSerif_700Bold',
  },
  profileName: {
    fontSize: 20, fontWeight: '800', color: '#fff',
    fontFamily: 'InriaSerif_700Bold',
  },
  profileLink: {
    fontSize: 13, color: '#a78bfa', fontWeight: '600',
    textDecorationLine: 'underline',
  },
  guestNote: {
    fontSize: 12, color: 'rgba(255,255,255,0.32)',
    textAlign: 'center',
  },
  loginBtn: {
    borderRadius: 14, overflow: 'hidden', marginTop: 6,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.50,
    shadowRadius: 14,
    elevation: 8,
  },
  loginBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    paddingVertical: 12, paddingHorizontal: 28,
  },
  loginBtnText: {
    fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.2,
  },

  // Sections
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.38)', marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 12,
  },
  iconBox: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rowEmoji: { fontSize: 18 },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  rowTitleDanger: { color: '#f87171' },
  rowSub: { fontSize: 12, color: 'rgba(255,255,255,0.38)' },
  rowDivider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.07)',
    marginLeft: 64,
  },

  // Sign Out
  signOutBtn: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    overflow: 'hidden',
  },
  signOutGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f87171',
    letterSpacing: 0.3,
  },
});
