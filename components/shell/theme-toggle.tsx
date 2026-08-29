/**
 * The one appearance control: system → light → dark → system.
 */
import React from 'react';

import { useThemeMode } from '@/contexts/theme-context';
import { Button } from '@/components/ui';

export function ThemeToggle() {
  const { mode, cycleMode } = useThemeMode();

  const icon = mode === 'light' ? 'light-mode' : mode === 'dark' ? 'dark-mode' : 'brightness-auto';
  const next = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={icon}
      onPress={cycleMode}
      accessibilityLabel={`Appearance: ${mode}. Switch to ${next}.`}
    />
  );
}
