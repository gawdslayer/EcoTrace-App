import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

import { colors, spacing, borderRadius, fontSize, componentStyles, shadows } from '../utils/theme';
import { platformSelect } from '../utils/platform';

import type { TextInputProps, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function Input({ 
  label, 
  error, 
  containerStyle, 
  style,
  ...props 
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.gray400}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: platformSelect({
      ios: 1,
      android: 0, // Material Design uses underline or filled style
      default: 1,
    }),
    borderColor: colors.gray300,
    borderRadius: componentStyles.input.borderRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: platformSelect({
      ios: spacing.md,
      android: spacing.lg, // Material Design needs more padding
      default: spacing.md,
    }),
    fontSize: fontSize.base,
    backgroundColor: platformSelect({
      ios: colors.white,
      android: colors.gray50, // Material Design filled style
      default: colors.white,
    }),
    color: colors.textDark,
    minHeight: componentStyles.input.height,
    ...platformSelect({
      ios: {},
      android: shadows.sm, // Add elevation on Android
      default: {},
    }),
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
});