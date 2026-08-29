import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { LogsProvider } from '@/contexts/logs-context';
import { ThemeModeProvider } from '@/contexts/theme-context';
import { palette } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

if (Platform.OS === 'web') {
  require('./_layout.web.css');
}

/**
 * Navigation themes derived from our own tokens, so the container background
 * behind a screen transition never flashes the wrong ground.
 */
const navLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.light.ground,
    card: palette.light.ground,
    text: palette.light.ink,
    border: palette.light.hairline,
    primary: palette.light.accent,
  },
};

const navDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.dark.ground,
    card: palette.dark.ground,
    text: palette.dark.ink,
    border: palette.dark.hairline,
    primary: palette.dark.accent,
  },
};

function RootLayoutNav() {
  const t = useTheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const onLogin = segments[0] === 'login';
    if (!user && !onLogin) router.replace('/login');
    else if (user && onLogin) router.replace('/');
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.colors.ground,
        }}
      >
        <ActivityIndicator size="large" color={t.colors.accent} />
      </View>
    );
  }

  return (
    <ThemeProvider value={t.isDark ? navDark : navLight}>
      {/*
        ADR-004: no fixed-width centred column here. The shell fills the
        viewport and each screen caps its own reading column.
      */}
      <View style={{ flex: 1, backgroundColor: t.colors.ground }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: t.colors.ground },
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="index" />
          <Stack.Screen name="entry/new" />
          <Stack.Screen name="entry/[id]" />
        </Stack>
        <StatusBar style={t.isDark ? 'light' : 'dark'} />
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <LogsProvider>
          <RootLayoutNav />
        </LogsProvider>
      </AuthProvider>
    </ThemeModeProvider>
  );
}
