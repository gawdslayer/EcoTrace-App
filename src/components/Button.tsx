import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontSize, fontWeight, componentStyles, shadows } from '../utils/theme';
import { isIOS } from '../utils/platform';

import type { ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const handlePress = async () => {
    if (disabled) return;
    
    // Add haptic feedback
    try {
      if (variant === 'primary') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      // Haptics not supported on this device
      console.log('Haptics not supported:', error);
    }
    
    onPress();
  };

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={isIOS ? 0.6 : 0.8} // iOS prefers lower opacity
    >
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: componentStyles.button.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: componentStyles.button.height,
    ...shadows.sm, // Add platform-specific shadow
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  // Sizes
  small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 80,
  },
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 120,
  },
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minWidth: 160,
  },
  
  // Disabled state
  disabled: {
    backgroundColor: colors.gray300,
    borderColor: colors.gray300,
  },
  
  // Text styles
  text: {
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.white,
    fontSize: fontSize.base,
  },
  secondaryText: {
    color: colors.white,
    fontSize: fontSize.base,
  },
  outlineText: {
    color: colors.primary,
    fontSize: fontSize.base,
  },
  
  // Size-specific text
  smallText: {
    fontSize: fontSize.sm,
  },
  mediumText: {
    fontSize: fontSize.base,
  },
  largeText: {
    fontSize: fontSize.lg,
  },
  
  disabledText: {
    color: colors.gray500,
  },
});