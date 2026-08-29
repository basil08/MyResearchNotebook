/**
 * Icon — one glyph set (Material Icons, already bundled via @expo/vector-icons),
 * theme-aware tone, sizes tied to the type scale.
 *
 * Rule: an icon never appears alone unless it has an accessibilityLabel.
 */
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { TextTone } from './text';

export type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

/** Sizes are chosen to optically match the type scale they sit beside. */
export const iconSize = { xs: 13, sm: 16, md: 18, lg: 22, xl: 28 } as const;

export interface IconProps {
  name: IconName;
  size?: keyof typeof iconSize | number;
  tone?: TextTone;
  /** Overrides `tone`. Use when the surrounding element already picked a colour. */
  color?: string;
  style?: StyleProp<TextStyle>;
  label?: string;
}

export function Icon({ name, size = 'md', tone = 'muted', color, style, label }: IconProps) {
  const t = useTheme();

  const resolved =
    color ??
    {
      default: t.colors.ink,
      muted: t.colors.inkMuted,
      faint: t.colors.inkFaint,
      accent: t.colors.accent,
      danger: t.colors.danger,
      success: t.colors.success,
      warning: t.colors.warning,
      inverse: t.colors.inkInverse,
    }[tone];

  return (
    <MaterialIcons
      name={name}
      size={typeof size === 'number' ? size : iconSize[size]}
      color={resolved}
      style={style}
      accessibilityLabel={label}
      accessible={!!label}
    />
  );
}
