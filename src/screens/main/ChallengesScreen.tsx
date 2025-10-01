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
import { MainScreenProps } from '../../types/navigation';
import ChallengeCard from '../../components/ChallengeCard';
import ChallengeFilter from '../../components/ChallengeFilter';
import { apiService } from '../../services/ApiService';
import { LoadingSpinner } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { colors, spacing, fontSize, fontWeight } from '../../utils/theme';
import { getErrorMessage } from '../../utils/errorHandling';

import type { ChallengesScreenProps } from '../../types/navigation';

export default function ChallengesScreen({ navigation }: ChallengesScreenProps) {
  const { user } = useAuth();
  const { challenges, loading, error, refreshChallenges, clearError } = useAppData();
  
  const [showParticipatingOnly, setShowParticipatingOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'reward' | 'duration'>('popular');
  const [participatingChallenges, setParticipatingChallenges] = useState<number[]>([]);

  // Filter and sort challenges
  const filteredChallenges = useMemo(() => {
    let filtered = [...challenges];

    // Filter by participation status
    if (showParticipatingOnly) {
      filtered = filtered.filter(challenge => 
        participatingChallenges.includes(challenge.id)
      );
    }

    // Sort challenges
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.participants - a.participants);
        break;
      case 'reward':
        filtered.sort((a, b) => b.reward - a.reward);
        break;
      case 'duration':
        filtered.sort((a, b) => {
          const aDays = parseInt(a.duration);
          const bDays = parseInt(b.duration);
          return aDays - bDays;
        });
        break;
    }

    return filtered;
  }, [challenges, showParticipatingOnly, sortBy, participatingChallenges]);

  // Get statistics
  const stats = useMemo(() => {
    const totalChallenges = challenges.length;
    const myParticipating = participatingChallenges.length;
    const totalRewardsPossible = challenges.reduce((sum, challenge) => sum + challenge.reward, 0);
    const myPotentialRewards = challenges
      .filter(challenge => participatingChallenges.includes(challenge.id))
      .reduce((sum, challenge) => sum + challenge.reward, 0);

    return {
      totalChallenges,
      myParticipating,
      totalRewardsPossible,
      myPotentialRewards,
    };
  }, [challenges, participatingChallenges]);

  const handleJoinChallenge = async (challengeId: number) => {
    if (!user) return;

    try {
      const challenge = challenges.find(c => c.id === challengeId);
      
      Alert.alert(
        'Join Challenge',
        `Join "${challenge?.name}"? This challenge lasts ${challenge?.duration} and you'll earn ${challenge?.reward} points upon completion.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Join Challenge', 
            onPress: async () => {
              try {
                await apiService.joinChallenge(user.id, challengeId);
                setParticipatingChallenges(prev => [...prev, challengeId]);
                Alert.alert(
                  'Challenge Joined! 🎉',
                  `You've joined "${challenge?.name}". Good luck with your eco journey!`,
                  [{ text: 'Let\'s Go!', style: 'default' }]
                );
              } catch (error) {
                Alert.alert('Error', getErrorMessage(error));
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to join challenge. Please try again.');
    }
  };

  const handleLeaveChallenge = async (challengeId: number) => {
    if (!user) return;

    try {
      const challenge = challenges.find(c => c.id === challengeId);
      
      Alert.alert(
        'Leave Challenge',
        `Are you sure you want to leave "${challenge?.name}"? You'll lose any progress made.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Leave Challenge', 
            style: 'destructive',
            onPress: async () => {
              try {
                await apiService.leaveChallenge(user.id, challengeId);
                setParticipatingChallenges(prev => prev.filter(id => id !== challengeId));
                Alert.alert('Left Challenge', `You've left "${challenge?.name}".`);
              } catch (error) {
                Alert.alert('Error', getErrorMessage(error));
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to leave challenge. Please try again.');
    }
  };

  const handleRefresh = async () => {
    try {
      clearError();
      await refreshChallenges();
    } catch (error) {
      Alert.alert('Refresh Failed', 'Unable to refresh challenges. Please try again.');
    }
  };

  const renderChallengeCard = ({ item: challenge }: { item: Challenge }) => {
    const isParticipating = participatingChallenges.includes(challenge.id);
    
    return (
      <ChallengeCard
        challenge={challenge}
        isParticipating={isParticipating}
        onJoinChallenge={handleJoinChallenge}
        onLeaveChallenge={handleLeaveChallenge}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="trophy-outline" size={64} color={colors.gray300} />
      <Text style={styles.emptyStateTitle}>
        {showParticipatingOnly ? 'No Active Challenges' : 'No Challenges Available'}
      </Text>
      <Text style={styles.emptyStateText}>
        {showParticipatingOnly 
          ? 'Join some challenges to see them here!'
          : 'Check back later for new eco challenges.'
        }
      </Text>
      {showParticipatingOnly && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={() => setShowParticipatingOnly(false)}
        >
          <Text style={styles.emptyStateButtonText}>Browse All Challenges</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && challenges.length === 0) {
    return <LoadingSpinner text="Loading challenges..." overlay />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.myParticipating}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalChallenges}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.myPotentialRewards}</Text>
            <Text style={styles.statLabel}>Potential Points</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <ChallengeFilter
        showParticipatingOnly={showParticipatingOnly}
        onToggleParticipatingOnly={() => setShowParticipatingOnly(!showParticipatingOnly)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Challenges List */}
      <FlatList
        data={filteredChallenges}
        renderItem={renderChallengeCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
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