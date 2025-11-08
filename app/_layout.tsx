import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Import web-specific styles
if (Platform.OS === 'web') {
  require('./_layout.web.css');
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </View>
    </ThemeProvider>
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
});
