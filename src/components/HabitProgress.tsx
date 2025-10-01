import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import { Habit } from '../types/models';
import { colors, spacing, fontSize, fontWeight } from '../utils/theme';

import type { ViewStyle } from 'react-native';

interface HabitProgressProps {
  habit: Habit;
  isTracked: boolean;
  style?: ViewStyle;
}

export default function HabitProgress({
  habit,
  isTracked,
  style,
}: HabitProgressProps) {
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Waste Reduction':
        return '#10b981'; // Green
      case 'Transportation':
        return '#3b82f6'; // Blue
      case 'Energy Saving':
        return '#f59e0b'; // Yellow
      case 'Food':
        return '#8b5cf6'; // Purple
      default:
        return colors.primary;
    }
  };

  const categoryColor = getCategoryColor(habit.category);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
          <View style={styles.habitInfo}>
            <Text style={styles.habitName} numberOfLines={1}>
              {habit.name}
            </Text>
            <Text style={styles.category} numberOfLines={1}>
              {habit.category}
            </Text>
          </View>
          <View style={styles.impactContainer}>
            <Text style={styles.impactPoints}>+{habit.impact}</Text>
            <Text style={styles.pointsLabel}>pts</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {habit.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isTracked ? colors.success + '20' : colors.gray200 }
          ]}>
            <Text style={[
              styles.statusText,
              { color: isTracked ? colors.success : colors.textLight }
            ]}>
              {isTracked ? 'Tracking' : 'Available'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  habitInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  habitName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  impactContainer: {
    alignItems: 'center',
    minWidth: 50,
  },
  impactPoints: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  pointsLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});