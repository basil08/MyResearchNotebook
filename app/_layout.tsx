import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';

import { AttachmentsProvider } from '@/contexts/attachments-context';
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

/** Tab title per route. Kept beside the routes it describes. */
function titleFor(segments: string[]): string {
  const [root, child] = segments;
  if (root === 'login') return 'Sign in · Friday';
  if (root === 'about') return 'About · Friday';
  if (root === 'keywords') return 'Index · Friday';
  if (root === 'entry') return child === 'new' ? 'New entry · Friday' : 'Entry · Friday';
  return 'Friday';
}

function RootLayoutNav() {
  const t = useTheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  /*
   * Browser tab title.
   *
   * Set imperatively rather than through `Stack.Screen` options: expo-router
   * renders an empty react-helmet <title> ahead of the one in `+html.tsx`, and
   * with headers hidden the screen `title` option never populates it — so the
   * tab ends up blank. One mechanism, verified in the browser.
   */
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.title = titleFor(segments as string[]);
  }, [segments]);

  useEffect(() => {
    if (loading) return;
    // `about` is public: it explains what Friday is, which is exactly what
    // someone who cannot get past the sign-in screen may need to read.
    const onLogin = segments[0] === 'login';
    const isPublic = onLogin || segments[0] === 'about';
    if (!user && !isPublic) router.replace('/login');
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
          <Stack.Screen name="about" />
          <Stack.Screen name="keywords" />
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
          <AttachmentsProvider>
            <RootLayoutNav />
          </AttachmentsProvider>
        </LogsProvider>
      </AuthProvider>
    </ThemeModeProvider>
  );
}
