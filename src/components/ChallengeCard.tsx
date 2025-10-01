import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, fontSize, fontWeight, shadows } from '../utils/theme';

import type { Challenge } from '../types/models';

import type { ViewStyle } from 'react-native';

interface ChallengeCardProps {
  challenge: Challenge;
  isParticipating: boolean;
  onJoinChallenge: (challengeId: number) => void;
  onLeaveChallenge: (challengeId: number) => void;
  style?: ViewStyle;
}

export default function ChallengeCard({
  challenge,
  isParticipating,
  onJoinChallenge,
  onLeaveChallenge,
  style,
}: ChallengeCardProps) {
  const getDifficultyColor = (duration: string): string => {
    const days = parseInt(duration);
    if (days <= 7) return colors.success; // Easy - Green
    if (days <= 14) return '#f59e0b'; // Medium - Orange
    return '#ef4444'; // Hard - Red
  };

  const getDifficultyLevel = (duration: string): string => {
    const days = parseInt(duration);
    if (days <= 7) return 'Easy';
    if (days <= 14) return 'Medium';
    return 'Hard';
  };

  const getChallengeIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    if (name.toLowerCase().includes('plastic')) return 'trash-outline';
    if (name.toLowerCase().includes('energy')) return 'flash-outline';
    if (name.toLowerCase().includes('transport') || name.toLowerCase().includes('commute')) return 'car-outline';
    if (name.toLowerCase().includes('water')) return 'water-outline';
    return 'leaf-outline';
  };

  const difficultyColor = getDifficultyColor(challenge.duration);
  const difficultyLevel = getDifficultyLevel(challenge.duration);
  const challengeIcon = getChallengeIcon(challenge.name);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={challengeIcon} size={24} color={colors.primary} />
          </View>
          
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeName} numberOfLines={1}>
              {challenge.name}
            </Text>
            <View style={styles.metaInfo}>
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '20' }]}>
                <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                  {difficultyLevel}
                </Text>
              </View>
              <Text style={styles.duration}>{challenge.duration}</Text>
            </View>
          </View>

          <View style={styles.rewardContainer}>
            <Text style={styles.rewardPoints}>+{challenge.reward}</Text>
            <Text style={styles.rewardLabel}>points</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {challenge.description}
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color={colors.primary} />
            <Text style={styles.statText}>
              {challenge.participants.toLocaleString()} participants
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color={colors.textLight} />
            <Text style={styles.statText}>{challenge.duration}</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isParticipating ? styles.leaveButton : styles.joinButton
          ]}
          onPress={() => 
            isParticipating 
              ? onLeaveChallenge(challenge.id)
              : onJoinChallenge(challenge.id)
          }
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isParticipating ? 'checkmark-circle' : 'add-circle-outline'} 
            size={18} 
            color={isParticipating ? colors.white : colors.primary} 
          />
          <Text style={[
            styles.actionButtonText,
            isParticipating ? styles.leaveButtonText : styles.joinButtonText
          ]}>
            {isParticipating ? 'Participating' : 'Join Challenge'}
          </Text>
        </TouchableOpacity>
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  challengeInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  challengeName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  difficultyText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  duration: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontWeight: fontWeight.medium,
  },
  rewardContainer: {
    alignItems: 'center',
  },
  rewardPoints: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  rewardLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontWeight: fontWeight.medium,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  statText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  joinButton: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  leaveButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  joinButtonText: {
    color: colors.primary,
  },
  leaveButtonText: {
    color: colors.white,
  },
});