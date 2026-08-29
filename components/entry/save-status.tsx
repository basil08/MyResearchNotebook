/**
 * The stand-in for a Save button: it reports rather than asks.
 */
import { format } from 'date-fns';
import React from 'react';

import { Button, Icon, Row, Text } from '@/components/ui';
import type { SaveState } from '@/hooks/use-autosave';
import { useTheme } from '@/hooks/use-theme';

interface SaveStatusProps {
  state: SaveState;
  savedAt: Date | null;
  error: string | null;
  onRetry: () => void;
}

export function SaveStatus({ state, savedAt, error, onRetry }: SaveStatusProps) {
  const t = useTheme();

  if (state === 'error') {
    return (
      <Row gap="xs">
        <Icon name="error-outline" size="sm" tone="danger" />
        <Text variant="uiSmall" tone="danger" numberOfLines={1}>
          {error ?? 'Could not save'}
        </Text>
        <Button variant="ghost" size="sm" label="Retry" onPress={onRetry} />
      </Row>
    );
  }

  const text =
    state === 'saving'
      ? 'Saving…'
      : state === 'pending'
        ? 'Unsaved changes'
        : savedAt
          ? `Saved ${format(savedAt, 'HH:mm')}`
          : null;

  if (!text) return null;

  return (
    <Text variant="uiSmall" tone="faint" numberOfLines={1} style={{ marginRight: t.space.xs }}>
      {text}
    </Text>
  );
}
