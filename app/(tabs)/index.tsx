import { DebugInfo } from '@/components/debug-info';
import { MultiStepForm } from '@/components/multi-step-form';
import { ResearchLogDetail } from '@/components/research-log-detail';
import { ResearchLogFilter } from '@/components/research-log-filter';
import { ResearchLogList } from '@/components/research-log-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { researchLogService } from '@/services/research-log-service';
import type { CreateResearchLogInput, FilterOptions, ResearchLog } from '@/types/research-log';
import { isWithinInterval, parseISO } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [logs, setLogs] = useState<ResearchLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ResearchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedLog, setSelectedLog] = useState<ResearchLog | undefined>();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await researchLogService.getAll();
      // Sort by date field in reverse chronological order (newest first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Reverse chronological order
      });
      setLogs(sortedData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load research logs. Please check your internet connection.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  }, []);

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(log => {
        const logDate = parseISO(log.date);
        
        if (filters.dateFrom && filters.dateTo) {
          return isWithinInterval(logDate, {
            start: parseISO(filters.dateFrom),
            end: parseISO(filters.dateTo),
          });
        } else if (filters.dateFrom) {
          return logDate >= parseISO(filters.dateFrom);
        } else if (filters.dateTo) {
          return logDate <= parseISO(filters.dateTo);
        }
        
        return true;
      });
    }

    setFilteredLogs(filtered);
  };

  const handleCreate = async (data: CreateResearchLogInput) => {
    try {
      setLoading(true);
      await researchLogService.create(data);
      await loadLogs();
      setViewMode('list');
      Alert.alert('Success', 'Research log created successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create research log. Please try again.';
      Alert.alert('Error', errorMessage);
      console.error('Create error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: CreateResearchLogInput) => {
    if (!selectedLog) return;

    try {
      setLoading(true);
      await researchLogService.update({
        id: selectedLog.id,
        ...data,
      });
      await loadLogs();
      setViewMode('list');
      setSelectedLog(undefined);
      Alert.alert('Success', 'Research log updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update research log. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await researchLogService.delete(id);
      await loadLogs();
      Alert.alert('Success', 'Research log deleted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete research log. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (log: ResearchLog) => {
    setSelectedLog(log);
    setViewMode('detail');
  };

  const handleEdit = (log: ResearchLog) => {
    setSelectedLog(log);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedLog(undefined);
  };

  const handleCloseDetail = () => {
    setViewMode('list');
    setSelectedLog(undefined);
  };

  const handleFilterApply = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <ThemedText style={styles.headerTitle}>Research Notebook</ThemedText>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={[styles.headerButton, styles.filterButton]}
          onPress={() => setShowFilter(true)}
        >
          <ThemedText style={styles.headerButtonText}>
            {filters.dateFrom || filters.dateTo ? 'Filter *' : 'Filter'}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, styles.addButton]}
          onPress={() => setViewMode('create')}
        >
          <ThemedText style={styles.headerButtonText}>+ New Log</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (viewMode === 'create') {
    return (
      <ThemedView style={styles.container}>
        <MultiStepForm
          onSubmit={handleCreate}
          onCancel={handleCancel}
        />
      </ThemedView>
    );
  }

  if (viewMode === 'edit' && selectedLog) {
    return (
      <ThemedView style={styles.container}>
        <MultiStepForm
          initialData={selectedLog}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
        />
      </ThemedView>
    );
  }

  if (viewMode === 'detail' && selectedLog) {
    return (
      <ThemedView style={styles.container}>
        <ResearchLogDetail
          log={selectedLog}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={handleCloseDetail}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {renderHeader()}
      
      {__DEV__ && <DebugInfo />}
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading logs...</ThemedText>
        </View>
      ) : (
        <ResearchLogList
          logs={filteredLogs}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <ResearchLogFilter
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={handleFilterApply}
        currentFilters={filters}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: '#666',
  },
  addButton: {
    backgroundColor: '#007AFF',
    flex: 1,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});
