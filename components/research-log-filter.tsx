import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { FilterOptions } from '@/types/research-log';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ResearchLogFilterProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export function ResearchLogFilter({ 
  visible, 
  onClose, 
  onApply,
  currentFilters 
}: ResearchLogFilterProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [dateFrom, setDateFrom] = useState(currentFilters.dateFrom || '');
  const [dateTo, setDateTo] = useState(currentFilters.dateTo || '');

  const handleApply = () => {
    onApply({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setDateFrom('');
    setDateTo('');
    onApply({});
    onClose();
  };

  const handleLastMonth = () => {
    const lastMonth = subMonths(new Date(), 1);
    const start = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
    setDateFrom(start);
    setDateTo(end);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');
    setDateFrom(start);
    setDateTo(end);
  };

  const handleLast7Days = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    setDateFrom(format(sevenDaysAgo, 'yyyy-MM-dd'));
    setDateTo(format(today, 'yyyy-MM-dd'));
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isDark ? '#1c1c1e' : '#f5f5f5',
      color: isDark ? '#fff' : '#000',
      borderColor: isDark ? '#38383a' : '#ddd',
    }
  ];

  const modalBackgroundStyle = {
    backgroundColor: isDark ? '#1c1c1e' : '#fff',
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.modalContent, modalBackgroundStyle]}>
          <ThemedText style={styles.title}>Filter Research Logs</ThemedText>

          <View style={styles.quickFilters}>
            <TouchableOpacity
              style={styles.quickFilterButton}
              onPress={handleLast7Days}
            >
              <Text style={styles.quickFilterText}>Last 7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFilterButton}
              onPress={handleThisMonth}
            >
              <Text style={styles.quickFilterText}>This Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFilterButton}
              onPress={handleLastMonth}
            >
              <Text style={styles.quickFilterText}>Last Month</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>From Date</ThemedText>
            <TextInput
              style={inputStyle}
              value={dateFrom}
              onChangeText={setDateFrom}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          </View>

          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>To Date</ThemedText>
            <TextInput
              style={inputStyle}
              value={dateTo}
              onChangeText={setDateTo}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClear}
            >
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickFilterButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  quickFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#38383a',
    marginVertical: 16,
    opacity: 0.6,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF9500',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

