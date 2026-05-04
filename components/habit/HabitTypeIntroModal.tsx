import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HabitType } from '@/src/types/habit';

const { width: SCREEN_W } = Dimensions.get('window');

interface HabitTypeIntroModalProps {
  visible: boolean;
  type: HabitType;
  onClose: () => void;
}

/* ─── Content per habit type ─── */
const INTRO_CONTENT: Record<HabitType, {
  title: string;
  badge: string;
  description: string;
  howItWorks: string[];
  examples: { icon: string; label: string; detail: string }[];
  tip: string;
  mainIcon: string;
  accentColor: string;
  gradientColors: [string, string, string];
  orbColors: [string, string];
  buttonLabel: string;
}> = {
  done: {
    title: 'Yapıldı / Yapılmadı',
    badge: '✓  CHECK',
    description:
      'Her gün küçük bir "✓" işareti, büyük dönüşümlerin başlangıcıdır. Yaptığın işi onayla, seriyi kır.',
    howItWorks: [
      'Alışkanlığını ekle ve sıklığını belirle',
      'Her gün tamamladığında "Yaptım" olarak işaretle',
      'Serini koru, istatistiklerini takip et',
    ],
    examples: [
      { icon: 'book-outline', label: 'Kitap Oku', detail: 'Her gün en az 10 sayfa' },
      { icon: 'water-outline', label: '2L Su İç', detail: 'Günlük su hedefini tamamla' },
      { icon: 'medkit-outline', label: 'Vitamin Al', detail: 'Sabah kahvaltıdan sonra' },
    ],
    tip: '💡 Küçük başla. Günde 1 sayfa bile seni dünkünden daha iyi yapar.',
    mainIcon: 'checkmark-done-outline',
    accentColor: '#c084fc',
    gradientColors: ['#1a0545', '#0f0330', '#060215'],
    orbColors: ['rgba(124,58,237,0.45)', 'rgba(168,85,247,0.30)'],
    buttonLabel: 'Anladım, Başlayalım',
  },
  time: {
    title: 'Süre Bazlı',
    badge: '⏱  DURATION',
    description:
      'Dakikalarını takip et, hedefini koy. Ne kadar zaman harcadığını görerek odaklanmayı öğren.',
    howItWorks: [
      'Alışkanlığını ve hedef süreyi belirle',
      'Her gün harcadığın süreyi kaydet',
      'Haftalık / günlük hedeflerine ulaş',
    ],
    examples: [
      { icon: 'fitness-outline', label: 'Spor Yap', detail: '45 dk / gün hedef' },
      { icon: 'musical-notes-outline', label: 'Enstrüman Çal', detail: '30 dk günlük pratik' },
      { icon: 'language-outline', label: 'Dil Öğren', detail: '20 dk / gün çalışma' },
    ],
    tip: '💡 Her gün 15 dakika bile olsa süreklilik, yetenekten üstündür.',
    mainIcon: 'timer-outline',
    accentColor: '#60a5fa',
    gradientColors: ['#05102a', '#081540', '#030a1e'],
    orbColors: ['rgba(59,130,246,0.40)', 'rgba(99,102,241,0.25)'],
    buttonLabel: 'Anladım, Başlayalım',
  },
  bad: {
    title: 'Kötü Alışkanlık',
    badge: '🛡  LIMIT',
    description:
      'Bırakmak istediğin alışkanlıklara sınır koy. Her "hayır" dediğinde güçlenirsin.',
    howItWorks: [
      'Bırakmak / azaltmak istediğin davranışı ekle',
      'Günlük, haftalık veya aylık limit belirle',
      'Limitini aştığında kendini fark et, izle',
    ],
    examples: [
      { icon: 'phone-portrait-outline', label: 'Sosyal Medya', detail: 'Günde max 2 kez açma' },
      { icon: 'fast-food-outline', label: 'Abur Cubur', detail: 'Haftada max 3 kez' },
      { icon: 'cafe-outline', label: 'Aşırı Kafein', detail: 'Günde max 2 fincan' },
    ],
    tip: '💡 Tamamen bırakmak zor ama azaltmak da büyük bir başarıdır.',
    mainIcon: 'shield-checkmark-outline',
    accentColor: '#f87171',
    gradientColors: ['#200a0a', '#2d0f0f', '#150505'],
    orbColors: ['rgba(239,68,68,0.35)', 'rgba(220,38,38,0.20)'],
    buttonLabel: 'Anladım, Başlayalım',
  },
};

