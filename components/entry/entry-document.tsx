/**
 * EntryDocument — one page, all eight fields, read or write.
 *
 * This replaces the nine-screen wizard and the separate detail view. Read mode
 * shows only what has been written; write mode shows every field with its
 * prompt as a placeholder, so filling one in is a click and a keystroke rather
 * than a walk through a form.
 */
import React, { useCallback, useRef } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { Button, Row, Text } from '@/components/ui';
import { logFields, type LogField } from '@/constants/design';
import { useLayout, useTheme } from '@/hooks/use-theme';
import { calendarDate, hasTime, nowStamp, toDate, withCalendarDate } from '@/utils/entry';
import { format } from 'date-fns';
import { EntryField } from './entry-field';

export type EntryMode = 'read' | 'write';

/** The editable shape of an entry — the eight fields plus its date. */
export type EntryDraft = Record<LogField, string> & { date: string };

const DATE_HINT = 'YYYY-MM-DD';

interface EntryDocumentProps {
  draft: EntryDraft;
  mode: EntryMode;
  onChange: (patch: Partial<EntryDraft>) => void;
  onModeChange: (mode: EntryMode) => void;
  /** Shown under the title in read mode — time, edited-at and so on. */
  meta?: React.ReactNode;
}

export function EntryDocument({
  draft,
  mode,
  onChange,
  onModeChange,
  meta,
}: EntryDocumentProps) {
  const t = useTheme();
  const l = useLayout();
  const inputs = useRef<Partial<Record<LogField, TextInput | null>>>({});
  const pendingFocus = useRef<LogField | null>(null);

  const parsed = toDate(draft.date);
  const title = parsed ? format(parsed, 'EEEE, d MMMM yyyy') : draft.date || 'New entry';
  const time = parsed && hasTime(draft.date) ? format(parsed, 'HH:mm') : null;

  /** Clicking a field in read mode opens write mode with that field focused. */
  const requestEdit = useCallback(
    (field: LogField) => {
      pendingFocus.current = field;
      onModeChange('write');
    },
    [onModeChange]
  );

  const registerInput = useCallback(
    (field: LogField) => (input: TextInput | null) => {
      inputs.current[field] = input;
      if (input && pendingFocus.current === field) {
        pendingFocus.current = null;
        // Let the mode switch paint before stealing focus.
        setTimeout(() => input.focus(), 0);
      }
    },
    []
  );

  const visible = mode === 'write' ? logFields : logFields.filter((f) => draft[f]?.trim());
  const empty = visible.length === 0;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: l.gutter,
        paddingTop: t.space.xl,
        paddingBottom: t.space.huge,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: '100%', maxWidth: t.layout.measure, alignSelf: 'center' }}>
        <Text variant="display">{title}</Text>

        <Row gap="sm" wrap style={{ marginTop: t.space.xs, marginBottom: t.space.xl }}>
          {mode === 'write' ? (
            <Row gap="sm">
              <Text variant="label" tone="faint">
                Date
              </Text>
              <TextInput
                value={calendarDate(draft.date)}
                onChangeText={(day) => onChange({ date: withCalendarDate(draft.date, day) })}
                placeholder={DATE_HINT}
                placeholderTextColor={t.colors.inkFaint}
                selectionColor={t.colors.accent}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel={`Entry date, ${DATE_HINT}`}
                style={[
                  t.type.mono,
                  {
                    color: parsed ? t.colors.ink : t.colors.danger,
                    borderWidth: 1,
                    borderColor: t.colors.hairline,
                    borderRadius: t.radius.sm,
                    paddingVertical: 2,
                    paddingHorizontal: t.space.sm,
                    minWidth: 112,
                  },
                ]}
              />
              {/*
                The time is recorded, not edited. It is the moment the entry was
                started, which is a fact about the entry rather than a setting;
                moving the day keeps it. Entries written before Milestone 4 have
                no time at all and simply show nothing here.
              */}
              {time && (
                <Text variant="mono" tone="faint">
                  {time}
                </Text>
              )}
              {!parsed && (
                <Text variant="uiSmall" tone="danger">
                  Use {DATE_HINT}
                </Text>
              )}
            </Row>
          ) : (
            meta
          )}
        </Row>

        {empty ? (
          <View style={{ gap: t.space.md, alignItems: 'flex-start' }}>
            <Text variant="body" tone="faint">
              This entry is empty.
            </Text>
            <Button
              variant="secondary"
              label="Start writing"
              icon="edit"
              onPress={() => onModeChange('write')}
            />
          </View>
        ) : (
          visible.map((field) => (
            <EntryField
              key={field}
              field={field}
              value={draft[field] ?? ''}
              mode={mode}
              onChange={(value) => onChange({ [field]: value } as Partial<EntryDraft>)}
              onRequestEdit={requestEdit}
              inputRef={registerInput(field)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

/**
 * Build a draft from a stored log, or a new one stamped with the current
 * local date and time.
 *
 * An existing `date` is carried through untouched. Normalising it here would
 * silently rewrite every row the moment it was opened — which is a migration,
 * and we are deliberately not running one. The editor renders the calendar day
 * through `calendarDate()` instead, and only writes a new value when the user
 * actually changes the day.
 */
export function toDraft(source?: Partial<EntryDraft> & { date?: string }): EntryDraft {
  const base = {} as EntryDraft;
  for (const field of logFields) base[field] = String(source?.[field] ?? '');
  base.date = source?.date ? String(source.date) : nowStamp();
  return base;
}
