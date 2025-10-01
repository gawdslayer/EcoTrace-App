import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '../utils/theme';

import type { ViewStyle } from 'react-native';

interface HabitProgressTrackerProps {
  habitName: string;
  streak: number;
  totalCompletions: number;
  pointsEarned: number;
  lastCompleted?: string;
  style?: ViewStyle;
}

export default function HabitProgressTracker({
  habitName,
  streak,
  totalCompletions,
  pointsEarned,
  lastCompleted,
  style,
}: HabitProgressTrackerProps) {
  const getStreakIcon = (streak: number): string => {
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    if (streak >= 1) return '✨';
    return '💫';
  };

  const formatLastCompleted = (dateString?: string): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.habitName} numberOfLines={1}>
          {habitName}
        </Text>
        <View style={styles.streakContainer}>
          <Text style={styles.streakIcon}>{getStreakIcon(streak)}</Text>
          <Text style={styles.streakText}>{streak} day streak</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.statValue}>{totalCompletions}</Text>
          <Text style={styles.statLabel}>completed</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="trophy" size={16} color={colors.primary} />
          <Text style={styles.statValue}>{pointsEarned}</Text>
          <Text style={styles.statLabel}>points</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color={colors.textLight} />
          <Text style={styles.statValue} numberOfLines={1}>
            {formatLastCompleted(lastCompleted)}
          </Text>
          <Text style={styles.statLabel}>last done</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  habitName: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  streakIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  streakText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
    marginRight: 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.gray200,
    marginHorizontal: spacing.sm,
  },
});