/**
 * Theme mode: 'system' | 'light' | 'dark', persisted across sessions.
 *
 * The design language has exactly one switch. Everything else about the
 * appearance is derived from tokens, not from user settings.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import type { ColorScheme } from '@/constants/design';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'friday.theme-mode';

interface ThemeContextValue {
  /** What the user picked. */
  mode: ThemeMode;
  /** What that resolves to right now. */
  scheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  /** Cycles system → light → dark → system. */
  cycleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored);
        }
      })
      .catch(() => {
        /* storage unavailable — system default is fine */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const cycleMode = useCallback(() => {
    setModeState((current) => {
      const next: ThemeMode =
        current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const scheme: ColorScheme = mode === 'system' ? (systemScheme ?? 'light') : mode;

  const value = useMemo(
    () => ({ mode, scheme, setMode, cycleMode }),
    [mode, scheme, setMode, cycleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used inside <ThemeModeProvider>');
  }
  return ctx;
}
