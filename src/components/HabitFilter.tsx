import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '../utils/theme';

import type { ViewStyle } from 'react-native';

interface HabitFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  showTrackedOnly: boolean;
  onToggleTrackedOnly: () => void;
  style?: ViewStyle;
}

export default function HabitFilter({
  categories,
  selectedCategory,
  onCategorySelect,
  showTrackedOnly,
  onToggleTrackedOnly,
  style,
}: HabitFilterProps) {
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Waste Reduction':
        return '#10b981';
      case 'Transportation':
        return '#3b82f6';
      case 'Energy Saving':
        return '#f59e0b';
      case 'Food':
        return '#8b5cf6';
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.trackedFilter,
            showTrackedOnly && styles.trackedFilterActive
          ]}
          onPress={onToggleTrackedOnly}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showTrackedOnly ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={18}
            color={showTrackedOnly ? colors.white : colors.primary}
          />
          <Text style={[
            styles.trackedFilterText,
            showTrackedOnly && styles.trackedFilterTextActive
          ]}>
            My Habits Only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === null && styles.categoryChipActive
          ]}
          onPress={() => onCategorySelect(null)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.categoryChipText,
            selectedCategory === null && styles.categoryChipTextActive
          ]}>
            All Categories
          </Text>
        </TouchableOpacity>

        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const categoryColor = getCategoryColor(category);

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                isSelected && { backgroundColor: categoryColor }
              ]}
              onPress={() => onCategorySelect(category)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryChipText,
                isSelected && { color: colors.white }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  trackedFilter: {
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
  trackedFilterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  trackedFilterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  trackedFilterTextActive: {
    color: colors.white,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
  },
  categoryChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
});