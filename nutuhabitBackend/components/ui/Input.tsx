import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string | null;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  style?: ViewStyle;
  autoFocus?: boolean;
  editable?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  multiline = false,
  keyboardType = 'default',
  maxLength,
  style,
  autoFocus = false,
  editable = true,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.28)"
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoFocus={autoFocus}
        editable={editable}
        style={[
          styles.input,
          multiline && styles.multiline,
          isFocused && styles.focused,
          error ? styles.errorBorder : null,
          !editable && styles.disabled,
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: LAYOUT.spacing.sm,
  },
  label: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: 'rgba(255,255,255,0.60)',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: LAYOUT.radius.md,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: 12,
    fontSize: FONTS.size.md,
    color: 'rgba(255,255,255,0.95)',
  },
  multiline: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  focused: {
    borderColor: COLORS.primary[400],
    backgroundColor: 'rgba(168,85,247,0.12)',
  },
  errorBorder: {
    borderColor: COLORS.danger,
  },
  errorText: {
    fontSize: FONTS.size.xs,
    color: '#F87171',
    marginTop: 4,
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