/* ─── Component ─── */
export function HabitTypeIntroModal({ visible, type, onClose }: HabitTypeIntroModalProps) {
  const content = INTRO_CONTENT[type];
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.88);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!content) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.overlay, { opacity: opacityAnim }]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

        <Animated.View style={[s.cardWrap, { transform: [{ scale: scaleAnim }] }]}>
          {/* ── Full-screen-ish background gradient ── */}
          <LinearGradient
            colors={content.gradientColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
          />

          {/* Orb 1 */}
          <LinearGradient
            colors={[content.orbColors[0], 'transparent']}
            style={[StyleSheet.absoluteFillObject, { top: -60, left: -40, width: '80%', height: '55%', borderRadius: 300 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
          />
          {/* Orb 2 */}
          <LinearGradient
            colors={[content.orbColors[1], 'transparent']}
            style={[StyleSheet.absoluteFillObject, { top: -30, right: -30, width: '60%', height: '45%', borderRadius: 300, alignSelf: 'flex-end' }]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            pointerEvents="none"
          />

          {/* Specular highlight */}
          <View style={s.specular} />

          {/* Border glow */}
          <View style={[s.borderGlow, { borderColor: `${content.accentColor}22` }]} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
            bounces={false}
          >
            {/* ── Hero icon ── */}
            <View style={s.heroArea}>
              <View style={[s.iconOuter, { shadowColor: content.accentColor }]}>
                <LinearGradient
                  colors={[`${content.accentColor}55`, `${content.accentColor}18`]}
                  style={s.iconGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={content.mainIcon as any} size={44} color={content.accentColor} />
                </LinearGradient>
              </View>

              {/* Badge pill */}
              <View style={[s.badgePill, { borderColor: `${content.accentColor}35` }]}>
                <Text style={[s.badgeText, { color: content.accentColor }]}>{content.badge}</Text>
              </View>
            </View>

            {/* ── Title ── */}
            <Text style={s.title}>{content.title}</Text>
            <Text style={s.description}>{content.description}</Text>

            {/* ── How it works ── */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={s.sectionLine} />
                <Text style={s.sectionLabel}>Nasıl Çalışır?</Text>
                <View style={s.sectionLine} />
              </View>

              {content.howItWorks.map((step, i) => (
                <View key={i} style={s.stepRow}>
                  <View style={[s.stepBadge, { backgroundColor: `${content.accentColor}22` }]}>
                    <Text style={[s.stepNumber, { color: content.accentColor }]}>{i + 1}</Text>
                  </View>
                  <Text style={s.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {/* ── Examples ── */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={s.sectionLine} />
                <Text style={s.sectionLabel}>Örnek Alışkanlıklar</Text>
                <View style={s.sectionLine} />
              </View>

              {content.examples.map((ex, i) => (
                <View key={i} style={s.exampleCard}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                  <View style={[s.exampleIcon, { backgroundColor: `${content.accentColor}18` }]}>
                    <Ionicons name={ex.icon as any} size={20} color={content.accentColor} />
                  </View>
                  <View style={s.exampleTextArea}>
                    <Text style={s.exampleLabel}>{ex.label}</Text>
                    <Text style={s.exampleDetail}>{ex.detail}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ── Tip ── */}
            <View style={s.tipBox}>
              <Text style={s.tipText}>{content.tip}</Text>
            </View>

            {/* ── CTA ── */}
            <TouchableOpacity style={s.ctaWrap} onPress={onClose} activeOpacity={0.88}>
              <LinearGradient
                colors={[content.accentColor, `${content.accentColor}cc`]}
                style={s.ctaGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={s.ctaSpecular} />
                <Text style={s.ctaText}>{content.buttonLabel}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/* ─── Styles ─── */
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 16,
  },

  cardWrap: {
    width: '100%',
    maxHeight: '92%',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },

  specular: {
    position: 'absolute',
    top: 0,
    left: 28,
    right: 28,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 10,
  },

  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
    pointerEvents: 'none' as any,
    zIndex: 5,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
  },

  /* ── Hero ── */
  heroArea: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 14,
  },
  iconOuter: {
    width: 96,
    height: 96,
    borderRadius: 32,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
  },

  /* ── Title ── */
  title: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'InriaSerif_700Bold',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 28,
    paddingHorizontal: 4,
  },

  /* ── Sections ── */
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'InriaSerif_700Bold',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  /* ── Steps ── */
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  stepBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'InriaSerif_700Bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 20,
  },

  /* ── Examples ── */
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  exampleIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleTextArea: {
    flex: 1,
    gap: 2,
  },
  exampleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
    fontFamily: 'InriaSerif_700Bold',
  },
  exampleDetail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.38)',
  },

  /* ── Tip ── */
  tipBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    marginBottom: 28,
  },
  tipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.50)',
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  /* ── CTA ── */
  ctaWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius: 20,
    elevation: 12,
  },
  ctaGrad: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSpecular: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'InriaSerif_700Bold',
    letterSpacing: 0.3,
  },
});
