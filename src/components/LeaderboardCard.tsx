import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import { User } from '../types/models';
import { colors, spacing, fontSize, fontWeight } from '../utils/theme';
import { formatImpactPoints } from '../utils/dataTransforms';

import type { ViewStyle } from 'react-native';

interface LeaderboardCardProps {
  users: User[];
  currentUserId?: number;
  maxItems?: number;
  style?: ViewStyle;
}

export default function LeaderboardCard({
  users,
  currentUserId,
  maxItems = 5,
  style,
}: LeaderboardCardProps) {
  const sortedUsers = [...users]
    .sort((a, b) => b.totalImpactPoints - a.totalImpactPoints)
    .slice(0, maxItems);

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}`;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Leaderboard</Text>
          <Text style={styles.subtitle}>Top eco warriors</Text>
        </View>

        {sortedUsers.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.id === currentUserId;

          return (
            <View
              key={user.id}
              style={[
                styles.userRow,
                isCurrentUser && styles.currentUserRow,
                index === sortedUsers.length - 1 && styles.lastRow,
              ]}
            >
              <View style={styles.rankContainer}>
                <Text style={[styles.rank, isCurrentUser && styles.currentUserText]}>
                  {getRankIcon(rank)}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text 
                  style={[styles.username, isCurrentUser && styles.currentUserText]}
                  numberOfLines={1}
                >
                  {user.username}
                  {isCurrentUser && ' (You)'}
                </Text>
              </View>

              <View style={styles.pointsContainer}>
                <Text style={[styles.points, isCurrentUser && styles.currentUserText]}>
                  {formatImpactPoints(user.totalImpactPoints)}
                </Text>
                <Text style={[styles.pointsLabel, isCurrentUser && styles.currentUserText]}>
                  pts
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
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
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  currentUserRow: {
    backgroundColor: colors.primary + '10',
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderBottomColor: 'transparent',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  username: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  pointsLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  currentUserText: {
    color: colors.primary,
  },
});