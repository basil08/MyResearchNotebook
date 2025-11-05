import { MarkdownView } from '@/components/markdown-view';
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
  onView: (log: ResearchLog) => void;
  onEdit: (log: ResearchLog) => void;
  onDelete: (id: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function ResearchLogList({ 
  logs, 
  onView,
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

    // Combine all fields to show preview
    const contentFields = [
      item.plan_to_read,
      item.plan_to_do,
      item.did_read,
      item.learned_today,
      item.new_thoughts,
      item.coded_today,
      item.wrote_or_taught,
      item.try_tomorrow,
    ].filter(Boolean);

    const previewContent = contentFields.join('\n\n').slice(0, 100) + (contentFields.join('\n\n').length > 100 ? '...' : '');

    return (
      <TouchableOpacity onPress={() => onView(item)} activeOpacity={0.7}>
        <ThemedView style={cardStyle}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.date}>
              {format(parseISO(item.date), 'EEE, MMM d yyyy')}
            </ThemedText>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>

          {previewContent && (
            <View style={styles.previewSection}>
              <View style={styles.previewContent}>
                <MarkdownView text={previewContent} style={styles.previewText} />
              </View>
            </View>
          )}
        </ThemedView>
      </TouchableOpacity>
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
  previewSection: {
    marginTop: 12,
  },
  previewContent: {
    maxHeight: 200,
    overflow: 'hidden',
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
  },
  tapToViewMore: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.6,
    fontStyle: 'italic',
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

