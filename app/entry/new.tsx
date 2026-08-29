/**
 * New entry.
 *
 * Opens straight into a blank page in write mode — no wizard, no first step.
 * The row is not created until there is something to save, so abandoning this
 * screen leaves no empty rows in the sheet. Once created, the route swaps to
 * the real entry so the URL is shareable and refresh works.
 */
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';

import {
  EntryDocument,
  toDraft,
  type EntryDraft,
  type EntryMode,
} from '@/components/entry/entry-document';
import { SaveStatus } from '@/components/entry/save-status';
import { AppShell } from '@/components/shell/app-shell';
import { Button, Row } from '@/components/ui';
import { logFields } from '@/constants/design';
import { useLogs } from '@/contexts/logs-context';
import { useAutosave } from '@/hooks/use-autosave';
import { useLayout } from '@/hooks/use-theme';

const hasContent = (draft: EntryDraft) => logFields.some((f) => draft[f]?.trim());

export default function NewEntryScreen() {
  const l = useLayout();
  const router = useRouter();
  const { create, update } = useLogs();

  const [draft, setDraft] = useState<EntryDraft>(() => toDraft());
  const [mode, setMode] = useState<EntryMode>('write');

  // The draft as of right now, for the create call, which needs all of it.
  const draftRef = useRef(draft);
  draftRef.current = draft;
  // Set once the row exists; from then on patches are updates.
  const createdId = useRef<string | null>(null);

  const autosave = useAutosave<Partial<EntryDraft>>(
    useCallback(
      async (patch) => {
        if (createdId.current) {
          await update(createdId.current, patch);
          return;
        }
        const current = draftRef.current;
        // Nothing worth a row yet — a date alone is not an entry.
        if (!hasContent(current)) return;

        const created = await create(current);
        createdId.current = created.id;
        router.replace(`/entry/${created.id}?mode=write` as any);
      },
      [create, update, router]
    )
  );

  const onChange = useCallback(
    (patch: Partial<EntryDraft>) => {
      setDraft((prev) => ({ ...prev, ...patch }));
      autosave.queue(patch);
    },
    [autosave]
  );

  const goBack = useCallback(() => {
    void autosave.flush();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [autosave, router]);

  return (
    <AppShell
      barLeading={
        <Button
          variant="ghost"
          size="sm"
          icon="arrow-back"
          label={l.isMedium ? 'All entries' : undefined}
          onPress={goBack}
          accessibilityLabel="Back to all entries"
        />
      }
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
            onPress={() => {
              const next = mode === 'write' ? 'read' : 'write';
              setMode(next);
              if (next === 'read') void autosave.flush();
            }}
            accessibilityLabel={mode === 'write' ? 'Switch to read mode' : 'Switch to write mode'}
          />
        </Row>
      }
    >
      <EntryDocument draft={draft} mode={mode} onChange={onChange} onModeChange={setMode} />
    </AppShell>
  );
}
