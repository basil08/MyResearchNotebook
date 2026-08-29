/**
 * Text — the only text component. Every string in the app renders through it.
 *
 *   <Text variant="title">Thu 28 Aug 2026</Text>
 *   <Text variant="label" tone="muted">Read</Text>
 */
import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import type { TypeVariant } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

export type TextTone =
  | 'default'
  | 'muted'
  | 'faint'
  | 'accent'
  | 'danger'
  | 'success'
  | 'warning'
  | 'inverse';

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  tone?: TextTone;
  /** Centre within its own box. */
  center?: boolean;
  children?: React.ReactNode;
}

export function Text({
  variant = 'body',
  tone = 'default',
  center,
  style,
  ...rest
}: TextProps) {
  const t = useTheme();

  const color = {
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
    <RNText
      style={[
        t.type[variant] as TextStyle,
        { color },
        center && { textAlign: 'center' },
        style,
      ]}
      {...rest}
    />
  );
}
