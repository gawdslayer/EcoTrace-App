import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../utils/theme';
import { platformSelect } from '../utils/platform';

import type { ViewStyle } from 'react-native';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
  safeArea?: boolean;
  keyboardAvoiding?: boolean;
}

export default function ScreenContainer({
  children,
  style,
  padding = true,
  safeArea = true,
  keyboardAvoiding = true,
}: ScreenContainerProps) {
  const Container = safeArea ? SafeAreaView : View;

  const containerStyle = [
    styles.container,
    padding && styles.padding,
    style,
  ];

  const content = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {children}
    </KeyboardAvoidingView>
  ) : (
    children
  );

  return (
    <Container style={containerStyle}>
      {content}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: platformSelect({
      ios: spacing.lg,
      android: spacing.md,
      default: spacing.md,
    }),
    paddingTop: platformSelect({
      ios: spacing.md,
      android: spacing.lg,
      default: spacing.md,
    }),
  },
});