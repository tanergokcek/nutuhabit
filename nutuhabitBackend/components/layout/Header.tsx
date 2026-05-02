import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { textStyles } from '@/constants/typography';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  subtitle?: string;
}

export function Header({ title, showBack = false, rightAction, subtitle }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.primary[600]} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        {rightAction ?? <View style={styles.backPlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 0 : LAYOUT.spacing.sm,
    paddingBottom: LAYOUT.spacing.sm,
    backgroundColor: COLORS.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    height: LAYOUT.header.height,
  },
  left: {
    width: 44,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 44,
    alignItems: 'flex-end',
  },
  title: {
    ...textStyles.headline,     // 17pt semibold — matches iOS NavigationBar title
    color: COLORS.neutral[900],
  },
  subtitle: {
    ...textStyles.caption2,     // 11pt — compact secondary line
    color: COLORS.neutral[500],
    marginTop: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 36,
    height: 36,
  },
});
