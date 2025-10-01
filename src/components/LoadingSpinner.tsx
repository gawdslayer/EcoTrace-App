import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

import { colors, spacing, fontSize } from '../utils/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
}

export default function LoadingSpinner({ 
  size = 'large', 
  color = colors.primary,
  text,
  overlay = false 
}: LoadingSpinnerProps) {
  const containerStyle = [
    styles.container,
    overlay && styles.overlay,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  text: {
    marginTop: spacing.sm,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});