import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ListRenderItemInfo,
  StatusBar,
} from 'react-native';
import NHLogo from '@/components/NHLogo';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { textStyles, textColors, fontWeights } from '@/constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  id: string;
  emoji: string;
  title: string;
  description: string;
  color: string;
  type: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    emoji: '✅',
    title: 'Yapıldı Modu',
    type: 'DONE',
    description:
      'Basit alışkanlıklarını takip et. Her gün yaptın mı? Yapmadın mı? Mazeretin mi var? Üç durum, tam kontrol.',
    color: COLORS.success,
  },
  {
    id: '2',
    emoji: '⏱',
    title: 'Zaman Modu',
    type: 'TIME',
    description:
      'Süre bazlı alışkanlıklar için yerleşik zamanlayıcı. Kitap okuma, meditasyon, ders çalışma — her saniyen kayıt altında.',
    color: COLORS.primary[400],
  },
  {
    id: '3',
    emoji: '🚫',
    title: 'Kötü Alışkanlık Modu',
    type: 'BAD',
    description:
      'Sosyal medya, ekran süresi gibi kötü alışkanlıklarını günlük limit koyarak kontrol altına al.',
    color: COLORS.danger,
  },
];

interface SlideItemProps {
  item: Slide;
}

function SlideItem({ item }: SlideItemProps) {
  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={[styles.emojiContainer, { backgroundColor: `${item.color}22`, borderColor: `${item.color}44` }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={[styles.typeBadge, { backgroundColor: `${item.color}22`, borderColor: `${item.color}44` }]}>
        <Text style={[styles.typeText, { color: item.color }]}>{item.type}</Text>
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next });
      setActiveIndex(next);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const onScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
    <SlideItem item={item} />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#060412', '#0d0225', '#060412']}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Purple orb */}
      <LinearGradient
        colors={['rgba(139,92,246,0.50)', 'transparent']}
        style={[StyleSheet.absoluteFillObject, { top: -120 }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        pointerEvents="none"
      />
      {/* Pink orb */}
      <LinearGradient
        colors={['rgba(217,70,239,0.30)', 'transparent']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Skip button */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
          <Text style={styles.skipText}>Atla</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoGlow}>
            <NHLogo size={72} withBackground />
          </View>
        </View>

        {/* Slides */}
        <FlatList<Slide>
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.flatList}
        />

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Next/Start button */}
        <View style={styles.bottomArea}>
          <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={styles.nextButtonWrapper}>
            <LinearGradient
              colors={['#9333ea', '#7c3aed', '#6d28d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>
                {activeIndex < SLIDES.length - 1 ? 'Devam Et →' : 'Başla'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.deep,
  },
  safeArea: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: LAYOUT.spacing.md,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: LAYOUT.radius.full,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  skipText: {
    ...textStyles.footnote,
    color: textColors.secondary,
    fontWeight: fontWeights.medium,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: LAYOUT.spacing.xl,
    gap: LAYOUT.spacing.md,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LAYOUT.spacing.md,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 56,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: LAYOUT.radius.full,
    borderWidth: 1,
  },
  typeText: {
    ...textStyles.caption2Medium,
    letterSpacing: 1.5,
  },
  slideTitle: {
    ...textStyles.title1Bold,          // 28pt bold — hero slide heading
    color: textColors.primary,
    textAlign: 'center',
  },
  slideDescription: {
    ...textStyles.callout,             // 16pt — comfortable onboarding read
    color: textColors.secondary,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: LAYOUT.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  activeDot: {
    width: 24,
    backgroundColor: 'rgba(255,255,255,0.90)',
  },
  bottomArea: {
    paddingHorizontal: LAYOUT.spacing.md,
    paddingBottom: LAYOUT.spacing.lg,
  },
  nextButtonWrapper: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  },
  nextButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    ...textStyles.bodyBold,            // 17pt bold — primary CTA
    color: COLORS.neutral[0],
    letterSpacing: -0.43,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 4,
  },
  logoGlow: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50,
    shadowRadius: 16,
    elevation: 10,
  },
});
