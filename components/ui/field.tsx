/**
 * Field — text input.
 *
 * Two presentations:
 *   'boxed'    — a conventional bordered input. For forms, filters, search.
 *   'seamless' — Notion-style. No chrome at rest; a soft wash on hover and a
 *                hairline on focus. This is what the entry editor uses, so
 *                reading and writing look like the same page.
 */
import React, { useState } from 'react';
import {
  Platform,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import type { TypeVariant } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './text';

export interface FieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  presentation?: 'boxed' | 'seamless';
  variant?: TypeVariant;
  /** Grows with content instead of scrolling. Web only; native falls back to fixed rows. */
  autoGrow?: boolean;
  minHeight?: number;
  hint?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export function Field({
  label,
  presentation = 'boxed',
  variant = 'body',
  autoGrow,
  minHeight,
  hint,
  error,
  containerStyle,
  style,
  multiline,
  editable = true,
  onFocus,
  onBlur,
  ...rest
}: FieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const seamless = presentation === 'seamless';

  const borderColor = error
    ? t.colors.danger
    : focused
      ? seamless
        ? t.colors.hairlineStrong
        : t.colors.accent
      : seamless
        ? 'transparent'
        : t.colors.hairline;

  const backgroundColor = seamless
    ? focused
      ? t.colors.surface
      : hovered && editable
        ? t.colors.wash
        : 'transparent'
    : t.colors.surface;

  return (
    <View style={containerStyle}>
      {label && (
        <Text variant="label" tone="muted" style={{ marginBottom: t.space.xs + 2 }}>
          {label}
        </Text>
      )}
      <View
        // @ts-expect-error RN-Web hover props
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <TextInput
          multiline={multiline}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={t.colors.inkFaint}
          selectionColor={t.colors.accent}
          style={[
            t.type[variant],
            {
              color: t.colors.ink,
              backgroundColor,
              borderWidth: 1,
              borderColor,
              borderRadius: seamless ? t.radius.sm : t.radius.md,
              paddingVertical: seamless ? t.space.xs + 2 : t.space.sm + 2,
              paddingHorizontal: seamless ? t.space.sm : t.space.md,
              minHeight: minHeight ?? (multiline ? 72 : undefined),
              textAlignVertical: 'top',
            },
            Platform.OS === 'web' && {
              outlineStyle: 'none',
              transitionProperty: 'background-color, border-color',
              transitionDuration: `${t.motion.duration.fast}ms`,
              ...(autoGrow && multiline ? { height: 'auto', overflow: 'hidden' } : null),
            },
            style,
          ] as any}
          {...rest}
        />
      </View>
      {(hint || error) && (
        <Text
          variant="uiSmall"
          tone={error ? 'danger' : 'faint'}
          style={{ marginTop: t.space.xs + 2 }}
        >
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}
