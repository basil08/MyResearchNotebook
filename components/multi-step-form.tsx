import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CreateResearchLogInput, ResearchLog } from '@/types/research-log';
import { format } from 'date-fns';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface MultiStepFormProps {
  initialData?: ResearchLog;
  onSubmit: (data: CreateResearchLogInput) => Promise<void>;
  onCancel: () => void;
}

interface FormField {
  key: keyof CreateResearchLogInput;
  label: string;
  placeholder: string;
}

const formFields: FormField[] = [
  {
    key: 'date',
    label: 'Date',
    placeholder: 'YYYY-MM-DD',
  },
  {
    key: 'plan_to_read',
    label: 'What I plan to read today?',
    placeholder: 'Enter what you plan to read...',
  },
  {
    key: 'plan_to_do',
    label: 'What do I plan to do?',
    placeholder: 'Enter what you plan to do...',
  },
  {
    key: 'did_read',
    label: 'What did I read today?',
    placeholder: 'Enter what you read...',
  },
  {
    key: 'learned_today',
    label: 'What did I learn today?',
    placeholder: 'Enter what you learned...',
  },
  {
    key: 'new_thoughts',
    label: 'What new things did I think of today?',
    placeholder: 'Enter your new thoughts...',
  },
  {
    key: 'coded_today',
    label: 'What did I code/implement today?',
    placeholder: 'Enter what you coded...',
  },
  {
    key: 'wrote_or_taught',
    label: 'What did I write today? Or, what did I teach others?',
    placeholder: 'Enter what you wrote or taught...',
  },
  {
    key: 'try_tomorrow',
    label: 'What are some things I should try tomorrow?',
    placeholder: 'Enter what you\'ll try tomorrow...',
  },
];

export function MultiStepForm({ initialData, onSubmit, onCancel }: MultiStepFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const currentField = formFields[currentStep];
  const isLastStep = currentStep === formFields.length - 1;
  const isFirstStep = currentStep === 0;

  const handleChange = (value: string) => {
    setFormData(prev => ({ ...prev, [currentField.key]: value }));
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (!isLastStep) {
      handleNext();
    }
  };

  const isDateField = currentField.key === 'date';
  const currentValue = formData[currentField.key];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#ddd' }]}>
        <TouchableOpacity onPress={onCancel} disabled={isSubmitting}>
          <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {initialData ? 'Edit Log' : 'New Log'}
        </ThemedText>
        <TouchableOpacity onPress={handleSkip} disabled={isSubmitting || isLastStep}>
          <ThemedText style={[styles.skipButton, (isLastStep || isSubmitting) && styles.skipButtonDisabled]}>
            Skip
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentStep + 1) / formFields.length) * 100}%`,
                backgroundColor: isDark ? '#007AFF' : '#007AFF',
              },
            ]}
          />
        </View>
        <ThemedText style={styles.progressText}>
          {currentStep + 1} of {formFields.length}
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Field Label */}
          <ThemedText style={styles.fieldLabel}>{currentField.label}</ThemedText>

          {/* Text Input */}
          <TextInput
            style={[
              styles.input,
              isDateField && styles.dateInput,
              {
                backgroundColor: isDark ? '#1c1c1e' : '#f5f5f5',
                color: isDark ? '#fff' : '#000',
                borderColor: isDark ? '#38383a' : '#ddd',
              },
            ]}
            value={currentValue}
            onChangeText={handleChange}
            placeholder={currentField.placeholder}
            placeholderTextColor={isDark ? '#666' : '#999'}
            multiline={!isDateField}
            numberOfLines={isDateField ? 1 : 10}
            autoFocus
            editable={!isSubmitting}
          />

          {/* Markdown hint for non-date fields */}
          {!isDateField && (
            <ThemedText style={styles.hint}>
              Tip: Paste URLs directly - they'll be automatically formatted as clickable links
            </ThemedText>
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.previousButton,
              { backgroundColor: isDark ? '#333' : '#ddd' },
              isFirstStep && styles.navButtonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={isFirstStep || isSubmitting}
          >
            <Text style={[styles.navButtonText, { color: isDark ? '#fff' : '#000' }]}>
              ← Previous
            </Text>
          </TouchableOpacity>

          {!isLastStep ? (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.submitButton, isSubmitting && styles.navButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={[styles.navButtonText, { marginLeft: 8 }]}>
                    {initialData ? 'Updating...' : 'Creating...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.navButtonText}>
                  {initialData ? 'Update ✓' : 'Create ✓'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    fontSize: 16,
    color: '#FF3B30',
  },
  skipButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  skipButtonDisabled: {
    opacity: 0.3,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    lineHeight: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    minHeight: height * 0.4,
    textAlignVertical: 'top',
  },
  dateInput: {
    minHeight: 50,
  },
  hint: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 12,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  previousButton: {
    // backgroundColor set dynamically
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  submitButton: {
    backgroundColor: '#34C759',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

