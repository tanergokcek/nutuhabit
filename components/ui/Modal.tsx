import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  scrollable?: boolean;
}

export function Modal({ visible, onClose, title, children, scrollable = false }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        pointerEvents="box-none"
      >
        <View style={styles.sheet}>
          {/* Blur background */}
          <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFillObject} />
          {/* Glass overlay */}
          <View style={styles.overlay} />
          {/* Specular top edge */}
          <View style={styles.specular} />

          {/* Handle indicator */}
          <View style={styles.handle} />

          {/* Header */}
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <LinearGradient
                  colors={['rgba(168,85,247,0.35)', 'rgba(109,40,217,0.25)']}
                  style={styles.closeButtonGrad}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Content */}
          {scrollable ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={styles.content}>{children}</View>
          )}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,4,18,0.65)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 32,
    maxHeight: '85%',
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#14003C',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.30,
    shadowRadius: 32,
    elevation: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  specular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    zIndex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  title: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold,
    color: 'rgba(255,255,255,0.90)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeButtonGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.80)',
    fontWeight: FONTS.weight.bold,
  },
  content: {
    padding: LAYOUT.spacing.md,
  },
  scrollContent: {
    padding: LAYOUT.spacing.md,
  },
});
