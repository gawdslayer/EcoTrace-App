import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '../utils/theme';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
}

import type { ViewStyle } from 'react-native';

interface AchievementCardProps {
  achievement: Achievement;
  style?: ViewStyle;
}

export default function AchievementCard({ achievement, style }: AchievementCardProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgressPercentage = (): number => {
    if (!achievement.progress || !achievement.maxProgress) return 0;
    return Math.min((achievement.progress / achievement.maxProgress) * 100, 100);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.card,
        achievement.earned ? styles.earnedCard : styles.lockedCard
      ]}>
        {/* Icon */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: achievement.color + '20' },
          !achievement.earned && styles.lockedIconContainer
        ]}>
          <Ionicons 
            name={achievement.icon} 
            size={24} 
            color={achievement.earned ? achievement.color : colors.gray400} 
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[
            styles.title,
            !achievement.earned && styles.lockedTitle
          ]}>
            {achievement.title}
          </Text>
          
          <Text style={[
            styles.description,
            !achievement.earned && styles.lockedDescription
          ]}>
            {achievement.description}
          </Text>

          {/* Progress Bar (for in-progress achievements) */}
          {!achievement.earned && achievement.progress !== undefined && achievement.maxProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${getProgressPercentage()}%`,
                      backgroundColor: achievement.color 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {achievement.progress}/{achievement.maxProgress}
              </Text>
            </View>
          )}

          {/* Earned Date */}
          {achievement.earned && achievement.earnedDate && (
            <Text style={styles.earnedDate}>
              Earned {formatDate(achievement.earnedDate)}
            </Text>
          )}
        </View>

        {/* Status Badge */}
        {achievement.earned && (
          <View style={styles.earnedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
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
  earnedCard: {
    borderColor: colors.success + '30',
    backgroundColor: colors.success + '05',
  },
  lockedCard: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  lockedIconContainer: {
    backgroundColor: colors.gray100,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  lockedTitle: {
    color: colors.gray500,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  lockedDescription: {
    color: colors.gray400,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontWeight: fontWeight.medium,
  },
  earnedDate: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
  earnedBadge: {
    marginLeft: spacing.sm,
  },
});