import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HabitFilter } from '@/src/store/useHabitStore';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

interface FilterOption {
  key: HabitFilter;
  label?: string;
  icon?: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', icon: '⚡' },
  { key: 'done', label: 'Yapıldı' },
  { key: 'time', label: 'Zaman' },
  { key: 'bad', label: 'Kötü' },
];

interface CategoryFilterProps {
  activeFilter: HabitFilter;
  onFilterChange: (filter: HabitFilter) => void;
}

export function CategoryFilter({ activeFilter, onFilterChange }: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.key;
        const isIconOnly = !option.label;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onFilterChange(option.key)}
            activeOpacity={0.75}
            style={isIconOnly ? styles.tabWrapperIcon : styles.tabWrapper}
          >
            <View style={[styles.tab, isActive && styles.tabActive]}>
              {isIconOnly
                ? <Text style={[styles.iconText, isActive && styles.iconTextActive]}>{option.icon}</Text>
                : <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{option.label}</Text>
              }
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: LAYOUT.spacing.md,
    marginVertical: LAYOUT.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  tabWrapper: { flex: 1 },
  tabWrapperIcon: { width: 38 },
  tab: {
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(120,60,220,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.35)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.38)',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  iconText: { fontSize: 14 },
  iconTextActive: { fontSize: 15 },
});
