import React, { useCallback, useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient as SvgGrad,
  Path,
  Stop,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { textStyles } from '@/constants/typography';

const SW = Dimensions.get('window').width;
const SH = Dimensions.get('window').height;

// ── Animated SVG component ───────────────────────────────────────────────────
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Su yüzeyi ekranın bu oranında durur (0 = üst, 1 = alt)
const WATER_FINAL = 0.50;

// ── Dalga path — UI thread'de çalışır ───────────────────────────────────────
function wavePath(level: number, phase: number, amplitude: number): string {
  'worklet';
  const y = SH * level;
  let d = `M -10 ${y}`;
  const steps = 44;
  for (let i = 0; i <= steps; i++) {
    const x = -10 + ((SW + 20) * i) / steps;
    const wy = y + amplitude * Math.sin((i / steps) * Math.PI * 4 + phase);
    d += ` L ${x} ${wy}`;
  }
  d += ` L ${SW + 10} ${SH + 10} L -10 ${SH + 10} Z`;
  return d;
}

// ── Component ────────────────────────────────────────────────────────────────
interface Props {
  onDone: () => void;
}

export default function IntroOverlay({ onDone }: Props) {
  const screenO   = useSharedValue(0);
  const waveLevel = useSharedValue(1);    // 1 = alt (görünmez), WATER_FINAL = son konum
  const wavePhase = useSharedValue(0);
  const textO     = useSharedValue(0);
  const textY     = useSharedValue(30);
  const subO      = useSharedValue(0);
  const brandO    = useSharedValue(0);
  const exitO     = useSharedValue(1);
  const btnScale  = useSharedValue(1);

  const done = useCallback(() => onDone(), [onDone]);

  // Butona basınca: mevcut animasyonu iptal et, hızlıca fade out yap
  const handleContinue = useCallback(() => {
    cancelAnimation(exitO);
    exitO.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) runOnJS(done)();
    });
  }, []);

  useEffect(() => {
    // 1. Ekran fade in
    screenO.value = withTiming(1, { duration: 420 });

    // 2. Sürekli dalga salınımı
    wavePhase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 1600, easing: Easing.linear }),
      -1,
      false,
    );

    // 3. Su alttan yükselir
    waveLevel.value = withDelay(
      400,
      withTiming(WATER_FINAL, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
    );

    // 4. Başlık
    textO.value = withDelay(2100, withTiming(1, { duration: 500 }));
    textY.value = withDelay(2100, withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
    }));

    // 5. Alt yazı + marka
    subO.value   = withDelay(2750, withTiming(1, { duration: 420 }));
    brandO.value = withDelay(2750, withTiming(1, { duration: 380 }));

    // Auto-exit YOK — sadece buton tetikler
  }, []);

  // ── Animated styles ──────────────────────────────────────────────────────
  const containerStyle = useAnimatedStyle(() => ({ opacity: exitO.value }));
  const innerStyle     = useAnimatedStyle(() => ({ opacity: screenO.value }));
  const blobStyle1     = useAnimatedStyle(() => ({ opacity: screenO.value * 0.28 }));
  const blobStyle2     = useAnimatedStyle(() => ({ opacity: screenO.value * 0.16 }));

  const textStyle  = useAnimatedStyle(() => ({
    opacity: textO.value,
    transform: [{ translateY: textY.value }],
  }));
  const subStyle   = useAnimatedStyle(() => ({ opacity: subO.value }));
  const brandStyle = useAnimatedStyle(() => ({ opacity: brandO.value }));
  const btnStyle   = useAnimatedStyle(() => ({
    opacity: subO.value,
    transform: [{ scale: btnScale.value }],
  }));

  // Su yüzeyi parlaması — su yükseldiğinde belirir
  const surfaceGlowStyle = useAnimatedStyle(() => {
    const pct = Math.min(1, Math.max(0, (1 - waveLevel.value) / (1 - WATER_FINAL)));
    return {
      top: SH * waveLevel.value - 28,
      opacity: pct * 0.55,
    };
  });

  // ── Dalga props (UI thread) ──────────────────────────────────────────────
  const wave1Props = useAnimatedProps(() => ({
    d: wavePath(waveLevel.value, wavePhase.value, 11),
  }));
  const wave2Props = useAnimatedProps(() => ({
    d: wavePath(waveLevel.value - 0.022, wavePhase.value + Math.PI * 0.85, 7),
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>

      {/* ── Arka plan gradyanı ── */}
      <LinearGradient
        colors={['#060412', '#0C061A', '#060412']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      {/* ── Ambient blob'lar ── */}
      <Animated.View style={[styles.blob1, blobStyle1]} />
      <Animated.View style={[styles.blob2, blobStyle2]} />

      {/* ── Tam ekran su SVG (pointer events yok) ── */}
      <Svg
        width={SW}
        height={SH}
        viewBox={`0 0 ${SW} ${SH}`}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          {/* Arka dalga — hafif, şeffaf */}
          <SvgGrad id="igWave1" x1="0" y1="0" x2="0.3" y2="1">
            <Stop offset="0"   stopColor="#C084FC" stopOpacity="0.28" />
            <Stop offset="1"   stopColor="#6D28D9" stopOpacity="0.45" />
          </SvgGrad>
          {/* Ön dalga — yoğun mor */}
          <SvgGrad id="igWave2" x1="0.15" y1="0" x2="0.85" y2="1">
            <Stop offset="0"   stopColor="#9333EA" stopOpacity="0.72" />
            <Stop offset="0.5" stopColor="#7C3AED" stopOpacity="0.80" />
            <Stop offset="1"   stopColor="#4C1D95" stopOpacity="0.92" />
          </SvgGrad>
        </Defs>

        {/* Arka dalga */}
        <AnimatedPath animatedProps={wave1Props} fill="url(#igWave1)" />
        {/* Ön dalga */}
        <AnimatedPath animatedProps={wave2Props} fill="url(#igWave2)" />
      </Svg>

      {/* ── Su yüzeyi parlaması ── */}
      <Animated.View style={[styles.surfaceGlow, surfaceGlowStyle]} pointerEvents="none" />

      {/* ── İçerik (suyun üzerindeki alan) ── */}
      <Animated.View style={[styles.inner, innerStyle]}>

        {/* Logo + marka adı */}
        <Animated.View style={[styles.logoBlock, brandStyle]}>
          <View style={styles.logoShadow}>
            <Image
              source={require('@/assets/brand/favicon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}>NUTUHABIT</Text>
        </Animated.View>

        <Animated.View style={[styles.separator, brandStyle]} />

        {/* Ana başlık */}
        <Animated.View style={[styles.textWrap, textStyle]}>
          <Text style={styles.headline}>Yeni bir sen</Text>
        </Animated.View>

        {/* Alt yazı */}
        <Animated.View style={[styles.subWrap, subStyle]}>
          <Text style={styles.subtitle}>
            Alışkanlıklarını şekillendiriyor,{'\n'}geleceğini inşa ediyorsun.
          </Text>
        </Animated.View>

        {/* İlerleme noktaları */}
        <Animated.View style={[styles.dotsRow, subStyle]}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </Animated.View>

        {/* Devam Et butonu */}
        <Animated.View style={[styles.btnWrap, btnStyle]}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => {
              btnScale.value = withSpring(0.95, { damping: 14, stiffness: 200 });
            }}
            onPressOut={() => {
              btnScale.value = withSpring(1, { damping: 14, stiffness: 200 });
            }}
            onPress={handleContinue}
            style={styles.btn}
          >
            <LinearGradient
              colors={['#9333EA', '#7C3AED', '#5B21B6']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {/* Üst specular yansıma */}
            <View style={styles.btnSpecular} />
            <Text style={styles.btnText}>Devam Et</Text>
          </TouchableOpacity>
        </Animated.View>

      </Animated.View>
    </Animated.View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },

  // Ambient blob'lar
  blob1: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#7C3AED',
    top: SH * 0.03,
    left: -130,
  },
  blob2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#4338CA',
    top: SH * 0.15,
    right: -100,
  },

  // Su yüzeyi ışıma
  surfaceGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 56,
    // Üst kısmı parlak, aşağıya doğru solar
    backgroundColor: 'rgba(167,139,250,0)',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 0,
  },

  // İçerik alanı — tam ekran ortası
  inner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  // Logo + marka
  logoBlock: {
    alignItems: 'center',
    gap: 11,
    marginBottom: 6,
  },
  logoShadow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.60,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  brandName: {
    ...textStyles.footnoteSemibold,                 // 13pt — marka adı (caps spaced)
    letterSpacing: 5,
    color: 'rgba(225,205,255,0.95)',
    fontFamily: 'InriaSerif_700Bold',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  separator: {
    width: 52,
    height: 1,
    backgroundColor: 'rgba(139,92,246,0.28)',
    marginBottom: 28,
  },

  // Başlık
  textWrap: {
    alignItems: 'center',
  },
  headline: {
    ...textStyles.largeTitleBold,                   // 34pt bold — hero başlık
    fontSize: 40,                                   // splash için biraz büyütüldü
    fontFamily: 'InriaSerif_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textAlign: 'center',
    textShadowColor: 'rgba(80,20,180,0.60)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 16,
  },

  // Alt yazı
  subWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  subtitle: {
    ...textStyles.footnote,                         // 13pt — alt yazı (italic font override)
    color: 'rgba(220,200,255,0.90)',
    textAlign: 'center',
    fontFamily: 'InriaSerif_400Regular_Italic',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.50)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },

  // Noktalar
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 22,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(167,139,250,0.25)',
  },
  dotActive: {
    width: 19,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
  },

  // Devam Et butonu
  btnWrap: {
    marginTop: 28,
    alignItems: 'center',
  },
  btn: {
    width: 220,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.42)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  btnSpecular: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  btnText: {
    ...textStyles.subheadSemibold,                  // 15pt semibold — CTA butonu
    fontFamily: 'InriaSerif_700Bold',
    color: '#FFFFFF',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.30)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
