/**
 * Entry helpers — date handling and the list-row summary.
 *
 * ## The `date` field
 *
 * `date` is a TEXT column and must stay one. Since Milestone 4 new entries
 * store a full local timestamp with its UTC offset:
 *
 *     2026-08-29T14:32:07+05:30
 *
 * The offset is what makes it unambiguous: the wall clock the writer saw is
 * recoverable no matter where the row is later read.
 *
 * ### Why that exact shape
 *
 * Google Sheets silently coerces anything it recognises as a date into a real
 * date cell, and Apps Script then serialises that cell back as a UTC ISO
 * string — which is how a "2026-08-27" entry comes back as
 * "2026-08-26T18:30:00.000Z" and displays a day early. A space-separated
 * "2026-08-29 14:32" is coerced exactly this way. The `T`-separated form with
 * an offset is not, so it survives as text. `created_at` has always used the
 * same shape, which is the standing proof it round-trips intact.
 *
 * ### What is in the column
 *
 * No migration was run (deliberately), so all four of these are live and every
 * read has to cope with them:
 *
 *   1. `2026-08-29T14:32:07+05:30`  new entries — date and wall clock
 *   2. `2026-08-29`                 older entries — date only
 *   3. `2026-08-28T18:30:00.000Z`   older rows Sheets coerced into date cells
 *   4. anything a human typed into the cell by hand
 *
 * Every read goes through `toDate()`. Nothing calls `parseISO` on sheet data
 * directly.
 */

import { fieldMeta, logFields, type LogField } from '@/constants/design';
import type { ResearchLog } from '@/types/research-log';
import { format, isValid, parseISO } from 'date-fns';

/** Bare calendar dates, which must NOT be shifted into local time. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** "2026-08-29 14:32" or with seconds — a hand-typed local time, no offset. */
const LOCAL_DATETIME = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;

/** Carries an explicit time of day, whatever the notation. */
const HAS_CLOCK = /\d{2}:\d{2}/;

/**
 * Parse anything the sheet might hand back into a Date, or null.
 *
 * A bare "YYYY-MM-DD" is read as local midnight, never UTC — otherwise
 * everyone west of Greenwich sees every entry a day early. A time with no
 * offset is likewise read as local, because that is what whoever typed it
 * meant.
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

  const naive = LOCAL_DATETIME.exec(raw);
  if (naive) {
    const [, y, m, d, hh, mm, ss] = naive;
    const local = new Date(+y, +m - 1, +d, +hh, +mm, ss ? +ss : 0);
    return isValid(local) ? local : null;
  }

  const parsed = parseISO(raw);
  if (isValid(parsed)) return parsed;

  const fallback = new Date(raw);
  return isValid(fallback) ? fallback : null;
}

/** The storage format for a new or re-timed entry. */
const STAMP = "yyyy-MM-dd'T'HH:mm:ssXXX";

/** Now, as a local timestamp with offset. What new entries record. */
export function nowStamp(): string {
  return format(new Date(), STAMP);
}

/**
 * Does this stored value carry a time of day?
 *
 * A date-only row genuinely has no time — we do not know when it was written,
 * and inventing one would be worse than showing none.
 */
export function hasTime(value: string | undefined | null): boolean {
  if (!value) return false;
  const raw = String(value).trim();
  if (DATE_ONLY.test(raw)) return false;
  return HAS_CLOCK.test(raw) && toDate(raw) !== null;
}

/** The calendar day of a stored value, as "YYYY-MM-DD". For editing. */
export function calendarDate(value: string | undefined | null): string {
  const d = toDate(value);
  return d ? format(d, 'yyyy-MM-dd') : String(value ?? '').trim();
}

/**
 * Move an entry to a different calendar day, keeping its time of day.
 *
 * A row that never had a time stays date-only. Attaching "now" to it would be
 * a fabrication — that is not when it was written — and it would quietly
 * migrate old rows, which we explicitly are not doing.
 */
export function withCalendarDate(existing: string, nextDay: string): string {
  const day = nextDay.trim();
  if (!DATE_ONLY.test(day)) return day; // mid-typing; store verbatim
  if (!hasTime(existing)) return day;

  const previous = toDate(existing);
  if (!previous) return day;

  const [y, m, d] = day.split('-').map(Number);
  const moved = new Date(
    y,
    m - 1,
    d,
    previous.getHours(),
    previous.getMinutes(),
    previous.getSeconds()
  );
  return isValid(moved) ? format(moved, STAMP) : day;
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
 * Wall-clock time for the entry, or null when we genuinely do not know it.
 *
 * New entries carry their own time in `date`, so that is authoritative.
 *
 * Pre-Milestone-4 rows are date-only. For those `created_at` is the only
 * candidate, and it is only the entry's time if the entry was written on the
 * day it is about — otherwise a back-filled entry, or one written either side
 * of local midnight, shows a time belonging to a different day right next to
 * the date. Where that check fails we show nothing rather than something
 * wrong, and those rows stay that way: no backfill was run.
 */
export function formatEntryTime(log: ResearchLog): string | null {
  if (hasTime(log.date)) {
    const own = toDate(log.date);
    if (own) return format(own, 'HH:mm');
  }

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
