import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MainScreenProps } from '../../types/navigation';
import { User } from '../../types/models';
import { Button, StatsCard, AchievementCard } from '../../components';
import ProfileEditModal from '../../components/ProfileEditModal';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useError } from '../../contexts/ErrorContext';
import { apiService } from '../../services/ApiService';
import { colors, spacing, fontSize, fontWeight } from '../../utils/theme';
import { calculateUserStats, formatRelativeTime } from '../../utils/dataTransforms';
import { getErrorMessage, logError } from '../../utils/errorHandling';
import { withRetry, retryConfigs } from '../../utils/retryUtils';

import type { ProfileScreenProps } from '../../types/navigation';

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout, loading, updateUser } = useAuth();
  const { habits, users, refreshData } = useAppData();
  const { showError, showSuccess } = useError();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate user statistics
  const userStats = user ? calculateUserStats(user, users) : null;

  const achievements = useMemo(() => [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first eco habit',
      icon: 'leaf' as const,
      color: colors.success,
      earned: user ? user.totalImpactPoints > 0 : false,
      earnedDate: user?.joinedDate,
    },
    {
      id: 2,
      title: 'Habit Tracker',
      description: 'Track 5 different habits',
      icon: 'checkmark-circle' as const,
      color: colors.primary,
      earned: user ? user.trackedHabits.length >= 5 : false,
      progress: user?.trackedHabits.length || 0,
      maxProgress: 5,
    },
    {
      id: 3,
      title: 'Point Collector',
      description: 'Earn 1000 impact points',
      icon: 'trophy' as const,
      color: '#f59e0b',
      earned: user ? user.totalImpactPoints >= 1000 : false,
      progress: user?.totalImpactPoints || 0,
      maxProgress: 1000,
    },
    {
      id: 4,
      title: 'Eco Warrior',
      description: 'Reach the top 3 on the leaderboard',
      icon: 'medal' as const,
      color: '#8b5cf6',
      earned: userStats ? userStats.rank <= 3 : false,
    },
    {
      id: 5,
      title: 'Consistency King',
      description: 'Complete habits for 30 days straight',
      icon: 'calendar' as const,
      color: '#ef4444',
      earned: false,
      progress: Math.floor(Math.random() * 20) + 5,
      maxProgress: 30,
    },
  ], [user, userStats]);

  const earnedAchievements = achievements.filter(a => a.earned);
  const inProgressAchievements = achievements.filter(a => !a.earned);

  const handleEditProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = await withRetry(
        () => apiService.updateUserProfile(user.id, updates),
        retryConfigs.userAction
      );
      updateUser(updatedUser);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'ProfileScreen.handleEditProfile', { 
        userId: user.id,
        updates,
        errorMessage 
      });
      
      showError(
        'Failed to update profile. Please try again.',
        () => handleEditProfile(updates),
        'Retry'
      );
      
      throw new Error(errorMessage);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData(true); // Force refresh
      showSuccess('Profile data refreshed!');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError(error, 'ProfileScreen.handleRefresh', { 
        userId: user?.id,
        errorMessage 
      });
      
      showError(
        'Failed to refresh profile data. Please check your connection.',
        () => handleRefresh(),
        'Retry'
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.memberSince}>
              Member since {formatRelativeTime(user.joinedDate)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

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
                title="Leaderboard"
                value={`#${userStats.rank}`}
                subtitle={`of ${users.length}`}
                icon="🏆"
                color={colors.primary}
              />
            </View>
            
            <View style={styles.statsRow}>
              <StatsCard
                title="Habits"
                value={userStats.completedHabits}
                subtitle="Tracking"
                icon="✅"
                color={colors.primaryLight}
              />
              <StatsCard
                title="Rate"
                value={`${userStats.completionRate}%`}
                subtitle="Completion"
                icon="📈"
                color={colors.success}
              />
            </View>
          </View>
        )}

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievementCount}>
              {earnedAchievements.length}/{achievements.length}
            </Text>
          </View>

          {/* Earned Achievements */}
          {earnedAchievements.length > 0 && (
            <View style={styles.achievementGroup}>
              <Text style={styles.achievementGroupTitle}>
                🏆 Earned ({earnedAchievements.length})
              </Text>
              {earnedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </View>
          )}

          {/* In Progress Achievements */}
          {inProgressAchievements.length > 0 && (
            <View style={styles.achievementGroup}>
              <Text style={styles.achievementGroupTitle}>
                🎯 In Progress ({inProgressAchievements.length})
              </Text>
              {inProgressAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              title="View Habits"
              onPress={() => navigation.navigate('Habits')}
              style={styles.quickActionButton}
            />
            <Button
              title="Join Challenge"
              onPress={() => navigation.navigate('Challenges')}
              variant="outline"
              style={styles.quickActionButton}
            />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            disabled={loading}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        visible={editModalVisible}
        user={user}
        onClose={() => setEditModalVisible(false)}
        onSave={handleEditProfile}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  editButton: {
    padding: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: 20,
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
  achievementCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  achievementGroup: {
    marginBottom: spacing.lg,
  },
  achievementGroupTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
});