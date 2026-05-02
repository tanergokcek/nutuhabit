import React from 'react';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HabitIconProps {
  icon: string;
  size?: number;
  color?: string;
}

/**
 * Renders either an Ionicons icon (if icon string is an Ionicons name like "fitness-outline")
 * or a Text emoji (for backward compatibility with legacy emoji icons).
 */
export function HabitIcon({ icon, size = 22, color = '#fff' }: HabitIconProps) {
  if (/^[a-z0-9-]+$/.test(icon)) {
    return <Ionicons name={icon as any} size={size} color={color} />;
  }
  return <Text style={{ fontSize: size * 0.88, lineHeight: size * 1.1 }}>{icon}</Text>;
}
