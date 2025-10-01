import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, shadows, componentStyles } from '../utils/theme';
import { platformSelect } from '../utils/platform';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: boolean;
}

export default function Card({ 
  children, 
  style, 
  shadow = true 
}: CardProps) {
  const cardStyle = [
    styles.base,
    { padding: componentStyles.card.padding },
    shadow && shadows.md,
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: componentStyles.card.borderRadius,
    borderWidth: platformSelect({
      ios: 0, // iOS cards typically don't have borders, rely on shadows
      android: 1,
      default: 1,
    }),
    borderColor: platformSelect({
      ios: 'transparent',
      android: colors.gray200,
      default: colors.gray200,
    }),
  },
});