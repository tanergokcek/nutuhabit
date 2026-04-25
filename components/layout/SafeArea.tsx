import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/colors';

interface SafeAreaProps {
  children: React.ReactNode;
  style?: ViewStyle;
  statusBarStyle?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function SafeArea({
  children,
  style,
  statusBarStyle = 'light',
  backgroundColor = 'transparent',
  edges = ['top', 'left', 'right'],
}: SafeAreaProps) {
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }, style]}
      edges={edges}
    >
      <StatusBar
        style={statusBarStyle}
        backgroundColor="transparent"
        translucent
      />
      {children}
    </SafeAreaView>
  );
}

export function PurpleSafeArea({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.container, style]}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.deep,
  },
});
