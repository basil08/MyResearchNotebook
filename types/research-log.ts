export interface ResearchLog {
  id: string;
  created_by: string;
  /**
   * The day the entry is about, and — since Milestone 4 — the time it was
   * started: `2026-08-29T14:32:07+05:30`.
   *
   * A TEXT column, and it must stay one. Sheets coerces anything it recognises
   * as a date into a real date cell, which Apps Script then serialises back as
   * a UTC ISO string, shifting the day. See the header of `utils/entry.ts`.
   *
   * No migration was run, so older rows are still date-only (`2026-08-29`) or
   * a coerced UTC datetime. Read every value through `toDate()`.
   */
  date: string;
  plan_to_read: string;
  plan_to_do: string;
  did_read: string;
  learned_today: string;
  new_thoughts: string;
  coded_today: string;
  wrote_or_taught: string;
  try_tomorrow: string;
  /** UTC ISO datetime, set once when the row is created. */
  created_at: string;
  /** UTC ISO datetime, rewritten on every save. */
  updated_at: string;
}

export interface CreateResearchLogInput {
  /** Local timestamp with offset — build it with `nowStamp()`. */
  date: string;
  plan_to_read: string;
  plan_to_do: string;
  did_read: string;
  learned_today: string;
  new_thoughts: string;
  coded_today: string;
  wrote_or_taught: string;
  try_tomorrow: string;
}

export interface UpdateResearchLogInput extends Partial<CreateResearchLogInput> {
  id: string;
}

export interface FilterOptions {
  dateFrom?: string;
  dateTo?: string;
}

