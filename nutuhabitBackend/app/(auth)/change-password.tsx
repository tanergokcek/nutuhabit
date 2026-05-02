import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Çok Zayıf', color: '#ef4444' };
  if (score === 2) return { score, label: 'Zayıf', color: '#f97316' };
  if (score === 3) return { score, label: 'Orta', color: '#eab308' };
  if (score === 4) return { score, label: 'Güçlü', color: '#22c55e' };
  return { score: 5, label: 'Çok Güçlü', color: '#10b981' };
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = getPasswordStrength(newPw);
  const passwordsMatch = newPw && confirmPw && newPw === confirmPw;
  const canSubmit = currentPw && newPw.length >= 6 && passwordsMatch;

  const handleUpdate = () => {
    if (!canSubmit) return;
    setLoading(true);
    // TODO: connect auth
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1400);
  };

  if (done) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#060412', '#100230', '#060412']} style={StyleSheet.absoluteFillObject} />
        <LinearGradient colors={['rgba(34,197,94,0.35)', 'transparent']} style={[StyleSheet.absoluteFillObject, { top: -120 }]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.6 }} pointerEvents="none" />

        <SafeAreaView style={[s.safe, { alignItems: 'center', justifyContent: 'center', padding: LAYOUT.spacing.xl }]} edges={['top', 'bottom']}>
          <View style={s.doneWrap}>
            <LinearGradient colors={['#22c55e', '#16a34a']} style={s.doneIconGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="checkmark" size={44} color="#fff" />
            </LinearGradient>
            <Text style={s.doneTitle}>Şifre Güncellendi!</Text>
            <Text style={s.doneSub}>Yeni şifrenle giriş yapabilirsin.</Text>
            <TouchableOpacity
              style={s.ctaWrap}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#9333ea', '#7c3aed', '#6d28d9']} style={s.ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={s.ctaText}>Tamam</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#060412', '#100230', '#060412']}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(139,92,246,0.50)', 'transparent']}
        style={[StyleSheet.absoluteFillObject, { top: -120 }]}
        start={{ x: 0.4, y: 0 }} end={{ x: 0.6, y: 0.55 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(217,70,239,0.20)', 'transparent']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 1, y: 0.1 }} end={{ x: 0.2, y: 0.55 }}
        pointerEvents="none"
      />

      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Header ─────────────────────────────────── */}
            <View style={s.header}>
              <TouchableOpacity
                style={s.backBtn}
                onPress={() => router.back()}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <LinearGradient
                  colors={['rgba(168,85,247,0.30)', 'rgba(109,40,217,0.20)']}
                  style={s.backBtnGrad}
                >
                  <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.85)" />
                </LinearGradient>
              </TouchableOpacity>
              <View style={s.headerCenter}>
                <Text style={s.headerTitle}>Şifre Değiştir</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>

            {/* ── Lock icon ──────────────────────────────── */}
            <View style={s.iconArea}>
              <BlurView intensity={20} tint="dark" style={s.iconCard}>
                <View style={s.iconCardOverlay} />
                <LinearGradient
                  colors={['rgba(147,51,234,0.35)', 'rgba(109,40,217,0.20)']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                />
                <Ionicons name="key" size={36} color="#c084fc" />
              </BlurView>
              <Text style={s.subtitle}>Güvenli bir şifre seç</Text>
            </View>

            {/* ── Form Card ──────────────────────────────── */}
            <BlurView intensity={24} tint="dark" style={s.card}>
              <View style={s.cardOverlay} />
              <View style={s.cardSpecular} />
              <View style={s.cardContent}>

                {/* Section: Mevcut Şifre */}
                <Text style={s.sectionLabel}>MEVCUT ŞİFRE</Text>

                <View style={[s.inputRow, focused === 'cur' && s.inputFocused]}>
                  <Ionicons
                    name="lock-closed-outline" size={18}
                    color={focused === 'cur' ? '#a855f7' : 'rgba(255,255,255,0.32)'}
                  />
                  <TextInput
                    style={[s.inputField, { flex: 1 }]}
                    placeholder="Mevcut şifren"
                    placeholderTextColor="rgba(255,255,255,0.28)"
                    value={currentPw}
                    onChangeText={setCurrentPw}
                    secureTextEntry={!showCurrent}
                    onFocus={() => setFocused('cur')}
                    onBlur={() => setFocused(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrent(v => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                      size={18} color="rgba(255,255,255,0.38)"
                    />
                  </TouchableOpacity>
                </View>

                <View style={s.sectionDivider} />

                {/* Section: Yeni Şifre */}
                <Text style={s.sectionLabel}>YENİ ŞİFRE</Text>

                <View style={[s.inputRow, focused === 'new' && s.inputFocused]}>
                  <Ionicons
                    name="lock-open-outline" size={18}
                    color={focused === 'new' ? '#a855f7' : 'rgba(255,255,255,0.32)'}
                  />
                  <TextInput
                    style={[s.inputField, { flex: 1 }]}
                    placeholder="Yeni şifre"
                    placeholderTextColor="rgba(255,255,255,0.28)"
                    value={newPw}
                    onChangeText={setNewPw}
                    secureTextEntry={!showNew}
                    onFocus={() => setFocused('new')}
                    onBlur={() => setFocused(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNew(v => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showNew ? 'eye-off-outline' : 'eye-outline'}
                      size={18} color="rgba(255,255,255,0.38)"
                    />
                  </TouchableOpacity>
                </View>

                {/* Şifre güç göstergesi */}
                {newPw.length > 0 && (
                  <View style={s.strengthWrap}>
                    <View style={s.strengthBars}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <View
                          key={i}
                          style={[
                            s.strengthBar,
                            { backgroundColor: i <= strength.score ? strength.color : 'rgba(255,255,255,0.12)' },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[s.strengthLabel, { color: strength.color }]}>
                      {strength.label}
                    </Text>
                  </View>
                )}

                {/* Şifre tekrar */}
                <View style={[
                  s.inputRow,
                  focused === 'conf' && s.inputFocused,
                  confirmPw.length > 0 && !passwordsMatch && s.inputError,
                  passwordsMatch && s.inputSuccess,
                ]}>
                  <Ionicons
                    name="shield-checkmark-outline" size={18}
                    color={passwordsMatch ? '#22c55e' : focused === 'conf' ? '#a855f7' : 'rgba(255,255,255,0.32)'}
                  />
                  <TextInput
                    style={[s.inputField, { flex: 1 }]}
                    placeholder="Yeni şifreyi tekrar gir"
                    placeholderTextColor="rgba(255,255,255,0.28)"
                    value={confirmPw}
                    onChangeText={setConfirmPw}
                    secureTextEntry={!showConfirm}
                    onFocus={() => setFocused('conf')}
                    onBlur={() => setFocused(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(v => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                      size={18} color="rgba(255,255,255,0.38)"
                    />
                  </TouchableOpacity>
                </View>

                {confirmPw.length > 0 && !passwordsMatch && (
                  <Text style={s.errorText}>Şifreler eşleşmiyor</Text>
                )}

                {/* Şifre gereksinimleri */}
                <View style={s.requirementsCard}>
                  {[
                    { text: 'En az 6 karakter', ok: newPw.length >= 6 },
                    { text: 'En az 1 büyük harf', ok: /[A-Z]/.test(newPw) },
                    { text: 'En az 1 rakam', ok: /[0-9]/.test(newPw) },
                  ].map((req) => (
                    <View key={req.text} style={s.reqRow}>
                      <Ionicons
                        name={req.ok ? 'checkmark-circle' : 'ellipse-outline'}
                        size={15}
                        color={req.ok ? '#22c55e' : 'rgba(255,255,255,0.25)'}
                      />
                      <Text style={[s.reqText, req.ok && s.reqTextDone]}>
                        {req.text}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* CTA */}
                <TouchableOpacity
                  style={[s.ctaWrap, { marginTop: 4 }]}
                  onPress={handleUpdate}
                  activeOpacity={0.85}
                  disabled={loading || !canSubmit}
                >
                  <LinearGradient
                    colors={canSubmit ? ['#9333ea', '#7c3aed', '#6d28d9'] : ['rgba(100,60,180,0.40)', 'rgba(80,40,150,0.40)']}
                    style={s.ctaGrad}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    {loading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={s.ctaText}>Şifreyi Güncelle</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.deep },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingBottom: LAYOUT.spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: LAYOUT.spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, overflow: 'hidden',
  },
  backBtnGrad: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: 'rgba(255,255,255,0.90)',
    fontFamily: 'InriaSerif_700Bold',
  },

  // Icon
  iconArea: {
    alignItems: 'center',
    paddingTop: LAYOUT.spacing.md,
    paddingBottom: LAYOUT.spacing.lg,
    gap: 10,
  },
  iconCard: {
    width: 80, height: 80, borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.30)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  iconCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  subtitle: {
    fontSize: FONTS.size.md,
    color: 'rgba(255,255,255,0.40)',
  },

  // Card
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    marginBottom: LAYOUT.spacing.md,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  cardSpecular: {
    position: 'absolute',
    top: 0, left: 20, right: 20, height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 1,
  },
  cardContent: {
    padding: LAYOUT.spacing.lg,
    gap: 12,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
    color: 'rgba(255,255,255,0.30)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },

  // Inputs
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: {
    borderColor: 'rgba(168,85,247,0.65)',
    backgroundColor: 'rgba(168,85,247,0.08)',
  },
  inputError: {
    borderColor: 'rgba(239,68,68,0.60)',
    backgroundColor: 'rgba(239,68,68,0.06)',
  },
  inputSuccess: {
    borderColor: 'rgba(34,197,94,0.60)',
    backgroundColor: 'rgba(34,197,94,0.06)',
  },
  inputField: {
    flex: 1,
    fontSize: FONTS.size.md,
    color: 'rgba(255,255,255,0.90)',
    height: 52,
  },
  errorText: {
    fontSize: FONTS.size.xs,
    color: '#f87171',
    marginTop: -6,
    marginLeft: 4,
  },

  // Strength
  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -4,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1, height: 4, borderRadius: 2,
  },
  strengthLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold,
    minWidth: 60,
    textAlign: 'right',
  },

  // Requirements
  requirementsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    gap: 8,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reqText: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.35)',
  },
  reqTextDone: {
    color: 'rgba(34,197,94,0.80)',
  },

  // CTA
  ctaWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50,
    shadowRadius: 18,
    elevation: 10,
  },
  ctaGrad: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: '#fff',
    letterSpacing: 0.3,
  },

  // Done state
  doneWrap: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  doneIconGrad: {
    width: 100, height: 100, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 8,
  },
  doneTitle: {
    fontSize: FONTS.size['2xl'],
    fontWeight: FONTS.weight.bold,
    color: '#4ade80',
    fontFamily: 'InriaSerif_700Bold',
  },
  doneSub: {
    fontSize: FONTS.size.md,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    marginBottom: 8,
  },
});
