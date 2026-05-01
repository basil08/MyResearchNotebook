import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';

// Import web-specific styles
if (Platform.OS === 'web') {
  require('./_layout.web.css');
}

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';
    const isProtectedRoute = segments[0] !== 'login' && segments[0] !== undefined;

    if (!user && isProtectedRoute) {
      // Redirect to login if not authenticated and trying to access protected route
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect to main app if authenticated and on login page
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      web: {
        alignItems: 'center',
        backgroundColor: 'transparent',
      },
      default: {
        backgroundColor: 'transparent',
      },
    }),
  },
  content: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 800, // 50% of a typical 1600px screen, capped at 800px
        minWidth: 375, // Minimum mobile width
        alignSelf: 'center',
        // @ts-ignore - web-only property
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
      },
      default: {
        maxWidth: '100%',
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
