import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainScreenProps } from '../../types/navigation';
import StatsCard from '../../components/StatsCard';
import HabitProgress from '../../components/HabitProgress';
import LeaderboardCard from '../../components/LeaderboardCard';
import { LoadingSpinner, Button } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { colors, spacing, fontSize, fontWeight } from '../../utils/theme';
import { 
  calculateUserStats, 
  getTrackedHabits, 
  formatRelativeTime 
} from '../../utils/dataTransforms';

import type { DashboardScreenProps } from '../../types/navigation';

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user } = useAuth();
  const { 
    habits, 
    users, 
    loading, 
    error, 
    lastUpdated, 
    refreshData, 
    clearError 
  } = useAppData();

  // Calculate user statistics
  const userStats = user ? calculateUserStats(user, users) : null;
  const trackedHabits = getTrackedHabits(habits, user?.trackedHabits || []);

  // Auto-refresh data on screen focus
  useEffect(() => {
    if (habits.length === 0 && !loading) {
      refreshData();
    }
  }, []);

  // Refresh data when user changes (e.g., after completing habits)
  useEffect(() => {
    if (user && habits.length > 0) {
      // Recalculate stats when user data changes
      // This ensures the dashboard updates when habits are completed
    }
  }, [user?.totalImpactPoints, user?.trackedHabits]);

  // Pull-to-refresh functionality
  const { refreshing, onRefresh } = usePullToRefresh({
    onRefresh: async () => {
      try {
        await refreshData(true); // Force refresh
      } catch (error) {
        Alert.alert('Refresh Failed', 'Unable to refresh data. Please try again.');
      }
    },
  });

  const handleRetry = async () => {
    clearError();
    await refreshData(true);
  };

  if (loading && habits.length === 0) {
    return <LoadingSpinner text="Loading your dashboard..." overlay />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Welcome back, {user?.username || 'Eco Warrior'}! 🌱
          </Text>
          <Text style={styles.subtitle}>
            Your environmental impact dashboard
          </Text>
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Last updated {formatRelativeTime(lastUpdated)}
            </Text>
          )}
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Retry"
              onPress={handleRetry}
              size="small"
              style={styles.retryButton}
            />
          </View>
        )}

        {/* Stats Cards */}
        {userStats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <StatsCard
                title="Impact Points"
                value={userStats.totalPoints.toLocaleString()}
                subtitle="Total earned"
                icon="🌟"
                color={colors.success}
              />
              <StatsCard
                title="Your Rank"
                value={`#${userStats.rank}`}
                subtitle={`of ${users.length} users`}
                icon="🏆"
                color={colors.primary}
              />
            </View>
            
            <View style={styles.statsRow}>
              <StatsCard
                title="Habits"
                value={userStats.completedHabits}
                subtitle="Active"
                icon="✅"
                color={colors.primaryLight}
              />
              <StatsCard
                title="Rate"
                value={`${userStats.completionRate}%`}
                subtitle="This month"
                icon="📈"
                color={colors.success}
              />
            </View>
          </View>
        )}

        {/* Tracked Habits Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Tracked Habits</Text>
            <Button
              title="Manage"
              onPress={() => navigation.navigate('Habits')}
              size="small"
              variant="outline"
            />
          </View>

          {trackedHabits.length > 0 ? (
            trackedHabits.slice(0, 3).map((habit) => (
              <HabitProgress
                key={habit.id}
                habit={habit}
                isTracked={true}
                style={styles.habitCard}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No habits tracked yet. Start your eco journey!
              </Text>
              <Button
                title="Browse Habits"
                onPress={() => navigation.navigate('Habits')}
                style={styles.emptyStateButton}
              />
            </View>
          )}

          {trackedHabits.length > 3 && (
            <Button
              title={`View all ${trackedHabits.length} habits`}
              onPress={() => navigation.navigate('Habits')}
              variant="outline"
              style={styles.viewAllButton}
            />
          )}
        </View>

        {/* Leaderboard Section */}
        {users.length > 0 && (
          <LeaderboardCard
            users={users}
            currentUserId={user?.id}
            maxItems={5}
            style={styles.leaderboard}
          />
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              title="Join Challenge"
              onPress={() => navigation.navigate('Challenges')}
              style={styles.quickActionButton}
            />
            <Button
              title="View Profile"
              onPress={() => navigation.navigate('Profile')}
              variant="outline"
              style={styles.quickActionButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  lastUpdated: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryButton: {
    minWidth: 80,
  },
  statsContainer: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    marginHorizontal: -spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  habitCard: {
    marginBottom: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.gray50,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyStateButton: {
    minWidth: 150,
  },
  viewAllButton: {
    marginTop: spacing.sm,
  },
  leaderboard: {
    marginBottom: spacing.xl,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});