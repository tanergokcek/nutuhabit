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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '@/src/store/useAuthStore';
import { textStyles, textColors } from '@/constants/typography';
import { Alert } from 'react-native';

// Firebase imports
import { auth, db } from '@/src/firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Auth Session imports
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth config
const GOOGLE_WEB_CLIENT_ID = "882584952431-jkiu8o1f78gekcpnrj4ducakjccat3p1.apps.googleusercontent.com";
const GOOGLE_IOS_CLIENT_ID = "882584952431-jfjiq4nepnfm37caitc49ibp0khn3gtg.apps.googleusercontent.com";
const GOOGLE_ANDROID_CLIENT_ID = "882584952431-oj6t197smiibp0bgbuej5kgal0jpvf2b.apps.googleusercontent.com";
// iOS client ID'nin ters çevrilmişi — Google OAuth iOS redirect URI olarak bunu kullanıyor
const REVERSED_IOS_CLIENT_ID = "com.googleusercontent.apps.882584952431-jfjiq4nepnfm37caitc49ibp0khn3gtg";

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// ── Proper Google "G" SVG ─────────────────────────────────────────────────────
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.3 22.56 15.48 22.56 12.25z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithEmail, continueAsGuest, setUser, setLoading: setStoreLoading } = useAuthStore();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | null>(null);

  // ── Google Auth Request ──
  // iOS'ta reversed client ID scheme kullanıyoruz — ASWebAuthenticationSession bunu yakalıyor
  const redirectUri = `${REVERSED_IOS_CLIENT_ID}:/oauthredirect`;

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Platform.select({
        ios: GOOGLE_IOS_CLIENT_ID,
        android: GOOGLE_ANDROID_CLIENT_ID,
        default: GOOGLE_WEB_CLIENT_ID,
      }),
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
    },
    googleDiscovery
  );

  React.useEffect(() => {
    if (response?.type === 'success' && response.params.code) {
      // Authorization code'u token ile değiştir
      AuthSession.exchangeCodeAsync(
        {
          clientId: Platform.OS === 'ios' ? GOOGLE_IOS_CLIENT_ID : GOOGLE_WEB_CLIENT_ID,
          code: response.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request?.codeVerifier || '',
          },
        },
        googleDiscovery
      )
        .then((tokenResponse) => {
          if (tokenResponse.idToken) {
            handleGoogleLogin(tokenResponse.idToken);
          } else {
            Alert.alert('Hata', 'Google girişinde id_token alınamadı.');
          }
        })
        .catch((err) => {
          console.error("Token exchange hatası:", err);
          Alert.alert('Hata', 'Google token exchange başarısız.');
        });
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setSocialLoading('google');
    setStoreLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Firestore'dan çek veya oluştur
      let userData = null;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        userData = userDoc.exists() ? userDoc.data() : null;
      } catch (e) {}

      // Token ve Çerez
      const token = await user.getIdToken();
      if (Platform.OS === 'web') {
        document.cookie = `fb-token=${token}; path=/; max-age=604800; SameSite=Strict; Secure`;
      }

      // Store Güncelle
      const mappedUser = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || userData?.fullName || 'Kullanıcı',
        photoURL: user.photoURL || null,
        isPremium: userData?.isPremium || false,
        createdAt: userData?.createdAt?.toDate ? userData.createdAt.toDate().toISOString() : new Date().toISOString(),
        settings: userData?.settings || {
          theme: 'system',
          notificationsEnabled: true,
          reminderTime: '09:00',
          weekStartsOn: 1,
          language: 'tr',
        }
      };
      
      setUser(mappedUser as any, true);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error("Google login error:", error);
      Alert.alert('Giriş Hatası', 'Google ile giriş yaparken bir sorun oluştu.');
    } finally {
      setSocialLoading(null);
      setStoreLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    setStoreLoading(true);
    try {
      // ADIM 1: Firebase Auth ile giriş yap
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ADIM 2: Firestore'dan kullanıcı verilerini çek
      let userData = null;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        userData = userDoc.exists() ? userDoc.data() : null;
      } catch (fsError: any) {
        console.warn("Firestore verisi çekilemedi, muhtemelen çevrimdışısınız:", fsError.message);
        // Firestore hatası olsa bile giriş yapmış sayalım, default verilerle devam ederiz
      }

      // ADIM 3: Token'ı al ve çerez olarak kaydet (Web için)
      const token = await user.getIdToken();
      if (Platform.OS === 'web') {
        // Çerezi 7 gün kalacak şekilde ayarlayalım
        const expires = new Date();
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = `fb-token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
        console.log("Kanka token çerezlere fırlatıldı!");
      }

      // ADIM 4: Zustand store'u güncelle
      const mappedUser = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || userData?.fullName || userData?.firstName || 'Kullanıcı',
        photoURL: user.photoURL || null,
        isPremium: userData?.isPremium || false,
        createdAt: userData?.createdAt?.toDate ? userData.createdAt.toDate().toISOString() : new Date().toISOString(),
        settings: userData?.settings || {
          theme: 'system',
          notificationsEnabled: true,
          reminderTime: '09:00',
          weekStartsOn: 1,
          language: 'tr',
        }
      };
      
      setUser(mappedUser as any, true);
      
      console.log("Giriş başarılı!");
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error("Giriş hatası: ", error.message);
      let errorMsg = 'Giriş yapılamadı.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMsg = 'E-posta veya şifre hatalı.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Geçersiz e-posta adresi.';
      }
      
      Alert.alert('Giriş Hatası', errorMsg);
    } finally {
      setLoading(false);
      setStoreLoading(false);
    }
  };

  const handleSocial = async (provider: 'google') => {
    if (provider === 'google') {
      if (!request) {
        Alert.alert('Hata', 'Google servisi şu an hazır değil.');
        return;
      }
      promptAsync();
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Arka plan */}
      <LinearGradient
        colors={['#07031A', '#0D0626', '#07031A']}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Üst mor halo */}
      <LinearGradient
        colors={['rgba(120,50,240,0.40)', 'transparent']}
        style={[StyleSheet.absoluteFillObject, { bottom: '60%' }]}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
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

            {/* ── Logo ── */}
            <View style={s.logoArea}>
              <View style={s.logoGlow}>
                <Image
                  source={require('@/assets/brand/favicon.png')}
                  style={s.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={s.appName}>NutuHabit</Text>
              <Text style={s.tagline}>Alışkanlıklarını şekillendir</Text>
            </View>

            {/* ── Form ── */}
            <View style={s.formCard}>
              {/* Cam efekti */}
              <LinearGradient
                colors={['rgba(255,255,255,0.055)', 'rgba(255,255,255,0.018)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              />
              <View style={s.formCardSpecular} />

              {/* E-posta */}
              <View style={[s.inputWrap, focused === 'email' && s.inputFocused]}>
                <Ionicons
                  name="mail-outline" size={16}
                  color={focused === 'email' ? '#a855f7' : 'rgba(255,255,255,0.25)'}
                  style={s.inputIcon}
                />
                <TextInput
                  style={s.input}
                  placeholder="E-posta"
                  placeholderTextColor="rgba(255,255,255,0.22)"
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
              <View style={[s.inputWrap, focused === 'password' && s.inputFocused]}>
                <Ionicons
                  name="lock-closed-outline" size={16}
                  color={focused === 'password' ? '#a855f7' : 'rgba(255,255,255,0.25)'}
                  style={s.inputIcon}
                />
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="Şifre"
                  placeholderTextColor="rgba(255,255,255,0.22)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPwd(v => !v)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                    size={16}
                    color="rgba(255,255,255,0.28)"
                  />
                </TouchableOpacity>
              </View>

              {/* Şifremi unuttum */}
              <TouchableOpacity
                style={s.forgotBtn}
                onPress={() => router.push('/(auth)/forgot-password')}
                activeOpacity={0.7}
              >
                <Text style={s.forgotText}>Şifremi unuttum</Text>
              </TouchableOpacity>

              {/* Giriş Yap */}
              <TouchableOpacity
                style={s.ctaBtn}
                onPress={handleLogin}
                activeOpacity={0.88}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#9333ea', '#7c3aed']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                />
                <View style={s.ctaSpecular} />
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.ctaText}>Giriş Yap</Text>
                }
              </TouchableOpacity>
            </View>

            {/* ── Ayraç ── */}
            <View style={s.divider}>
              <View style={s.divLine} />
              <Text style={s.divLabel}>veya</Text>
              <View style={s.divLine} />
            </View>

            {/* ── Sosyal butonlar (dikey, tam genişlik) ── */}
            <View style={s.socialCol}>

              {/* Google */}
              <TouchableOpacity
                style={s.socialBtn}
                onPress={() => handleSocial('google')}
                activeOpacity={0.78}
                disabled={!!socialLoading}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                />
                {socialLoading === 'google'
                  ? <ActivityIndicator color="rgba(255,255,255,0.7)" size="small" />
                  : <>
                      <GoogleIcon size={18} />
                      <Text style={s.socialLabel}>Google ile devam et</Text>
                    </>
                }
              </TouchableOpacity>



            </View>

            {/* ── Alt alan ── */}
            <View style={s.footer}>

              <View style={s.registerRow}>
                <Text style={s.registerPrompt}>Hesabın yok mu? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.75}>
                  <Text style={s.registerLink}>Kayıt Ol</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={s.guestBtn}
                onPress={() => continueAsGuest()}
                activeOpacity={0.7}
              >
                <Text style={s.guestText}>Kayıt olmadan devam et</Text>
                <Ionicons name="chevron-forward" size={11} color="rgba(255,255,255,0.20)" />
              </TouchableOpacity>

              <Text style={s.disclaimer}>
                Devam ederek Kullanım Koşulları ve Gizlilik{'\n'}Politikası'nı kabul etmiş olursunuz.
              </Text>

            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logoArea: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 36,
    gap: 8,
  },
  logoGlow: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.65,
    shadowRadius: 28,
    elevation: 16,
    marginBottom: 4,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'InriaSerif_700Bold',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: -0.3,
  },
  tagline: {
    ...textStyles.footnote,
    color: textColors.tertiary,
    letterSpacing: 0.3,
  },

  // ── Form card ─────────────────────────────────────────────────────────────
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    gap: 12,
    overflow: 'hidden',
  },
  formCardSpecular: {
    position: 'absolute',
    top: 0, left: 24, right: 24, height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: 'rgba(168,85,247,0.50)',
    backgroundColor: 'rgba(124,58,237,0.07)',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    ...textStyles.subhead,
    color: textColors.primary,
    height: 50,
  },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: {
    ...textStyles.footnote,
    color: '#a855f7',
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  ctaBtn: {
    height: 50,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  ctaSpecular: {
    position: 'absolute',
    top: 0, left: 20, right: 20, height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  ctaText: {
    ...textStyles.subheadSemibold,
    fontFamily: 'InriaSerif_700Bold',
    color: '#fff',
    letterSpacing: 0.4,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  divLine: {
    flex: 1, height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  divLabel: {
    ...textStyles.caption1,
    color: textColors.quaternary,
    letterSpacing: 0.5,
  },

  // ── Sosyal butonlar ───────────────────────────────────────────────────────
  socialCol: { gap: 10 },
  socialBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  socialLabel: {
    ...textStyles.subhead,
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 0.1,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    marginTop: 32,
    alignItems: 'center',
    gap: 14,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerPrompt: {
    ...textStyles.callout,
    color: textColors.tertiary,
  },
  registerLink: {
    ...textStyles.calloutSemibold,
    fontFamily: 'InriaSerif_700Bold',
    color: '#c084fc',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  guestText: {
    ...textStyles.footnote,
    color: textColors.tertiary,
  },
  disclaimer: {
    ...textStyles.caption2,
    color: textColors.quaternary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
