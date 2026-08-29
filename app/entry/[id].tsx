/**
 * Entry page — read and write are the same page.
 *
 * There is no Save button and no separate edit screen. Edits autosave; the bar
 * reports what the save is doing. `?mode=write` opens straight into writing,
 * which is how a freshly created entry arrives here.
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import {
  EntryDocument,
  toDraft,
  type EntryDraft,
  type EntryMode,
} from '@/components/entry/entry-document';
import { SaveStatus } from '@/components/entry/save-status';
import { AppShell } from '@/components/shell/app-shell';
import { Button, Row, Text } from '@/components/ui';
import { useLogs } from '@/contexts/logs-context';
import { useAutosave } from '@/hooks/use-autosave';
import { useLayout, useTheme } from '@/hooks/use-theme';
import { showAlert, showSimpleAlert } from '@/utils/alert';
import { formatEditedAt, formatEntryTime, formatRowDate } from '@/utils/entry';

export default function EntryScreen() {
  const t = useTheme();
  const l = useLayout();
  const router = useRouter();
  const { id, mode: modeParam } = useLocalSearchParams<{ id: string; mode?: string }>();
  const { getById, loading, update, remove } = useLogs();

  const log = getById(String(id));
  const [mode, setMode] = useState<EntryMode>(modeParam === 'write' ? 'write' : 'read');
  const [draft, setDraft] = useState<EntryDraft | null>(null);

  // Seed the draft once the log is available. Later cache updates must not
  // clobber what is currently being typed, so this only ever runs on arrival.
  const seeded = useRef<string | null>(null);
  useEffect(() => {
    if (!log || seeded.current === log.id) return;
    seeded.current = log.id;
    setDraft(toDraft(log));
  }, [log]);

  const autosave = useAutosave<Partial<EntryDraft>>(
    useCallback(
      async (patch) => {
        if (!log) return;
        await update(log.id, patch);
      },
      [log, update]
    )
  );

  const onChange = useCallback(
    (patch: Partial<EntryDraft>) => {
      setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
      autosave.queue(patch);
    },
    [autosave]
  );

  // Leaving write mode should not wait out the debounce.
  const changeMode = useCallback(
    (next: EntryMode) => {
      setMode(next);
      if (next === 'read') void autosave.flush();
    },
    [autosave]
  );

  const goBack = useCallback(() => {
    void autosave.flush();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [autosave, router]);

  const handleDelete = useCallback(() => {
    if (!log) return;
    showAlert(
      'Delete this entry?',
      `The entry for ${formatRowDate(log)} will be removed from your notebook. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            remove(log.id)
              .then(() => router.replace('/'))
              .catch((e: any) =>
                showSimpleAlert('Could not delete', e?.message ?? 'The entry is still there.')
              );
          },
        },
      ]
    );
  }, [log, remove, router]);

  const back = (
    <Button
      variant="ghost"
      size="sm"
      icon="arrow-back"
      label={l.isMedium ? 'All entries' : undefined}
      onPress={goBack}
      accessibilityLabel="Back to all entries"
    />
  );

  if (loading && !log) {
    return (
      <AppShell barLeading={back}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={t.colors.accent} />
        </View>
      </AppShell>
    );
  }

  if (!log || !draft) {
    return (
      <AppShell barLeading={back}>
        <View style={{ padding: l.gutter, paddingTop: t.space.huge, gap: t.space.md }}>
          <Text variant="title">That entry is not here</Text>
          <Text variant="body" tone="muted">
            It may have been deleted, or the link points at an id that no longer exists.
          </Text>
          <View style={{ marginTop: t.space.sm, alignSelf: 'flex-start' }}>
            <Button variant="secondary" label="Back to all entries" onPress={() => router.replace('/')} />
          </View>
        </View>
      </AppShell>
    );
  }

  const time = formatEntryTime(log);
  const edited = formatEditedAt(log);

  return (
    <AppShell
      barLeading={back}
      barActions={
        <Row gap="xs">
          <SaveStatus
            state={autosave.state}
            savedAt={autosave.savedAt}
            error={autosave.error}
            onRetry={() => void autosave.flush()}
          />
          <Button
            variant={mode === 'write' ? 'primary' : 'secondary'}
            size="sm"
            icon={mode === 'write' ? 'visibility' : 'edit'}
            label={l.isMedium ? (mode === 'write' ? 'Read' : 'Edit') : undefined}
            onPress={() => changeMode(mode === 'write' ? 'read' : 'write')}
            accessibilityLabel={mode === 'write' ? 'Switch to read mode' : 'Switch to write mode'}
          />
          <Button
            variant="ghost"
            size="sm"
            icon="delete-outline"
            onPress={handleDelete}
            accessibilityLabel="Delete entry"
          />
        </Row>
      }
    >
      <EntryDocument
        draft={draft}
        mode={mode}
        onChange={onChange}
        onModeChange={changeMode}
        meta={
          <Row gap="sm">
            {time && (
              <Text variant="uiSmall" tone="faint">
                {time}
              </Text>
            )}
            {time && edited && (
              <Text variant="uiSmall" tone="faint">
                ·
              </Text>
            )}
            {edited && (
              <Text variant="uiSmall" tone="faint">
                {edited}
              </Text>
            )}
          </Row>
        }
      />
    </AppShell>
  );
}
