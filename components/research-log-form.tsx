import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CreateResearchLogInput, ResearchLog } from '@/types/research-log';
import { format } from 'date-fns';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface ResearchLogFormProps {
  initialData?: ResearchLog;
  onSubmit: (data: CreateResearchLogInput) => void;
  onCancel: () => void;
}

export function ResearchLogForm({ initialData, onSubmit, onCancel }: ResearchLogFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [formData, setFormData] = useState<CreateResearchLogInput>({
    date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
    plan_to_read: initialData?.plan_to_read || '',
    plan_to_do: initialData?.plan_to_do || '',
    did_read: initialData?.did_read || '',
    learned_today: initialData?.learned_today || '',
    new_thoughts: initialData?.new_thoughts || '',
    coded_today: initialData?.coded_today || '',
    wrote_or_taught: initialData?.wrote_or_taught || '',
    try_tomorrow: initialData?.try_tomorrow || '',
  });

  const handleChange = (field: keyof CreateResearchLogInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
      color: isDark ? '#fff' : '#000',
      borderColor: isDark ? '#333' : '#ddd',
    }
  ];

  const multilineInputStyle = [
    styles.input,
    styles.multilineInput,
    {
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
      color: isDark ? '#fff' : '#000',
      borderColor: isDark ? '#333' : '#ddd',
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>
          {initialData ? 'Edit Research Log' : 'New Research Log'}
        </ThemedText>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>Date</ThemedText>
          <TextInput
            style={inputStyle}
            value={formData.date}
            onChangeText={(value) => handleChange('date', value)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={isDark ? '#666' : '#999'}
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>What I plan to read today?</ThemedText>
          <TextInput
            style={multilineInputStyle}
            value={formData.plan_to_read}
            onChangeText={(value) => handleChange('plan_to_read', value)}
            placeholder="Enter what you plan to read..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>What do I plan to do?</ThemedText>
          <TextInput
            style={multilineInputStyle}
            value={formData.plan_to_do}
            onChangeText={(value) => handleChange('plan_to_do', value)}
            placeholder="Enter what you plan to do..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>What did I read today?</ThemedText>
          <TextInput
            style={multilineInputStyle}
            value={formData.did_read}
            onChangeText={(value) => handleChange('did_read', value)}
            placeholder="Enter what you read..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>What did I learn today?</ThemedText>
          <TextInput
            style={multilineInputStyle}
            value={formData.learned_today}
            onChangeText={(value) => handleChange('learned_today', value)}
            placeholder="Enter what you learned..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>What new things did I think of today?</ThemedText>
          <TextInput
            style={multilineInputStyle}
            value={formData.new_thoughts}
            onChangeText={(value) => handleChange('new_thoughts', value)}
            placeholder="Enter your new thoughts..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>What did I code/implement today?</ThemedText>
          <TextInput
            style={multilineInputStyle}
            value={formData.coded_today}
            onChangeText={(value) => handleChange('coded_today', value)}
            placeholder="Enter what you coded..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>What did I write today? Or, what did I teach others?</ThemedText>
          <TextInput
            style={multilineInputStyle}
            value={formData.wrote_or_taught}
            onChangeText={(value) => handleChange('wrote_or_taught', value)}
            placeholder="Enter what you wrote or taught..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={styles.label}>What are some things I should try tomorrow?</ThemedText>
          <TextInput
            style={multilineInputStyle}
            value={formData.try_tomorrow}
            onChangeText={(value) => handleChange('try_tomorrow', value)}
            placeholder="Enter what you'll try tomorrow..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>
              {initialData ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

