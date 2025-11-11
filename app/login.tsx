import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { signIn, loading, error: authError } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSignIn = async () => {
    // Basic validation
    if (!email.trim()) {
      setLocalError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setLocalError('Please enter your password');
      return;
    }

    setLocalError(null);
    
    try {
      await signIn(email, password);
      // Navigation will happen automatically via auth state change
    } catch (err) {
      // Error is already handled by auth context
      console.error('Login error:', err);
    }
  };

  const displayError = localError || authError;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <ThemedText style={styles.title}>Research Notebook</ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>

            {displayError && (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{displayError}</ThemedText>
              </View>
            )}

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#3a3a3c' : '#d1d1d6',
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={isDark ? '#8e8e93' : '#999'}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setLocalError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#3a3a3c' : '#d1d1d6',
                  },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={isDark ? '#8e8e93' : '#999'}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setLocalError(null);
                }}
                secureTextEntry
                editable={!loading}
                onSubmitEditing={handleSignIn}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.signInButton,
                loading && styles.signInButtonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.signInButtonText}>Sign In</ThemedText>
              )}
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <ThemedText style={styles.infoText}>
                Contact your administrator to set up an account.
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c00',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});

