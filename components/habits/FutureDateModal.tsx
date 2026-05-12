import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '@/components/ui/Modal';
import { useTranslation } from '@/src/hooks/useTranslation';
import { textStyles } from '@/constants/typography';

interface FutureDateModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FutureDateModal({ visible, onClose }: FutureDateModalProps) {
  const i18n = useTranslation();

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
            style={styles.iconBg}
          >
            <Ionicons name="calendar-outline" size={32} color="#f87171" />
            <View style={styles.warningBadge}>
              <Ionicons name="warning" size={12} color="#fff" />
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.title}>{i18n.futureDateTitle}</Text>
        <Text style={styles.message}>{i18n.futureDateMsg}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>{i18n.confirm}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  warningBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a1a2e',
  },
  title: {
    ...textStyles.title3,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    ...textStyles.body,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...textStyles.calloutSemibold,
    color: '#fff',
  },
});
