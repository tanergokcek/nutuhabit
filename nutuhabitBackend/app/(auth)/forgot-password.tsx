import React, { useState, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const successScale = useRef(new Animated.Value(0.85)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const handleSend = () => {
    if (!email) return;
    setLoading(true);
    // TODO: connect auth
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1400);
  };

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
        colors={['rgba(217,70,239,0.22)', 'transparent']}
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
              <View style={{ width: 36 }} />
            </View>

            {/* ── Icon area ──────────────────────────────── */}
            <View style={s.iconArea}>
              <BlurView intensity={20} tint="dark" style={s.iconCard}>
                <View style={s.iconCardOverlay} />
                <LinearGradient
                  colors={['rgba(147,51,234,0.35)', 'rgba(109,40,217,0.20)']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                />
                <Ionicons name="mail" size={38} color="#c084fc" />
              </BlurView>
              <Text style={s.title}>Şifremi Unuttum</Text>
              <Text style={s.subtitle}>
                E-posta adresini gir,{'\n'}şifre sıfırlama bağlantısı gönderelim.
              </Text>
            </View>

            {/* ── Form OR Success ────────────────────────── */}
            {!sent ? (
              <BlurView intensity={24} tint="dark" style={s.card}>
                <View style={s.cardOverlay} />
                <View style={s.cardSpecular} />
                <View style={s.cardContent}>

                  {/* Email */}
                  <View style={[s.inputRow, focused && s.inputFocused]}>
                    <Ionicons
                      name="mail-outline" size={18}
                      color={focused ? '#a855f7' : 'rgba(255,255,255,0.32)'}
                    />
                    <TextInput
                      style={s.inputField}
                      placeholder="E-posta adresi"
                      placeholderTextColor="rgba(255,255,255,0.28)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                    />
                  </View>

                  {/* CTA */}
                  <TouchableOpacity
                    style={s.ctaWrap}
                    onPress={handleSend}
                    activeOpacity={0.85}
                    disabled={loading || !email}
                  >
                    <LinearGradient
                      colors={email ? ['#9333ea', '#7c3aed', '#6d28d9'] : ['rgba(100,60,180,0.40)', 'rgba(80,40,150,0.40)']}
                      style={s.ctaGrad}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                      {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={s.ctaText}>Sıfırlama Linki Gönder</Text>
                      }
                    </LinearGradient>
                  </TouchableOpacity>

                  <Text style={s.hint}>
                    Spam klasörünü de kontrol etmeyi unutma 📬
                  </Text>
                </View>
              </BlurView>
            ) : (
              /* ── Success State ──────────────────────── */
              <Animated.View style={{ opacity: successOpacity, transform: [{ scale: successScale }] }}>
                <BlurView intensity={24} tint="dark" style={s.card}>
                  <View style={s.cardOverlay} />
                  <View style={s.cardSpecular} />
                  <LinearGradient
                    colors={['rgba(34,197,94,0.12)', 'transparent']}
                    style={StyleSheet.absoluteFillObject}
                    pointerEvents="none"
                  />
                  <View style={s.successContent}>
                    {/* Checkmark */}
                    <View style={s.checkWrap}>
                      <LinearGradient
                        colors={['#22c55e', '#16a34a']}
                        style={s.checkGrad}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      >
                        <Ionicons name="checkmark" size={36} color="#fff" />
                      </LinearGradient>
                    </View>

                    <Text style={s.successTitle}>E-posta Gönderildi!</Text>
                    <Text style={s.successDesc}>
                      <Text style={s.successEmail}>{email}</Text>
                      {' '}adresine şifre sıfırlama bağlantısı gönderildi.
                    </Text>

                    <View style={s.successSteps}>
                      {[
                        { icon: 'mail-open-outline', text: 'Gelen kutunu aç' },
                        { icon: 'link-outline', text: 'Bağlantıya tıkla' },
                        { icon: 'lock-open-outline', text: 'Yeni şifreni belirle' },
                      ].map((step) => (
                        <View key={step.text} style={s.stepRow}>
                          <Ionicons name={step.icon as any} size={16} color="rgba(34,197,94,0.75)" />
                          <Text style={s.stepText}>{step.text}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Back to login */}
                    <TouchableOpacity
                      style={s.backToLoginBtn}
                      onPress={() => router.replace('/(auth)/login')}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#9333ea', '#7c3aed', '#6d28d9']}
                        style={s.ctaGrad}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      >
                        <Text style={s.ctaText}>Giriş Yap'a Dön</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={s.resendBtn}
                      onPress={() => { setSent(false); }}
                      activeOpacity={0.7}
                    >
                      <Text style={s.resendText}>Yeniden gönder</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Animated.View>
            )}
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

  // Icon area
  iconArea: {
    alignItems: 'center',
    paddingTop: LAYOUT.spacing.lg,
    paddingBottom: LAYOUT.spacing.xl,
    gap: 12,
  },
  iconCard: {
    width: 88, height: 88, borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.30)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  iconCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  title: {
    fontSize: FONTS.size['2xl'],
    fontWeight: FONTS.weight.bold,
    color: 'rgba(255,255,255,0.95)',
    fontFamily: 'InriaSerif_700Bold',
  },
  subtitle: {
    fontSize: FONTS.size.md,
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
    lineHeight: 22,
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
    gap: 14,
  },

  // Input
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
  inputField: {
    flex: 1,
    fontSize: FONTS.size.md,
    color: 'rgba(255,255,255,0.90)',
    height: 52,
  },

  hint: {
    fontSize: FONTS.size.xs,
    color: 'rgba(255,255,255,0.30)',
    textAlign: 'center',
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

  // Success
  successContent: {
    padding: LAYOUT.spacing.lg,
    alignItems: 'center',
    gap: 14,
  },
  checkWrap: {
    width: 80, height: 80, borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 4,
  },
  checkGrad: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  successTitle: {
    fontSize: FONTS.size['2xl'],
    fontWeight: FONTS.weight.bold,
    color: '#4ade80',
    fontFamily: 'InriaSerif_700Bold',
  },
  successDesc: {
    fontSize: FONTS.size.md,
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    lineHeight: 22,
  },
  successEmail: {
    color: '#c084fc',
    fontWeight: FONTS.weight.semibold,
  },
  successSteps: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.18)',
    padding: LAYOUT.spacing.md,
    gap: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepText: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.60)',
  },
  backToLoginBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50,
    shadowRadius: 18,
    elevation: 10,
  },
  resendBtn: {
    paddingVertical: 8,
  },
  resendText: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.35)',
  },
});
