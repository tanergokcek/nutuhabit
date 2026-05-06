import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import IntroOverlay from '@/components/IntroOverlay';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  InriaSerif_300Light,
  InriaSerif_400Regular,
  InriaSerif_400Regular_Italic,
  InriaSerif_700Bold,
  InriaSerif_700Bold_Italic,
} from '@expo-google-fonts/inria-serif';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '@/constants/colors';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { requestNotificationPermissions } from '@/src/services/notifications';


SplashScreen.preventAutoHideAsync();

// ── Uygulama geneli Inria Serif varsayılan fontu ──────────────────────────────
(Text as any).defaultProps = (Text as any).defaultProps ?? {};
(Text as any).defaultProps.style = [
  (Text as any).defaultProps.style,
  { fontFamily: 'InriaSerif_400Regular' },
];

export const unstable_settings = {
  anchor: '(auth)',
};

function AuthRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();
  const [isHydrated, setIsHydrated] = useState(false);

  // Zustand persist hydration kontrolü
  useEffect(() => {
    const checkHydration = async () => {
      // persist.hasHydrated() senkron bir fonksiyondur ama effect içinde güvenli kontrol sağlar
      if (useAuthStore.persist.hasHydrated()) {
        setIsHydrated(true);
      } else {
        // Eğer henüz hydrate olmadıysa bir sonraki tick'te tekrar kontrol et veya onFinishHydration kullan
        const unsub = useAuthStore.persist.onFinishHydration(() => {
          setIsHydrated(true);
        });
        return () => unsub();
      }
    };
    checkHydration();
  }, []);

  useEffect(() => {
    // Navigasyon durumu hazır değilse veya store henüz yüklenmediyse bekle
    if (!navState?.key || !isHydrated) return;

    const inAuth = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuth) {
      // Giriş yapmamış ve auth sayfalarında değilse login'e at
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuth) {
      // Giriş yapmış ve auth sayfalarındaysa (login/register) ana sayfaya at
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, navState?.key, isHydrated]);

  return null;
}

export default function RootLayout() {
  const theme = useThemeStore((s) => s.theme);
  const [showIntro, setShowIntro] = useState(true);
  const [fontsLoaded] = useFonts({
    InriaSerif_300Light,
    InriaSerif_400Regular,
    InriaSerif_400Regular_Italic,
    InriaSerif_700Bold,
    InriaSerif_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      requestNotificationPermissions();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthRedirect />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.bg.deep },
          headerTintColor: COLORS.primary[300],
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.bg.deep },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="habit/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="habit/new" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="habit/edit/[id]" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="calendarPage" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="logHabit" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="aiCoach" options={{ headerShown: false }} />
        <Stack.Screen name="reminder" options={{ headerShown: false }} />
        <Stack.Screen name="notes" options={{ headerShown: false }} />
        <Stack.Screen name="todos" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="dailyRecords" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {showIntro && <IntroOverlay onDone={() => setShowIntro(false)} />}
    </SafeAreaProvider>
  );
}
