/**
 * Chip — a tag, keyword, filter pill or count badge.
 * Small, quiet, and never more than two tones on one screen.
 */
import React, { useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Icon, type IconName } from './icon';
import { Text } from './text';

export interface ChipProps {
  label: string;
  /** Occurrence count etc. Rendered muted after the label. */
  count?: number;
  icon?: IconName;
  selected?: boolean;
  onPress?: () => void;
  /** 0–1. Scales the background tint, for weighted keyword indexes. */
  weight?: number;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, count, icon, selected, onPress, weight, style }: ChipProps) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);

  const bg = selected
    ? t.colors.accentSoft
    : hovered && onPress
      ? t.colors.wash
      : weight != null
        ? t.colors.sunken
        : 'transparent';

  const body = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space.xs + 1,
          paddingVertical: t.space.xs - 1,
          paddingHorizontal: t.space.sm,
          borderRadius: t.radius.sm,
          borderWidth: 1,
          borderColor: selected ? t.colors.accent : t.colors.hairline,
          backgroundColor: bg,
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} size="xs" tone={selected ? 'accent' : 'faint'} />}
      <Text variant="uiSmall" tone={selected ? 'accent' : 'muted'} numberOfLines={1}>
        {label}
      </Text>
      {count != null && (
        <Text variant="uiSmall" tone="faint">
          {count}
        </Text>
      )}
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      {body}
    </Pressable>
  );
}
