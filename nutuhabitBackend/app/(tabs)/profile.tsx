import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useHabitStore } from '@/src/store/useHabitStore';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';
import { useAppTheme, ThemeTokens } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';

interface SettingItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
  iconBgColors?: [string, string];
  t: ThemeTokens;
}

function SettingItem({ icon, label, value, onPress, danger = false, rightElement, iconBgColors, t }: SettingItemProps) {
  const gradColors: [string, string] = danger
    ? ['rgba(239,68,68,0.25)', 'rgba(220,38,38,0.15)']
    : (iconBgColors ?? ['rgba(168,85,247,0.35)', 'rgba(109,40,217,0.25)']);

  return (
    <TouchableOpacity onPress={onPress} style={styles.settingItem} activeOpacity={0.7}>
      <LinearGradient colors={gradColors} style={styles.settingIconContainer}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? '#F87171' : 'rgba(255,255,255,0.85)'}
        />
      </LinearGradient>
      <Text style={[styles.settingLabel, { color: t.t1 }, danger && { color: '#F87171' }]}>{label}</Text>
      <View style={styles.settingRight}>
        {value ? <Text style={[styles.settingValue, { color: t.t3 }]}>{value}</Text> : null}
        {rightElement}
        {!rightElement ? (
          <Ionicons name="chevron-forward" size={14} color={t.t3} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const i18n = useTranslation();
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { habits } = useHabitStore();

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const activeHabitsCount = habits.filter((h) => !h.isArchived).length;

  const handleSignOut = () => {
    Alert.alert(i18n.signOutTitle, i18n.signOutMsg, [
      { text: i18n.cancel, style: 'cancel' },
      {
        text: i18n.signOut,
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
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
        style={[StyleSheet.absoluteFillObject, { top: -100 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 0.5 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={t.orb2 as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.4, y: 0.5 }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: t.t1 }]}>{i18n.profileTitle}</Text>
          </View>

          {/* Profile card */}
          <BlurView intensity={20} tint={t.blurTint} style={[styles.profileCard, { borderColor: t.cardBorder }]}>
            <View style={[styles.profileOverlay, { backgroundColor: t.glassOverlay }]} />
            <View style={[styles.profileSpecular, { backgroundColor: t.specular }]} />
            <View style={styles.profileCardInner}>
              <LinearGradient
                colors={['#9333ea', '#db2777', '#f97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>

              <View style={styles.profileInfo}>
                <Text style={[styles.displayName, { color: t.t1 }]}>{user?.displayName ?? i18n.userDefault}</Text>
                <Text style={[styles.email, { color: t.t3 }]}>{user?.email}</Text>

                <View style={styles.badgeRow}>
                  {user?.isPremium ? (
                    <View style={[styles.badge, { backgroundColor: 'rgba(168,85,247,0.25)', borderColor: 'rgba(192,132,252,0.40)' }]}>
                      <Text style={[styles.badgeText, { color: '#c084fc' }]}>⭐ Premium</Text>
                    </View>
                  ) : (
                    <View style={[styles.badge, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}>
                      <Text style={[styles.badgeText, { color: t.t2 }]}>{i18n.free}</Text>
                    </View>
                  )}
                  <View style={[styles.badge, { backgroundColor: 'rgba(59,130,246,0.18)', borderColor: 'rgba(96,165,250,0.35)' }]}>
                    <Text style={[styles.badgeText, { color: '#60a5fa' }]}>{i18n.habitsActive(activeHabitsCount)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </BlurView>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}>
              <Text style={[styles.statValue, { color: COLORS.primary[300] }]}>{activeHabitsCount}</Text>
              <Text style={[styles.statLabel, { color: t.t3 }]}>{i18n.habitsLabel}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}>
              <Text style={[styles.statValue, { color: COLORS.primary[300] }]}>
                {habits.filter((h) => h.type === 'time').length}
              </Text>
              <Text style={[styles.statLabel, { color: t.t3 }]}>{i18n.timeTracking}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: t.rowBg, borderColor: t.rowBorder }]}>
              <Text style={[styles.statValue, { color: COLORS.primary[300] }]}>
                {habits.filter((h) => h.type === 'bad').length}
              </Text>
              <Text style={[styles.statLabel, { color: t.t3 }]}>{i18n.badHabitLabel}</Text>
            </View>
          </View>

          {/* Hesap section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.t3 }]}>{i18n.account}</Text>
            <BlurView intensity={16} tint={t.blurTint} style={[styles.settingsCard, { borderColor: t.panelBorder }]}>
              <View style={[styles.settingsOverlay, { backgroundColor: t.panelBg }]} />
              <SettingItem
                icon="notifications-outline"
                label={i18n.notifications}
                value={i18n.notificationsOn}
                onPress={() => Alert.alert(i18n.comingSoon, i18n.comingSoonMsg)}
                t={t}
              />
              <View style={[styles.settingDivider, { backgroundColor: t.divider }]} />
              <SettingItem
                icon="person-outline"
                label={i18n.editProfile}
                onPress={() => Alert.alert(i18n.comingSoon, i18n.comingSoonMsg)}
                t={t}
              />
            </BlurView>
          </View>

          {/* Görünüm section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.t3 }]}>{i18n.appearance}</Text>
            <BlurView intensity={16} tint={t.blurTint} style={[styles.settingsCard, { borderColor: t.panelBorder }]}>
              <View style={[styles.settingsOverlay, { backgroundColor: t.panelBg }]} />
              <SettingItem
                icon={theme === 'dark' ? 'moon' : 'sunny-outline'}
                label={i18n.themeLabel}
                value={theme === 'dark' ? i18n.themeDark : i18n.themeLight}
                onPress={toggleTheme}
                iconBgColors={['rgba(99,102,241,0.35)', 'rgba(79,70,229,0.25)']}
                t={t}
              />
            </BlurView>
          </View>

          {/* Uygulama section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.t3 }]}>{i18n.appSection}</Text>
            <BlurView intensity={16} tint={t.blurTint} style={[styles.settingsCard, { borderColor: t.panelBorder }]}>
              <View style={[styles.settingsOverlay, { backgroundColor: t.panelBg }]} />
              <SettingItem
                icon="information-circle-outline"
                label={i18n.aboutLabel}
                value="v1.0.0"
                onPress={() => Alert.alert('NutuHabit', `${i18n.aboutVersion}\n\n© 2025 NutuHabit`)}
                iconBgColors={['rgba(20,184,166,0.30)', 'rgba(13,148,136,0.20)']}
                t={t}
              />
            </BlurView>
          </View>

          {/* Premium CTA */}
          {!user?.isPremium ? (
            <View style={styles.premiumCardWrapper}>
              <BlurView intensity={18} tint={t.blurTint} style={styles.premiumCard}>
                <View style={styles.premiumOverlay} />
                <LinearGradient
                  colors={['#9333ea', '#7c3aed', '#6d28d9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.premiumGlowBorder}
                />
                <View style={styles.premiumContent}>
                  <Text style={styles.premiumTitle}>{i18n.upgradeToPremium}</Text>
                  <Text style={styles.premiumSubtitle}>{i18n.premiumSubtitle}</Text>

                  <View style={styles.premiumFeatures}>
                    {[
                      i18n.unlimitedHabits,
                      i18n.detailedStats,
                      i18n.customThemes,
                      i18n.smartReminders,
                      i18n.cloudBackup,
                    ].map((f) => (
                      <Text key={f} style={styles.premiumFeatureItem}>{f}</Text>
                    ))}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => Alert.alert(i18n.comingSoon, i18n.comingSoonMsg)}
                    style={styles.premiumBtnWrapper}
                  >
                    <LinearGradient
                      colors={['#9333ea', '#7c3aed', '#6d28d9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.premiumButton}
                    >
                      <Text style={styles.premiumButtonText}>{i18n.upgradeNow}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          ) : null}

          {/* Sign out */}
          <View style={styles.section}>
            <BlurView intensity={16} tint={t.blurTint} style={[styles.settingsCard, { borderColor: t.panelBorder }]}>
              <View style={[styles.settingsOverlay, { backgroundColor: t.panelBg }]} />
              <SettingItem
                icon="log-out-outline"
                label={i18n.signOut}
                onPress={handleSignOut}
                danger
                t={t}
              />
            </BlurView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.spacing.md,
    gap: LAYOUT.spacing.md,
    paddingBottom: 100,
  },
  header: {
    paddingTop: LAYOUT.spacing.sm,
  },
  title: {
    fontSize: FONTS.size['2xl'],
    fontWeight: FONTS.weight.bold,
  },
  profileCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
  },
  profileOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  profileSpecular: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    borderRadius: 1,
  },
  profileCardInner: {
    padding: LAYOUT.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.50,
    shadowRadius: 14,
    elevation: 8,
  },
  avatarText: {
    fontSize: FONTS.size['2xl'],
    fontWeight: FONTS.weight.bold,
    color: COLORS.neutral[0],
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  displayName: {
    fontSize: 22,
    fontWeight: FONTS.weight.bold,
  },
  email: {
    fontSize: FONTS.size.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: FONTS.weight.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
  },
  statLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: FONTS.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: 4,
  },
  settingsCard: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
  },
  settingsOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: 14,
    gap: LAYOUT.spacing.md,
  },
  settingIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: FONTS.size.sm,
  },
  settingDivider: {
    height: 1,
    marginLeft: 70,
  },
  premiumCardWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.45)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  premiumCard: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  premiumOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(88,28,135,0.25)',
  },
  premiumGlowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  premiumContent: {
    padding: LAYOUT.spacing.lg,
    gap: LAYOUT.spacing.md,
  },
  premiumTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: 'rgba(255,255,255,0.95)',
  },
  premiumSubtitle: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.55)',
    marginTop: -8,
  },
  premiumFeatures: {
    gap: 6,
  },
  premiumFeatureItem: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.75)',
  },
  premiumBtnWrapper: {
    borderRadius: LAYOUT.radius.lg,
    overflow: 'hidden',
    marginTop: 4,
  },
  premiumButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: LAYOUT.radius.lg,
  },
  premiumButtonText: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    color: COLORS.neutral[0],
  },
});
