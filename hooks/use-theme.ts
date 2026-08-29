/**
 * useTheme() — the only way a component should reach a design token.
 *
 * Do not import `palette` directly in a component; do not hardcode hex.
 */
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import {
  breakpoints,
  elevation,
  layout,
  motion,
  palette,
  radius,
  shadow,
  space,
  type,
  type Breakpoint,
  type ColorScheme,
  type Colors,
  type ElevationLevel,
} from '@/constants/design';
import { useThemeMode } from '@/contexts/theme-context';

export interface Theme {
  scheme: ColorScheme;
  isDark: boolean;
  colors: Colors;
  type: typeof type;
  space: typeof space;
  radius: typeof radius;
  elevation: typeof elevation;
  motion: typeof motion;
  layout: typeof layout;
  /** Scheme-aware floating shadow. */
  shadow: (level: ElevationLevel) => object;
  /** 1px rule at the current scheme — the app's main structural device. */
  rule: { borderColor: string; borderWidth: number };
}

export function useTheme(): Theme {
  const { scheme } = useThemeMode();

  return useMemo(() => {
    const colors = palette[scheme];
    return {
      scheme,
      isDark: scheme === 'dark',
      colors,
      type,
      space,
      radius,
      elevation,
      motion,
      layout,
      shadow: (level: ElevationLevel) => shadow(level, scheme),
      rule: { borderColor: colors.hairline, borderWidth: 1 },
    };
  }, [scheme]);
}

const ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export interface Layout {
  width: number;
  height: number;
  bp: Breakpoint;
  /** Phone-shaped. Single column, bottom nav, sheets. */
  isCompact: boolean;
  /** >= md. A second pane can appear. */
  isMedium: boolean;
  /** >= lg. Left rail appears. */
  isWide: boolean;
  /** >= xl. Right aside appears. */
  isUltraWide: boolean;
  /** Horizontal page gutter for this breakpoint. */
  gutter: number;
  /** True when `bp` is at or above `min`. */
  atLeast: (min: Breakpoint) => boolean;
}

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    let bp: Breakpoint = 'xs';
    for (const key of ORDER) {
      if (width >= breakpoints[key]) bp = key;
    }
    const atLeast = (min: Breakpoint) => width >= breakpoints[min];

    return {
      width,
      height,
      bp,
      isCompact: !atLeast('md'),
      isMedium: atLeast('md'),
      isWide: atLeast('lg'),
      isUltraWide: atLeast('xl'),
      gutter: layout.gutter[bp],
      atLeast,
    };
  }, [width, height]);
}
