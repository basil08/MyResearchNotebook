import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Debug component to show configuration status
 * Remove this in production
 */
export function DebugInfo() {
  const [isVisible, setIsVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const googleSheetUrl = Constants.expoConfig?.extra?.GOOGLE_SHEET_DB_URL || 
                         process.env.GOOGLE_SHEET_DB_URL || 
                         'NOT CONFIGURED';

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={[styles.toggleButton, { backgroundColor: isDark ? '#333' : '#ddd' }]}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[styles.toggleText, { color: isDark ? '#fff' : '#000' }]}>
          Show Debug Info
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: isDark ? '#1c1c1e' : '#f5f5f5' }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Debug Information</ThemedText>
        <TouchableOpacity onPress={() => setIsVisible(false)}>
          <ThemedText style={styles.closeButton}>✕</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <ThemedText style={styles.label}>Environment:</ThemedText>
        <ThemedText style={styles.value}>
          {__DEV__ ? 'Development' : 'Production'}
        </ThemedText>
      </View>

      <View style={styles.infoRow}>
        <ThemedText style={styles.label}>Google Sheet URL:</ThemedText>
        <ThemedText 
          style={[
            styles.value, 
            { color: googleSheetUrl === 'NOT CONFIGURED' ? '#FF453A' : (isDark ? '#e5e5e7' : '#000') }
          ]}
          numberOfLines={3}
          ellipsizeMode="middle"
        >
          {googleSheetUrl}
        </ThemedText>
      </View>

      {googleSheetUrl === 'NOT CONFIGURED' && (
        <View style={styles.warning}>
          <ThemedText style={styles.warningText}>
            ⚠️ Google Sheet URL not configured!
          </ThemedText>
          <ThemedText style={styles.warningSubtext}>
            1. Create your .env file in the project root{'\n'}
            2. Add: GOOGLE_SHEET_DB_URL=your_url_here{'\n'}
            3. Restart Expo with: npx expo start --clear{'\n'}
            {'\n'}
            See GOOGLE_SHEETS_SETUP.md for detailed instructions.
          </ThemedText>
        </View>
      )}

      <View style={styles.infoRow}>
        <ThemedText style={styles.label}>Status:</ThemedText>
        <ThemedText style={[
          styles.value,
          { color: googleSheetUrl !== 'NOT CONFIGURED' ? '#30D158' : '#FF453A' }
        ]}>
          {googleSheetUrl !== 'NOT CONFIGURED' ? '✓ Configured' : '✗ Not Configured'}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    margin: 16,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 4,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  warning: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  warningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningSubtext: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 18,
  },
});

