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
import { Alert } from 'react-native';

// Firebase imports
import { auth, db } from '@/src/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuthStore } from '@/src/store/useAuthStore';

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

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser, setLoading: setStoreLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  const strength = getPasswordStrength(password);
  const passwordsMatch = password && passwordConfirm && password === passwordConfirm;

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert('Hata', 'Şifreler eşleşmemektedir.');
      return;
    }

    setLoading(true);
    setStoreLoading(true);
    try {
      // ADIM 1: Firebase Auth ile kullanıcıyı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firebase Auth Profilini Güncelle (displayName set edelim)
      await updateProfile(user, { displayName: name });

      // İsmi split edelim (Ad Soyad -> firstName, lastName)
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const userData = {
        firstName: firstName,
        lastName: lastName,
        fullName: name, // Kolaylık olsun diye tam ismi de tutalım
        email: email,
        createdAt: new Date(),
        habitCount: 0,
        isPremium: false,
        settings: {
          theme: 'system',
          notificationsEnabled: true,
          reminderTime: '09:00',
          weekStartsOn: 1,
          language: 'tr',
        }
      };

      // ADIM 2: Kullanıcı oluştu, şimdi ek bilgileri Firestore'a yazalım
      await setDoc(doc(db, "users", user.uid), userData);

      // ADIM 3: Zustand store'u güncelle (Login yapmış gibi)
      const mappedUser = {
        id: user.uid,
        email: user.email || '',
        displayName: name,
        photoURL: user.photoURL || null,
        isPremium: false,
        createdAt: new Date().toISOString(),
        settings: userData.settings
      };

      setUser(mappedUser as any, true);

      console.log("Kanka kullanıcı hem auth'a hem db'ye eklendi!");
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error("Hata oluştu: ", error.message);
      let errorMsg = 'Kayıt olurken bir hata oluştu.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'Bu e-posta adresi zaten kullanımda.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Şifre çok zayıf, lütfen daha güçlü bir şifre seçiniz.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Geçersiz e-posta adresi.';
      }
      
      Alert.alert('Kayıt Hatası', errorMsg);
    } finally {
      setLoading(false);
      setStoreLoading(false);
    }
  };

  const handleSocial = (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    // TODO: connect auth
    setTimeout(() => {
      setSocialLoading(null);
      router.replace('/(tabs)');
    }, 1200);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#060412', '#100230', '#060412']}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(139,92,246,0.55)', 'transparent']}
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
              <View style={s.headerCenter}>
                <Text style={s.headerTitle}>Hesap Oluştur</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>

            {/* ── Form Card ──────────────────────────────── */}
            <BlurView intensity={24} tint="dark" style={s.card}>
              <View style={s.cardOverlay} />
              <View style={s.cardSpecular} />
              <View style={s.cardContent}>

                <Text style={s.cardSub}>Hadi başlayalım ✦</Text>

                {/* Ad Soyad */}
                <View style={[s.inputRow, focused === 'name' && s.inputFocused]}>
                  <Ionicons
                    name="person-outline" size={18}
                    color={focused === 'name' ? '#a855f7' : 'rgba(255,255,255,0.32)'}
                  />
                  <TextInput
                    style={s.inputField}
                    placeholder="Ad Soyad"
                    placeholderTextColor="rgba(255,255,255,0.28)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                  />
                </View>

                {/* Email */}
                <View style={[s.inputRow, focused === 'email' && s.inputFocused]}>
                  <Ionicons
                    name="mail-outline" size={18}
                    color={focused === 'email' ? '#a855f7' : 'rgba(255,255,255,0.32)'}
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
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                  />
                </View>

                {/* Şifre */}
                <View style={[s.inputRow, focused === 'pw' && s.inputFocused]}>
                  <Ionicons
                    name="lock-closed-outline" size={18}
                    color={focused === 'pw' ? '#a855f7' : 'rgba(255,255,255,0.32)'}
                  />
                  <TextInput
                    style={[s.inputField, { flex: 1 }]}
                    placeholder="Şifre"
                    placeholderTextColor="rgba(255,255,255,0.28)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPw}
                    onFocus={() => setFocused('pw')}
                    onBlur={() => setFocused(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPw(v => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showPw ? 'eye-off-outline' : 'eye-outline'}
                      size={18} color="rgba(255,255,255,0.38)"
                    />
                  </TouchableOpacity>
                </View>

                {/* Şifre Güç Göstergesi */}
                {password.length > 0 && (
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

                {/* Şifre Tekrar */}
                <View style={[
                  s.inputRow,
                  focused === 'pwc' && s.inputFocused,
                  passwordConfirm.length > 0 && !passwordsMatch && s.inputError,
                  passwordsMatch && s.inputSuccess,
                ]}>
                  <Ionicons
                    name="shield-checkmark-outline" size={18}
                    color={
                      passwordsMatch
                        ? '#22c55e'
                        : focused === 'pwc'
                          ? '#a855f7'
                          : 'rgba(255,255,255,0.32)'
                    }
                  />
                  <TextInput
                    style={[s.inputField, { flex: 1 }]}
                    placeholder="Şifreyi tekrar gir"
                    placeholderTextColor="rgba(255,255,255,0.28)"
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    secureTextEntry={!showPwConfirm}
                    onFocus={() => setFocused('pwc')}
                    onBlur={() => setFocused(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPwConfirm(v => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showPwConfirm ? 'eye-off-outline' : 'eye-outline'}
                      size={18} color="rgba(255,255,255,0.38)"
                    />
                  </TouchableOpacity>
                </View>

                {passwordConfirm.length > 0 && !passwordsMatch && (
                  <Text style={s.errorText}>Şifreler eşleşmiyor</Text>
                )}

                {/* CTA */}
                <TouchableOpacity
                  style={[s.ctaWrap, { marginTop: 6 }]}
                  onPress={handleRegister}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#9333ea', '#7c3aed', '#6d28d9']}
                    style={s.ctaGrad}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    {loading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={s.ctaText}>Hesap Oluştur</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={s.divider}>
                  <View style={s.divLine} />
                  <Text style={s.divText}>veya</Text>
                  <View style={s.divLine} />
                </View>

                {/* Google */}
                <TouchableOpacity
                  style={s.socialBtn}
                  onPress={() => handleSocial('google')}
                  activeOpacity={0.85}
                  disabled={!!socialLoading}
                >
                  {socialLoading === 'google'
                    ? <ActivityIndicator color="#1f2937" />
                    : <>
                        <Text style={s.googleG}>G</Text>
                        <Text style={s.socialBtnText}>Google ile kayıt ol</Text>
                      </>
                  }
                </TouchableOpacity>

                {/* Apple */}
                <TouchableOpacity
                  style={[s.socialBtn, s.appleBtn]}
                  onPress={() => handleSocial('apple')}
                  activeOpacity={0.85}
                  disabled={!!socialLoading}
                >
                  {socialLoading === 'apple'
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <Ionicons name="logo-apple" size={20} color="#fff" />
                        <Text style={[s.socialBtnText, { color: '#fff' }]}>Apple ile kayıt ol</Text>
                      </>
                  }
                </TouchableOpacity>
              </View>
            </BlurView>

            {/* Login link */}
            <View style={s.loginRow}>
              <Text style={s.loginPrompt}>Zaten hesabın var mı? </Text>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75}>
                <Text style={s.loginLink}>Giriş Yap →</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.disclaimer}>
              Kayıt olarak Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmiş olursunuz.
            </Text>
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
  headerCenter: {
    flex: 1, alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: 'rgba(255,255,255,0.90)',
    fontFamily: 'InriaSerif_700Bold',
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
  cardSub: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.40)',
    marginBottom: 4,
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
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold,
    minWidth: 60,
    textAlign: 'right',
  },

  // CTA
  ctaWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
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

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  divLine: {
    flex: 1, height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  divText: {
    fontSize: FONTS.size.xs,
    color: 'rgba(255,255,255,0.32)',
  },

  // Social
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  appleBtn: {
    backgroundColor: 'rgba(0,0,0,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  googleG: {
    fontSize: 17,
    fontWeight: FONTS.weight.bold,
    color: '#4285F4',
    width: 22,
    textAlign: 'center',
  },
  socialBtnText: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
    color: '#1f2937',
  },

  // Login row
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.sm,
  },
  loginPrompt: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.40)',
  },
  loginLink: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: '#c084fc',
  },

  disclaimer: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.20)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: LAYOUT.spacing.md,
    marginTop: 4,
  },
});
