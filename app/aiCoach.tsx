import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const FEATURES = [
  { emoji: '🤖', text: 'AI Coach — Kişisel alışkanlık danışmanı' },
  { emoji: '📊', text: 'Gelişmiş istatistikler ve analizler' },
  { emoji: '🔔', text: 'Sınırsız hatırlatıcı' },
  { emoji: '☁️', text: 'iCloud senkronizasyonu' },
];

const PLANS = {
  monthly: {
    tr: { price: '99,99', unit: '₺', period: '/ ay', label: 'Aylık' },
    intl: { price: '$2,99', period: '/ mo', label: 'Monthly' },
    badge: null,
  },
  yearly: {
    tr: { price: '999,99', unit: '₺', period: '/ yıl', label: 'Yıllık' },
    intl: { price: '$24,99', period: '/ yr', label: 'Yearly' },
    badge: '2 ay ücretsiz',
  },
};

export default function AICoachScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');

  const current = PLANS[plan];

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
        <View style={styles.inner}>
          {/* Star */}
          <Text style={styles.star}>⭐</Text>

          {/* Title */}
          <Text style={styles.title}>NutuHabit Pro</Text>
          <Text style={styles.subtitle}>Tüm özellikleri açın</Text>

          {/* Feature list */}
          <View style={styles.featureCard}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureRowBorder]}>
                <View style={styles.featureIconWrap}>
                  <Text style={styles.featureEmoji}>{f.emoji}</Text>
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Plan toggle */}
          <View style={styles.toggleRow}>
            {(['monthly', 'yearly'] as const).map((p) => {
              const isActive = plan === p;
              const label = p === 'monthly' ? 'Aylık' : 'Yıllık';
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
                    {label}
                  </Text>
                  {p === 'yearly' && (
                    <View style={styles.saveBadge}>
                      <Text style={styles.saveBadgeText}>2 ay ücretsiz</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Price block */}
          <View style={styles.priceBlock}>
            {/* Turkey */}
            <View style={styles.priceRow}>
              <View style={styles.regionTag}>
                <Text style={styles.regionFlag}>🇹🇷</Text>
                <Text style={styles.regionLabel}>Türkiye</Text>
              </View>
              <Text style={styles.priceMain}>
                {current.tr.price}
                <Text style={styles.priceUnit}> {current.tr.unit}</Text>
                <Text style={styles.pricePeriod}> {current.tr.period}</Text>
              </Text>
            </View>

            <View style={styles.priceDivider} />

            {/* International */}
            <View style={styles.priceRow}>
              <View style={styles.regionTag}>
                <Text style={styles.regionFlag}>🌍</Text>
                <Text style={styles.regionLabel}>International</Text>
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
            onPress={() => Alert.alert('Premium', 'Yakında aktif olacak!')}
          >
            <LinearGradient
              colors={['#9333ea', '#7c3aed']}
              style={styles.ctaGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaText}>Premium&apos;a Geç →</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Dismiss */}
          <TouchableOpacity
            style={styles.dismissBtn}
            activeOpacity={0.75}
            onPress={() => router.back()}
          >
            <Text style={styles.dismissText}>Şimdi değil</Text>
          </TouchableOpacity>
        </View>
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
});
