import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, fontSize, fontWeight, shadows } from '../utils/theme';

import type { Habit } from '../types/models';
import type { ViewStyle } from 'react-native';

interface HabitCardProps {
  habit: Habit;
  isTracked: boolean;
  onToggleTrack: (habitId: number) => void;
  onComplete?: (habitId: number) => void;
  showCompleteButton?: boolean;
  style?: ViewStyle;
}

export default function HabitCard({
  habit,
  isTracked,
  onToggleTrack,
  onComplete,
  showCompleteButton = false,
  style,
}: HabitCardProps) {
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Waste Reduction':
        return '#10b981'; // Green
      case 'Transportation':
        return '#3b82f6'; // Blue
      case 'Energy Saving':
        return '#f59e0b'; // Yellow/Orange
      case 'Food':
        return '#8b5cf6'; // Purple
      default:
        return colors.primary;
    }
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'Waste Reduction':
        return 'trash-outline';
      case 'Transportation':
        return 'car-outline';
      case 'Energy Saving':
        return 'flash-outline';
      case 'Food':
        return 'restaurant-outline';
      default:
        return 'leaf-outline';
    }
  };

  const categoryColor = getCategoryColor(habit.category);
  const categoryIcon = getCategoryIcon(habit.category);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.categorySection}>
            <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
              <Ionicons name={categoryIcon} size={20} color={categoryColor} />
            </View>
            <View style={styles.habitInfo}>
              <Text style={styles.habitName} numberOfLines={1}>
                {habit.name}
              </Text>
              <Text style={styles.category} numberOfLines={1}>
                {habit.category}
              </Text>
            </View>
          </View>
          
          <View style={styles.impactSection}>
            <Text style={styles.impactPoints}>+{habit.impact}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {habit.description}
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.trackButton,
              isTracked ? styles.trackButtonActive : styles.trackButtonInactive
            ]}
            onPress={() => onToggleTrack(habit.id)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isTracked ? 'checkmark-circle' : 'add-circle-outline'} 
              size={18} 
              color={isTracked ? colors.white : colors.primary} 
            />
            <Text style={[
              styles.trackButtonText,
              isTracked ? styles.trackButtonTextActive : styles.trackButtonTextInactive
            ]}>
              {isTracked ? 'Tracking' : 'Track Habit'}
            </Text>
          </TouchableOpacity>

          {showCompleteButton && isTracked && onComplete && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => onComplete(habit.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="trophy-outline" size={16} color={colors.success} />
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
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
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray100,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  categorySection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: fontWeight.medium,
  },
  impactSection: {
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  impactPoints: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  pointsLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontWeight: fontWeight.medium,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  trackButtonActive: {
    backgroundColor: colors.primary,
  },
  trackButtonInactive: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  trackButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  trackButtonTextActive: {
    color: colors.white,
  },
  trackButtonTextInactive: {
    color: colors.primary,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.success + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  completeButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.success,
    marginLeft: spacing.xs,
  },
});