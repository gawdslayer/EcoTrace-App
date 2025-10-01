import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '../utils/theme';

import type { ViewStyle } from 'react-native';

interface ChallengeFilterProps {
  showParticipatingOnly: boolean;
  onToggleParticipatingOnly: () => void;
  sortBy: 'popular' | 'reward' | 'duration';
  onSortChange: (sortBy: 'popular' | 'reward' | 'duration') => void;
  style?: ViewStyle;
}

export default function ChallengeFilter({
  showParticipatingOnly,
  onToggleParticipatingOnly,
  sortBy,
  onSortChange,
  style,
}: ChallengeFilterProps) {
  const sortOptions = [
    { key: 'popular' as const, label: 'Most Popular', icon: 'people' as const },
    { key: 'reward' as const, label: 'Highest Reward', icon: 'trophy' as const },
    { key: 'duration' as const, label: 'Shortest Duration', icon: 'time' as const },
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Participating Filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.participatingFilter,
            showParticipatingOnly && styles.participatingFilterActive
          ]}
          onPress={onToggleParticipatingOnly}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={showParticipatingOnly ? 'checkmark-circle' : 'checkmark-circle-outline'} 
            size={18} 
            color={showParticipatingOnly ? colors.white : colors.primary} 
          />
          <Text style={[
            styles.participatingFilterText,
            showParticipatingOnly && styles.participatingFilterTextActive
          ]}>
            My Challenges Only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={styles.sortSection}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortContainer}
        >
          {sortOptions.map((option) => {
            const isSelected = sortBy === option.key;
            
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortChip,
                  isSelected && styles.sortChipActive
                ]}
                onPress={() => onSortChange(option.key)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={option.icon} 
                  size={16} 
                  color={isSelected ? colors.white : colors.textSecondary} 
                />
                <Text style={[
                  styles.sortChipText,
                  isSelected && styles.sortChipTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  participatingFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  participatingFilterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  participatingFilterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  participatingFilterTextActive: {
    color: colors.white,
  },
  sortSection: {
    paddingHorizontal: spacing.lg,
  },
  sortLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sortContainer: {
    flexDirection: 'row',
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  sortChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  sortChipTextActive: {
    color: colors.white,
  },
});