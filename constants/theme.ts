/**
 * DEPRECATED compatibility shim.
 *
 * The design language now lives in `constants/design.ts`, reached through
 * `useTheme()` from `@/hooks/use-theme`. This file only exists so the
 * remaining Expo-template screens keep compiling while they are replaced.
 * Do not add anything to it. Delete once nothing imports it.
 */

import { fonts, palette } from '@/constants/design';

export const Colors = {
  light: {
    text: palette.light.ink,
    background: palette.light.ground,
    tint: palette.light.accent,
    icon: palette.light.inkMuted,
    tabIconDefault: palette.light.inkFaint,
    tabIconSelected: palette.light.accent,
  },
  dark: {
    text: palette.dark.ink,
    background: palette.dark.ground,
    tint: palette.dark.accent,
    icon: palette.dark.inkMuted,
    tabIconDefault: palette.dark.inkFaint,
    tabIconSelected: palette.dark.accent,
  },
};

export const Fonts = {
  sans: fonts.sans,
  serif: fonts.serif,
  rounded: fonts.sans,
  mono: fonts.mono,
};
