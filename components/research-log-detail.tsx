import { MarkdownView } from '@/components/markdown-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ResearchLog } from '@/types/research-log';
import { showAlert } from '@/utils/alert';
import { format, parseISO } from 'date-fns';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ResearchLogDetailProps {
  log: ResearchLog;
  onEdit: (log: ResearchLog) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function ResearchLogDetail({ log, onEdit, onDelete, onClose }: ResearchLogDetailProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleDelete = () => {
    showAlert(
      'Delete Log',
      `Are you sure you want to delete the log from ${format(parseISO(log.date), 'MMM dd, yyyy')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDelete(log.id);
            onClose();
          }
        },
      ]
    );
  };

  const renderField = (label: string, content: string) => {
    if (!content) return null;

    return (
      <View style={styles.fieldSection}>
        <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
        <View style={styles.fieldContent}>
          <MarkdownView text={content} style={styles.fieldValue} />
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#38383a' : '#e0e0e0' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(log)}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ThemedText style={styles.date}>
          {format(parseISO(log.date), 'EEEE, MMMM d, yyyy')}
        </ThemedText>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {renderField('What I plan to read today', log.plan_to_read)}
        {renderField('What do I plan to do?', log.plan_to_do)}
        {renderField('What did I read today?', log.did_read)}
        {renderField('What did I learn today?', log.learned_today)}
        {renderField('What new things did I think of today?', log.new_thoughts)}
        {renderField('What did I code/implement today?', log.coded_today)}
        {renderField('What did I write today? Or, what did I teach others?', log.wrote_or_taught)}
        {renderField('What are some things I should try tomorrow?', log.try_tomorrow)}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  date: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  fieldSection: {
    marginBottom: 32,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    opacity: 0.8,
  },
  fieldContent: {
    paddingLeft: 4,
  },
  fieldValue: {
    fontSize: 15,
    lineHeight: 24,
  },
});

