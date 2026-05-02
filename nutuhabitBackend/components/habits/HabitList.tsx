import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Habit, HabitLog } from '@/src/types/habit';
import { HabitCard } from './HabitCard';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { FONTS } from '@/constants/fonts';

interface HabitListProps {
  habits: Habit[];
  logs: HabitLog[];
  onHabitPress: (habit: Habit) => void;
  getTodayLog?: (habitId: string) => HabitLog | undefined;
  emptyMessage?: string;
  ListHeaderComponent?: React.ReactElement | null;
  contentPaddingBottom?: number;
  scrollToHabitId?: string | null;
  onScrollToHandled?: () => void;
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>✨</Text>
      <Text style={styles.emptyTitle}>Henüz alışkanlık yok</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export function HabitList({
  habits,
  logs,
  onHabitPress,
  getTodayLog,
  emptyMessage = 'Yeni alışkanlık eklemek için + butonuna dokun.',
  ListHeaderComponent,
  contentPaddingBottom,
  scrollToHabitId,
  onScrollToHandled,
}: HabitListProps) {
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList<Habit>>(null);

  useEffect(() => {
    if (!scrollToHabitId || habits.length === 0) return;
    const index = habits.findIndex((h) => h.id === scrollToHabitId);
    if (index === -1) return;
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.1 });
      onScrollToHandled?.();
    }, 350);
    return () => clearTimeout(timer);
  }, [scrollToHabitId, habits]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const getLog = useCallback(
    (habitId: string): HabitLog | undefined => {
      if (getTodayLog) return getTodayLog(habitId);
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      return logs.find((l) => l.habitId === habitId && l.date === todayStr);
    },
    [getTodayLog, logs]
  );

  const renderItem = useCallback(
    ({ item }: { item: Habit }) => (
      <HabitCard
        habit={item}
        log={getLog(item.id)}
        onPress={onHabitPress}
      />
    ),
    [getLog, onHabitPress]
  );

  const keyExtractor = useCallback((item: Habit) => item.id, []);

  return (
    <FlatList
      ref={flatListRef}
      data={habits}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={[
        styles.listContent,
        habits.length === 0 && styles.emptyList,
        contentPaddingBottom != null && { paddingBottom: contentPaddingBottom },
      ]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={<EmptyState message={emptyMessage} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary[400]}
          colors={[COLORS.primary[400]]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: LAYOUT.spacing.md,
    paddingBottom: 120,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing['2xl'],
    paddingHorizontal: LAYOUT.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: LAYOUT.spacing.md,
  },
  emptyTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold,
    color: 'rgba(255,255,255,0.60)',
    marginBottom: LAYOUT.spacing.sm,
  },
  emptyText: {
    fontSize: FONTS.size.sm,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
