import { ParsedTextView } from '@/components/parsed-text-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ResearchLog } from '@/types/research-log';
import { format, parseISO } from 'date-fns';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ITEMS_PER_PAGE = 10;

interface ResearchLogListProps {
  logs: ResearchLog[];
  onEdit: (log: ResearchLog) => void;
  onDelete: (id: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function ResearchLogList({ 
  logs, 
  onEdit, 
  onDelete,
  refreshing = false,
  onRefresh 
}: ResearchLogListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Lazy loading state
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const displayedLogs = logs.slice(0, displayedCount);
  const hasMore = displayedCount < logs.length;

  const handleDelete = (log: ResearchLog) => {
    Alert.alert(
      'Delete Log',
      `Are you sure you want to delete the log from ${format(parseISO(log.date), 'MMM dd, yyyy')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete(log.id) 
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ResearchLog }) => {
    const cardStyle = [
      styles.card,
      {
        backgroundColor: isDark ? '#1c1c1e' : '#fff',
        borderColor: isDark ? '#38383a' : '#e0e0e0',
      }
    ];

    return (
      <ThemedView style={cardStyle}>
        <View style={styles.cardHeader}>
          <ThemedText style={styles.date}>
            {format(parseISO(item.date), 'EEE, MMM d yyyy')}
          </ThemedText>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(item)}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {item.plan_to_read && (
          <View style={styles.fieldSection}>
            <ThemedText style={styles.fieldLabel}>Plan to Read:</ThemedText>
            <ParsedTextView text={item.plan_to_read} style={styles.fieldValue} />
          </View>
        )}

        {item.did_read && (
          <View style={styles.fieldSection}>
            <ThemedText style={styles.fieldLabel}>Did Read:</ThemedText>
            <ParsedTextView text={item.did_read} style={styles.fieldValue} />
          </View>
        )}

        {item.learned_today && (
          <View style={styles.fieldSection}>
            <ThemedText style={styles.fieldLabel}>Learned:</ThemedText>
            <ParsedTextView text={item.learned_today} style={styles.fieldValue} />
          </View>
        )}

        {item.new_thoughts && (
          <View style={styles.fieldSection}>
            <ThemedText style={styles.fieldLabel}>New Thoughts:</ThemedText>
            <ParsedTextView text={item.new_thoughts} style={styles.fieldValue} />
          </View>
        )}

        {item.coded_today && (
          <View style={styles.fieldSection}>
            <ThemedText style={styles.fieldLabel}>Coded/Implemented:</ThemedText>
            <ParsedTextView text={item.coded_today} style={styles.fieldValue} />
          </View>
        )}

        {item.wrote_or_taught && (
          <View style={styles.fieldSection}>
            <ThemedText style={styles.fieldLabel}>Wrote/Taught:</ThemedText>
            <ParsedTextView text={item.wrote_or_taught} style={styles.fieldValue} />
          </View>
        )}

        {item.try_tomorrow && (
          <View style={styles.fieldSection}>
            <ThemedText style={styles.fieldLabel}>Try Tomorrow:</ThemedText>
            <ParsedTextView text={item.try_tomorrow} style={styles.fieldValue} />
          </View>
        )}
      </ThemedView>
    );
  };

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyState}>
      <ThemedText style={styles.emptyStateText}>
        No research logs yet. Create your first one!
      </ThemedText>
    </ThemedView>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    if (isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#007AFF" />
          <ThemedText style={styles.loadingMoreText}>Loading more logs...</ThemedText>
        </View>
      );
    }

    return null;
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore || refreshing) return;

    setIsLoadingMore(true);
    
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, logs.length));
      setIsLoadingMore(false);
    }, 300);
  };

  const handleRefreshWithReset = () => {
    setDisplayedCount(ITEMS_PER_PAGE);
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <FlatList
      data={displayedLogs}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      refreshing={refreshing}
      onRefresh={handleRefreshWithReset}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={true}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fieldSection: {
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  fieldValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.6,
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    opacity: 0.6,
  },
});

