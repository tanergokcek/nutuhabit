import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert, ScrollView, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabitStore } from '@/src/store/useHabitStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useTodoStore } from '@/src/store/useTodoStore';
import { useTranslation } from '@/src/hooks/useTranslation';
import { useLanguageStore } from '@/src/store/useLanguageStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { getAICoachResponse, getAIAnalysis } from '@/src/services/ai';

const getPlans = (i18n: any, lang: string) => ({
  monthly: {
    tr: { price: '99,99', unit: '₺', period: lang === 'tr' ? '/ ay' : '/ mo', label: i18n.monthlyLabel },
    intl: { price: '$2,99', period: lang === 'tr' ? '/ ay' : '/ mo', label: i18n.monthlyLabel },
    badge: null,
  },
  yearly: {
    tr: { price: '999,99', unit: '₺', period: lang === 'tr' ? '/ yıl' : '/ yr', label: i18n.yearlyLabel },
    intl: { price: '$24,99', period: lang === 'tr' ? '/ yıl' : '/ yr', label: i18n.yearlyLabel },
    badge: i18n.aiCoachFreeMonths,
  },
});

export default function AICoachScreen() {
  const router = useRouter();
  const i18n = useTranslation();
  const langCode = useLanguageStore((s) => s.language);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isPremium, setIsPremium] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ id: string; text: string; sender: 'user' | 'ai' }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const { habits, logs } = useHabitStore();
  const { todos } = useTodoStore();
  const { user } = useAuthStore();

  const PLANS = getPlans(i18n, langCode);
  const current = PLANS[plan];

  const FEATURES = [
    { icon: 'chatbubble-ellipses', text: i18n.aiCoachFeature1 },
    { icon: 'stats-chart', text: i18n.aiCoachFeature2 },
    { icon: 'notifications', text: i18n.aiCoachFeature3 },
    { icon: 'add-circle', text: i18n.aiCoachFeature4 },
  ];

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    const userMsg = { id: Date.now().toString(), text: userText, sender: 'user' as const };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Gemini AI Yanıtı
    const aiReply = await getAICoachResponse(userText, {
      habits,
      logs,
      todos,
      language: langCode,
      userName: user?.displayName
    });

    const aiMsg = { id: (Date.now() + 1).toString(), text: aiReply, sender: 'ai' as const };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handlePayment = () => {
    Alert.alert(
      i18n.aiCoachPaymentSuccess,
      i18n.aiCoachPaymentSuccessMsg,
      [{ text: i18n.confirm, onPress: () => setIsPremium(true) }]
    );
  };

  const runAnalysis = async () => {
    if (logs.length === 0) {
      Alert.alert(i18n.aiCoachDataMissing, i18n.aiCoachDataMissingMsg);
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);

    // Gemini AI Analizi
    const result = await getAIAnalysis({
      habits,
      logs,
      language: langCode
    });

    if (result) {
      setAnalysis(result);
    } else {
      Alert.alert("Hata", "Analiz şu an yapılamıyor.");
    }
    setAnalyzing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0e0428', '#180840', '#0d1448', '#050d20']}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(109,40,217,0.55)', 'transparent']}
        style={[StyleSheet.absoluteFillObject, styles.orb1]}
      />
      <LinearGradient
        colors={['rgba(192,60,250,0.30)', 'transparent']}
        style={[StyleSheet.absoluteFillObject, styles.orb2]}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{i18n.aiCoachTitle}</Text>
          <View style={{ width: 24 }} />
        </View>

        {!isPremium ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inner}>
              {/* Logo */}
              <Image 
                source={require('@/assets/brand/favicon.png')} 
                style={{ width: 80, height: 80, marginBottom: 20 }}
                resizeMode="contain"
              />

              {/* Title */}
              <Text style={styles.title}>{i18n.aiCoachPro}</Text>
              <Text style={styles.subtitle}>{i18n.aiCoachUnlock}</Text>

              {/* Feature list */}
              <View style={styles.featureCard}>
                {FEATURES.map((f, i) => (
                  <View key={i} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureRowBorder]}>
                    <View style={styles.featureIconWrap}>
                      <Ionicons name={f.icon as any} size={20} color="#a855f7" />
                    </View>
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>
              {/* Plan toggle */}
              <View style={styles.toggleRow}>
                {(['monthly', 'yearly'] as const).map((p) => {
                  const isActive = plan === p;
                  const label = p === 'monthly' ? i18n.monthlyLabel : i18n.yearlyLabel;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.toggleBtn, isActive && styles.toggleBtnActive]}
                      onPress={() => setPlan(p)}
                      activeOpacity={0.8}
                    >
                      {isActive && (
                        <LinearGradient
                          colors={['#9333ea', '#7c3aed']}
                          style={StyleSheet.absoluteFillObject}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        />
                      )}
                      <Text style={[styles.toggleText, isActive && styles.toggleTextActive]}>
                        {p === 'monthly' ? i18n.monthly : i18n.yearly}
                      </Text>
                      {p === 'yearly' && (
                        <View style={styles.saveBadge}>
                          <Text style={styles.saveBadgeText}>{PLANS.yearly.badge}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Price block */}
              <View style={styles.priceBlock}>
                <View style={styles.priceRow}>
                  <View style={styles.regionTag}>
                    <Text style={styles.regionFlag}>🇹🇷</Text>
                    <Text style={styles.regionLabel}>{i18n.turkeyLabel}</Text>
                  </View>
                  <Text style={styles.priceMain}>
                    {current.tr.price}
                    <Text style={styles.priceUnit}> {current.tr.unit}</Text>
                    <Text style={styles.pricePeriod}> {current.tr.period}</Text>
                  </Text>
                </View>

                <View style={styles.priceDivider} />

                <View style={styles.priceRow}>
                  <View style={styles.regionTag}>
                    <Text style={styles.regionFlag}>🌍</Text>
                    <Text style={styles.regionLabel}>{i18n.internationalLabel}</Text>
                  </View>
                  <Text style={styles.priceMain}>
                    {current.intl.price}
                    <Text style={styles.pricePeriod}> {current.intl.period}</Text>
                  </Text>
                </View>
              </View>

              {/* CTA */}
              <TouchableOpacity
                style={styles.ctaBtn}
                activeOpacity={0.85}
                onPress={handlePayment}
              >
                <LinearGradient
                  colors={['#9333ea', '#7c3aed']}
                  style={styles.ctaGrad}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.ctaText}>{i18n.aiCoachPremiumBtn} →</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dismissBtn}
                activeOpacity={0.75}
                onPress={() => router.back()}
              >
                <Text style={styles.dismissText}>{i18n.aiCoachNotNow}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          /* ── Premium AI Coach View ───────────────────── */
          <KeyboardAvoidingView 
            style={styles.premiumContainer} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView contentContainerStyle={styles.premiumContent} showsVerticalScrollIndicator={false}>
              <View style={styles.aiHeader}>
                <View style={styles.aiAvatar}>
                  <LinearGradient colors={['#7c3aed', '#ec4899']} style={StyleSheet.absoluteFillObject} />
                  <Ionicons name="sparkles" size={32} color="#fff" />
                </View>
                <Text style={styles.aiTitle}>{i18n.menuAICoach}</Text>
                <Text style={styles.aiSub}>{i18n.aiCoachSubtitle}</Text>
              </View>

              {/* Analiz Kartı (Eğer varsa) */}
              {analysis && (
                <View style={styles.analysisCard}>
                  <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
                  <View style={styles.analysisHeader}>
                    <Ionicons name="bulb-outline" size={20} color="#fbbf24" />
                    <Text style={styles.analysisHeaderText}>{i18n.aiCoachAnalysisTitle}</Text>
                  </View>
                  <Text style={styles.analysisText}>{analysis}</Text>
                </View>
              )}

              {/* Sohbet Geçmişi */}
              <View style={styles.chatSection}>
                {messages.map((m) => (
                  <View key={m.id} style={[styles.msgBubble, m.sender === 'user' ? styles.msgUser : styles.msgAI]}>
                    <Text style={styles.msgText}>{m.text}</Text>
                  </View>
                ))}
                {isTyping && (
                  <View style={[styles.msgBubble, styles.msgAI]}>
                    <Text style={[styles.msgText, { opacity: 0.5 }]}>{i18n.aiCoachTyping}</Text>
                  </View>
                )}
              </View>

              {!analysis && messages.length === 0 && (
                <View style={styles.startCard}>
                  <Text style={styles.startText}>
                    {i18n.aiCoachStartHint}
                  </Text>
                  <TouchableOpacity 
                    style={styles.analyzeBtn} 
                    onPress={runAnalysis}
                    disabled={analyzing}
                  >
                    <LinearGradient
                      colors={['#7c3aed', '#9333ea']}
                      style={styles.analyzeGrad}
                    >
                      {analyzing ? (
                        <Text style={styles.analyzeBtnText}>{i18n.aiCoachAnalyzing}</Text>
                      ) : (
                        <>
                          <Ionicons name="analytics" size={20} color="#fff" />
                          <Text style={styles.analyzeBtnText}>{i18n.aiCoachAnalyzeBtn}</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {/* Chat Input */}
            <View style={styles.inputArea}>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder={i18n.aiCoachChatPlaceholder}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                />
                <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                  <LinearGradient colors={['#7c3aed', '#9333ea']} style={styles.sendBtnGrad}>
                    <Ionicons name="send" size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  orb1: { top: -120, left: -80, width: '90%', height: '55%', borderRadius: 400 },
  orb2: { top: -60, right: -40, width: '60%', height: '45%', borderRadius: 400 },

  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 0,
  },

  star: { fontSize: 62, marginBottom: 14 },

  title: {
    fontSize: 28, fontWeight: '800',
    color: '#fff', letterSpacing: 0.2,
    fontFamily: 'InriaSerif_700Bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14, color: 'rgba(255,255,255,0.50)',
    marginBottom: 22,
  },

  featureCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 14,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  featureIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(139,92,246,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureEmoji: { fontSize: 17 },
  featureText: {
    fontSize: 13, color: 'rgba(255,255,255,0.85)',
    fontWeight: '500', flex: 1,
  },

  // Plan toggle
  toggleRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    overflow: 'hidden',
  },
  toggleBtnActive: {},
  toggleText: {
    fontSize: 13, fontWeight: '700',
    color: 'rgba(255,255,255,0.40)',
  },
  toggleTextActive: { color: '#fff' },
  saveBadge: {
    backgroundColor: 'rgba(251,191,36,0.22)',
    borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.40)',
  },
  saveBadgeText: {
    fontSize: 9, fontWeight: '800',
    color: '#fbbf24', letterSpacing: 0.3,
  },

  // Price block
  priceBlock: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    marginBottom: 18,
    paddingVertical: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  priceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: 14,
  },
  regionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  regionFlag: { fontSize: 18 },
  regionLabel: {
    fontSize: 13, fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
  },
  priceMain: {
    fontSize: 18, fontWeight: '800', color: '#e9d5ff',
  },
  priceUnit: {
    fontSize: 16, fontWeight: '700', color: '#c084fc',
  },
  pricePeriod: {
    fontSize: 12, fontWeight: '500',
    color: 'rgba(255,255,255,0.40)',
  },

  // CTA
  ctaBtn: {
    width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 12,
  },
  ctaGrad: {
    paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: {
    fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.3,
  },

  dismissBtn: {
    width: '100%', paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dismissText: {
    fontSize: 15, fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'InriaSerif_700Bold',
    color: '#fff',
  },
  backBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Premium View
  premiumContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  premiumContent: {
    paddingTop: 30,
    paddingBottom: 50,
  },
  aiHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  aiAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
  },
  aiTitle: {
    fontSize: 24,
    fontFamily: 'InriaSerif_700Bold',
    color: '#fff',
    marginBottom: 8,
  },
  aiSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  startCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  startText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  analyzeBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  analyzeGrad: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  analyzeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  analysisCard: {
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
    overflow: 'hidden',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  analysisHeaderText: {
    fontSize: 16,
    fontFamily: 'InriaSerif_700Bold',
    color: '#fbbf24',
  },
  analysisText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 24,
  },
  reAnalyzeBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  reAnalyzeText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },

  // Chat Section
  chatSection: {
    gap: 12,
    marginBottom: 20,
  },
  msgBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 18,
  },
  msgUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#7c3aed',
    borderBottomRightRadius: 4,
  },
  msgAI: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  msgText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },

  // Input Area
  inputArea: {
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  sendBtnGrad: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
