/**
 * Structural primitives. Structure is hairlines and space — not shadows.
 */
import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import type { ElevationLevel } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

export type SurfaceLevel = 'ground' | 'raised' | 'sunken' | 'transparent';

export interface SurfaceProps extends ViewProps {
  level?: SurfaceLevel;
  /** Draw the 1px rule around it. */
  bordered?: boolean;
  /** Only for things that genuinely float above the page. */
  float?: ElevationLevel;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Uniform inner padding from the space scale. */
  padding?: keyof ReturnType<typeof useTheme>['space'];
  children?: React.ReactNode;
}

export function Surface({
  level = 'ground',
  bordered,
  float = 'none',
  radius = 'none',
  padding,
  style,
  ...rest
}: SurfaceProps) {
  const t = useTheme();

  const backgroundColor = {
    ground: t.colors.ground,
    raised: t.colors.surface,
    sunken: t.colors.sunken,
    transparent: 'transparent',
  }[level];

  return (
    <View
      style={[
        { backgroundColor, borderRadius: t.radius[radius] },
        bordered && { borderWidth: 1, borderColor: t.colors.hairline },
        padding != null && { padding: t.space[padding] },
        float !== 'none' && (t.shadow(float) as ViewStyle),
        style,
      ]}
      {...rest}
    />
  );
}

export interface DividerProps extends ViewProps {
  /** Emphasised rule, for a real section break. */
  strong?: boolean;
  vertical?: boolean;
  /** Vertical margin from the space scale. */
  spacing?: keyof ReturnType<typeof useTheme>['space'];
}

export function Divider({ strong, vertical, spacing, style, ...rest }: DividerProps) {
  const t = useTheme();
  const color = strong ? t.colors.hairlineStrong : t.colors.hairline;
  const gap = spacing != null ? t.space[spacing] : 0;

  return (
    <View
      accessibilityRole="none"
      style={[
        vertical
          ? { width: 1, alignSelf: 'stretch', backgroundColor: color, marginHorizontal: gap }
          : { height: 1, alignSelf: 'stretch', backgroundColor: color, marginVertical: gap },
        style,
      ]}
      {...rest}
    />
  );
}

/** Horizontal flex row with a token gap. */
export function Row({
  gap = 'sm',
  align = 'center',
  justify,
  wrap,
  style,
  ...rest
}: ViewProps & {
  gap?: keyof ReturnType<typeof useTheme>['space'];
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: align,
          justifyContent: justify,
          gap: t.space[gap],
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
      {...rest}
    />
  );
}

/** Vertical flex stack with a token gap. */
export function Stack({
  gap = 'md',
  align,
  style,
  ...rest
}: ViewProps & {
  gap?: keyof ReturnType<typeof useTheme>['space'];
  align?: ViewStyle['alignItems'];
}) {
  const t = useTheme();
  return (
    <View style={[{ flexDirection: 'column', alignItems: align, gap: t.space[gap] }, style]} {...rest} />
  );
}
