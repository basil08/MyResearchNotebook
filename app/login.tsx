/**
 * Sign in.
 *
 * The first thing anyone sees, so it carries the wordmark and nothing else.
 * Accounts are provisioned in Firebase by hand — there is deliberately no
 * sign-up path here.
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { ThemeToggle } from '@/components/shell/theme-toggle';
import { Button, Field, Icon, Row, Text } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const t = useTheme();
  const { signIn, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim()) {
      setLocalError('Enter the email address your account was set up with.');
      return;
    }
    if (!password) {
      setLocalError('Enter your password.');
      return;
    }
    setLocalError(null);
    try {
      await signIn(email.trim(), password);
      // The root layout redirects once auth state changes.
    } catch {
      // Surfaced through `authError`.
    }
  };

  const displayError = localError ?? authError;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.ground }}>
      <Row justify="flex-end" style={{ height: t.layout.barHeight, paddingHorizontal: t.space.lg }}>
        <ThemeToggle />
      </Row>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: t.space.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '100%', maxWidth: 380, alignSelf: 'center' }}>
            <Text variant="display" style={{ marginBottom: t.space.xs }}>
              Friday
            </Text>
            <Text variant="body" tone="muted" style={{ marginBottom: t.space.xxl }}>
              Your research notebook.
            </Text>

            {displayError && (
              <Row
                gap="sm"
                align="flex-start"
                style={{
                  borderLeftWidth: 2,
                  borderLeftColor: t.colors.danger,
                  backgroundColor: t.colors.dangerSoft,
                  padding: t.space.md,
                  marginBottom: t.space.lg,
                }}
              >
                <Icon name="error-outline" size="sm" tone="danger" />
                <Text variant="uiSmall" tone="danger" style={{ flex: 1 }}>
                  {displayError}
                </Text>
              </Row>
            )}

            <Field
              label="Email"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setLocalError(null);
              }}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              editable={!loading}
              containerStyle={{ marginBottom: t.space.lg }}
            />

            <Field
              label="Password"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setLocalError(null);
              }}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="current-password"
              editable={!loading}
              onSubmitEditing={handleSignIn}
              returnKeyType="go"
              containerStyle={{ marginBottom: t.space.xl }}
            />

            <Button
              variant="primary"
              label="Sign in"
              block
              loading={loading}
              onPress={handleSignIn}
            />

            <Text variant="uiSmall" tone="faint" style={{ marginTop: t.space.xl }}>
              Accounts are set up by an administrator. If you cannot get in, ask them to
              check your address is registered.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
