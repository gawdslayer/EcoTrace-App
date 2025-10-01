import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  Alert,
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HabitCard from '../../components/HabitCard';
import HabitFilter from '../../components/HabitFilter';
import { LoadingSpinner } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useError } from '../../contexts/ErrorContext';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import HabitService from '../../services/HabitService';
import { colors, spacing, fontSize, fontWeight } from '../../utils/theme';
import { getErrorMessage } from '../../utils/errorHandling';
import { withRetry, retryConfigs } from '../../utils/retryUtils';

import type { HabitsScreenProps } from '../../types/navigation';

export default function HabitsScreen() {
  const { user, updateUser } = useAuth();
  const { habits, loading, error, refreshHabits, clearError } = useAppData();
  const { showError, showSuccess } = useError();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showTrackedOnly, setShowTrackedOnly] = useState(false);

  // Pull-to-refresh functionality
  const { refreshing, onRefresh } = usePullToRefresh({
    onRefresh: async () => {
      try {
        await refreshHabits(true); // Force refresh habits
      } catch (error) {
        showError('Failed to refresh habits. Please try again.');
      }
    },
  });

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(habits.map(habit => habit.category))];
    return uniqueCategories.sort();
  }, [habits]);

  // Filter habits based on selected filters
  const filteredHabits = useMemo(() => {
    let filtered = [...habits];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(habit => habit.category === selectedCategory);
    }

    // Filter by tracked status
    if (showTrackedOnly) {
      filtered = filtered.filter(habit => 
        user?.trackedHabits.includes(habit.id) || false
      );
    }

    // Sort by impact points (highest first)
    return filtered.sort((a, b) => b.impact - a.impact);
  }, [habits, selectedCategory, showTrackedOnly, user?.trackedHabits]);

  // Get statistics
  const stats = useMemo(() => {
    const totalHabits = habits.length;
    const trackedHabits = user?.trackedHabits.length || 0;
    const totalPossiblePoints = habits.reduce((sum, habit) => sum + habit.impact, 0);
    const trackedPoints = habits
      .filter(habit => user?.trackedHabits.includes(habit.id))
      .reduce((sum, habit) => sum + habit.impact, 0);

    return {
      totalHabits,
      trackedHabits,
      totalPossiblePoints,
      trackedPoints,
    };
  }, [habits, user?.trackedHabits]);

  const handleToggleTrack = async (habitId: number) => {
    if (!user) return;

    try {
      const isCurrentlyTracked = user.trackedHabits.includes(habitId);
      const habit = habits.find(h => h.id === habitId);
      
      if (isCurrentlyTracked) {
        Alert.alert(
          'Untrack Habit',
          `Stop tracking "${habit?.name}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Untrack', 
              style: 'destructive',
              onPress: async () => {
                try {
                  const updatedUser = await withRetry(
                    () => HabitService.untrackHabit(user.id, habitId),
                    retryConfigs.userAction
                  );
                  updateUser(updatedUser);
                  showSuccess(`Stopped tracking "${habit?.name}"`);
                } catch (error) {
                  showError(
                    getErrorMessage(error),
                    () => handleToggleTrack(habitId),
                    'Try Again'
                  );
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Track Habit',
          `Start tracking "${habit?.name}"? You'll earn ${habit?.impact} points each time you complete it.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Track', 
              onPress: async () => {
                try {
                  const updatedUser = await withRetry(
                    () => HabitService.trackHabit(user.id, habitId),
                    retryConfigs.userAction
                  );
                  updateUser(updatedUser);
                  showSuccess(`Now tracking "${habit?.name}"! 🌱`);
                } catch (error) {
                  showError(
                    getErrorMessage(error),
                    () => handleToggleTrack(habitId),
                    'Try Again'
                  );
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit tracking. Please try again.');
    }
  };

  const handleCompleteHabit = async (habitId: number) => {
    if (!user) return;

    try {
      const habit = habits.find(h => h.id === habitId);
      
      Alert.alert(
        'Complete Habit',
        `Mark "${habit?.name}" as completed? You'll earn ${habit?.impact} points.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Complete', 
            onPress: async () => {
              try {
                const result = await withRetry(
                  () => HabitService.completeHabit(user.id, habitId),
                  retryConfigs.userAction
                );
                updateUser(result.user);
                
                Alert.alert(
                  'Congratulations! 🎉',
                  `You completed "${habit?.name}" and earned ${result.pointsEarned} points!\n\nTotal Points: ${result.newTotal}`,
                  [{ text: 'Awesome!', style: 'default' }]
                );
              } catch (error) {
                showError(
                  getErrorMessage(error),
                  () => handleCompleteHabit(habitId),
                  'Try Again'
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete habit. Please try again.');
    }
  };

  const handleRefresh = async () => {
    try {
      clearError();
      await refreshHabits();
    } catch (error) {
      Alert.alert('Refresh Failed', 'Unable to refresh habits. Please try again.');
    }
  };

  const renderHabitCard = ({ item: habit }: { item: Habit }) => {
    const isTracked = user?.trackedHabits.includes(habit.id) || false;
    
    return (
      <HabitCard
        habit={habit}
        isTracked={isTracked}
        onToggleTrack={handleToggleTrack}
        onComplete={handleCompleteHabit}
        showCompleteButton={true}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="leaf-outline" size={64} color={colors.gray300} />
      <Text style={styles.emptyStateTitle}>
        {showTrackedOnly ? 'No Tracked Habits' : 'No Habits Found'}
      </Text>
      <Text style={styles.emptyStateText}>
        {showTrackedOnly 
          ? 'Start tracking some habits to see them here!'
          : selectedCategory 
            ? `No habits found in ${selectedCategory} category.`
            : 'No habits available at the moment.'
        }
      </Text>
      {showTrackedOnly && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={() => setShowTrackedOnly(false)}
        >
          <Text style={styles.emptyStateButtonText}>Browse All Habits</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && habits.length === 0) {
    return <LoadingSpinner text="Loading habits..." overlay />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.trackedHabits}</Text>
            <Text style={styles.statLabel}>Tracking</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalHabits}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.trackedPoints}</Text>
            <Text style={styles.statLabel}>Potential Points</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <HabitFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        showTrackedOnly={showTrackedOnly}
        onToggleTrackedOnly={() => setShowTrackedOnly(!showTrackedOnly)}
      />

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            clearError();
            onRefresh();
          }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Habits List */}
      <FlatList
        data={filteredHabits}
        renderItem={renderHabitCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: fontWeight.medium,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.gray200,
    marginHorizontal: spacing.md,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: spacing.md,
    margin: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  listContainer: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});