/**
 * Button. Four variants, and that is the whole set.
 *
 *   primary   — one per screen region. The commit action.
 *   secondary — bordered. Everything else that is a real action.
 *   ghost     — chrome. Toolbar/inline actions with no box until hovered.
 *   danger    — destructive, always behind a confirm.
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Icon, type IconName } from './icon';
import { Text } from './text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  /** Fill the available width. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  loading,
  block,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const inert = disabled || loading;
  const iconOnly = !label;

  const height = size === 'sm' ? 28 : 34;
  const padH = iconOnly ? 0 : size === 'sm' ? t.space.sm + 2 : t.space.md;

  const skin: Record<ButtonVariant, { bg: string; border: string; fg: string }> = {
    primary: {
      bg: pressed ? t.colors.accentPressed : hovered ? t.colors.accentHover : t.colors.accent,
      border: 'transparent',
      fg: t.colors.inkInverse,
    },
    secondary: {
      bg: pressed ? t.colors.wash : hovered ? t.colors.wash : 'transparent',
      border: hovered ? t.colors.hairlineStrong : t.colors.hairline,
      fg: t.colors.ink,
    },
    ghost: {
      bg: pressed || hovered ? t.colors.wash : 'transparent',
      border: 'transparent',
      fg: t.colors.inkMuted,
    },
    danger: {
      bg: pressed || hovered ? t.colors.dangerSoft : 'transparent',
      border: hovered ? t.colors.danger : t.colors.hairline,
      fg: t.colors.danger,
    },
  };

  const s = skin[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inert, busy: !!loading }}
      accessibilityLabel={label}
      disabled={inert}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        {
          height,
          minWidth: iconOnly ? height : undefined,
          paddingHorizontal: padH,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.space.xs + 2,
          borderRadius: t.radius.md,
          borderWidth: 1,
          borderColor: s.border,
          backgroundColor: s.bg,
          opacity: inert ? 0.45 : 1,
          alignSelf: block ? 'stretch' : 'flex-start',
          flexGrow: block ? 1 : 0,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={s.fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={size === 'sm' ? 'sm' : 'md'} color={s.fg} />}
          {label && (
            <Text variant="ui" style={{ color: s.fg }} numberOfLines={1}>
              {label}
            </Text>
          )}
          {iconRight && <Icon name={iconRight} size={size === 'sm' ? 'sm' : 'md'} color={s.fg} />}
        </>
      )}
    </Pressable>
  );
}
