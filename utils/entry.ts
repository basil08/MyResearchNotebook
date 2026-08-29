/**
 * Entry helpers — date handling and the list-row summary.
 *
 * Date handling is deliberately defensive. Google Apps Script serialises a
 * Sheets date *cell* as a full JS Date, so `date` arrives as a UTC ISO string
 * ("2026-08-27T18:30:00.000Z") that is timezone-shifted off the day the user
 * actually meant. Older rows may instead be a plain "YYYY-MM-DD" string, and
 * a hand-edited cell can be anything at all. Every read goes through
 * `toDate()`; nothing calls `parseISO` directly on sheet data.
 *
 * The proper fix (an explicit wall-clock field, migrated) is Milestone 4.
 */

import { fieldMeta, logFields, type LogField } from '@/constants/design';
import type { ResearchLog } from '@/types/research-log';
import { format, isValid, parseISO } from 'date-fns';

/** Bare calendar dates, which must NOT be shifted into local time. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse anything the sheet might hand back into a Date, or null.
 *
 * A bare "YYYY-MM-DD" is read as local midnight, never UTC — otherwise
 * everyone west of Greenwich sees every entry a day early.
 */
export function toDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  if (DATE_ONLY.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number);
    const local = new Date(y, m - 1, d);
    return isValid(local) ? local : null;
  }

  const parsed = parseISO(raw);
  if (isValid(parsed)) return parsed;

  const fallback = new Date(raw);
  return isValid(fallback) ? fallback : null;
}

/** "Thu 28 Aug" — the list row. */
export function formatRowDate(log: ResearchLog): string {
  const d = toDate(log.date);
  return d ? format(d, 'EEE d MMM') : String(log.date ?? 'Undated');
}

/** "Thursday, 28 August 2026" — the entry page. */
export function formatFullDate(log: ResearchLog): string {
  const d = toDate(log.date);
  return d ? format(d, 'EEEE, d MMMM yyyy') : String(log.date ?? 'Undated');
}

/** Year, for list grouping. */
export function entryYear(log: ResearchLog): string {
  const d = toDate(log.date);
  return d ? format(d, 'yyyy') : '—';
}

/** Month bucket key, for list grouping: "2026-08". */
export function entryMonthKey(log: ResearchLog): string {
  const d = toDate(log.date);
  return d ? format(d, 'yyyy-MM') : 'undated';
}

/** "August 2026" */
export function formatMonthLabel(key: string): string {
  if (key === 'undated') return 'Undated';
  const [y, m] = key.split('-').map(Number);
  return format(new Date(y, m - 1, 1), 'MMMM yyyy');
}

/**
 * Wall-clock time for the entry, if we have a trustworthy one.
 *
 * `created_at` is a real ISO datetime written by the client, so it is the
 * only usable source — `date` is not, per the note at the top of this file.
 *
 * But `created_at` is only the entry's time if it was written on the day the
 * entry is *about*. A back-filled entry, or one written either side of local
 * midnight, would otherwise show a time belonging to a different day right
 * next to the date. In that case we show nothing rather than something wrong.
 *
 * Milestone 4 replaces this with an explicit wall-clock field.
 */
export function formatEntryTime(log: ResearchLog): string | null {
  const created = toDate(log.created_at);
  const on = toDate(log.date);
  if (!created || !on) return null;
  const sameDay =
    created.getFullYear() === on.getFullYear() &&
    created.getMonth() === on.getMonth() &&
    created.getDate() === on.getDate();
  return sameDay ? format(created, 'HH:mm') : null;
}

/** "edited 28 Aug, 14:32" — only when it differs from creation. */
export function formatEditedAt(log: ResearchLog): string | null {
  const created = toDate(log.created_at);
  const updated = toDate(log.updated_at);
  if (!updated) return null;
  if (created && Math.abs(updated.getTime() - created.getTime()) < 60_000) return null;
  return `edited ${format(updated, 'd MMM, HH:mm')}`;
}

/** Sort newest first, undated last. */
export function byDateDesc(a: ResearchLog, b: ResearchLog): number {
  const da = toDate(a.date)?.getTime();
  const db = toDate(b.date)?.getTime();
  if (da == null && db == null) return 0;
  if (da == null) return 1;
  if (db == null) return -1;
  if (db !== da) return db - da;
  // Same day: fall back to creation order so the list is stable.
  return (toDate(b.created_at)?.getTime() ?? 0) - (toDate(a.created_at)?.getTime() ?? 0);
}

export interface SummaryLine {
  field: LogField;
  label: string;
  value: string;
}

/** Collapse newlines and runs of whitespace so a paragraph fits on one line. */
function flatten(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * The list-row summary: the leading substring of each filled field, in field
 * order, one line each.
 *
 * No summarising and no re-ordering — the first words the user wrote are the
 * ones shown, because that is what they will recognise. Fields can be long
 * paragraphs; the row truncates and the full text lives on the entry page.
 */
export function summaryLines(log: ResearchLog, max = 4): SummaryLine[] {
  const lines: SummaryLine[] = [];
  for (const field of logFields) {
    const raw = log[field];
    if (!raw) continue;
    const value = flatten(String(raw));
    if (!value) continue;
    lines.push({ field, label: fieldMeta[field].short, value });
    if (lines.length === max) break;
  }
  return lines;
}

/** How many filled fields the row could not show. */
export function overflowCount(log: ResearchLog, shown: number): number {
  const filled = logFields.filter((f) => String(log[f] ?? '').trim()).length;
  return Math.max(0, filled - shown);
}

/** Every filled field, for the entry page and (later) the search index. */
export function filledFields(log: ResearchLog): LogField[] {
  return logFields.filter((f) => String(log[f] ?? '').trim());
}

/** True when the entry has no content at all. */
export function isEmptyEntry(log: ResearchLog): boolean {
  return filledFields(log).length === 0;
}
