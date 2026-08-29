/**
 * The keyword index — what this notebook is actually about.
 *
 * ## Ranking
 *
 * Ranking by raw occurrence does not work. On a corpus of research notes the
 * top of that list is `paper`, `read`, `work`, `think` — vocabulary that says
 * what kind of document this is, not what any of it is about. Stopwords do not
 * help, because these are not stopwords.
 *
 * `df × idf` was tried next and is also wrong, in a way that is easy to miss.
 * Because idf collapses as a term approaches every entry, that product peaks
 * at roughly half the corpus — so it rewards a word for sitting at a particular
 * frequency rather than for mattering. Tested against a corpus with a planted
 * theme, the top of the list came back `interesting`, `took`: filler that
 * happened to appear in about half the entries, ranked above the actual
 * subject.
 *
 * What separates a theme from filler is not how many entries contain it but how
 * *concentrated* it is. A theme is used repeatedly inside the entries about it;
 * filler is used once, everywhere. So the weight is collection-level TF-IDF —
 * **total occurrences × idf** — which rewards that concentration and still
 * suppresses anything spread thinly across everything.
 *
 * The number shown to the reader stays plain document frequency, "in 14
 * entries", because that is the fact they can go and check. The weighting only
 * decides the order and the bar length.
 *
 * ## Why not the TF-IDF weights already in the index
 *
 * Those are per-document and L2-normalised, which is right for ranking
 * documents against a query and wrong for ranking terms against a corpus. This
 * is a collection-level question, so it uses collection-level numbers.
 */

import type { SearchIndex } from '@/utils/search';

export interface Keyword {
  /** The stem — what search matches on, and the stable identity. */
  term: string;
  /** The spelling to show, e.g. `compression` rather than `compress`. */
  label: string;
  /** How many entries contain it. */
  entries: number;
  /** Total occurrences across the corpus. */
  occurrences: number;
  /** Ranking score, `occurrences × idf`. */
  weight: number;
  /** `weight` scaled to 0–1 against the strongest keyword, for bar lengths. */
  relative: number;
}

export interface KeywordOptions {
  /**
   * A term appearing in only one entry is not a theme, it is a detail. Two is
   * the lowest threshold that means "this came back".
   */
  minEntries?: number;
  limit?: number;
}

/**
 * Rank the corpus vocabulary by how strongly each term characterises it.
 *
 * Returns an empty list for a corpus too small to have themes — with fewer
 * than three entries every word looks equally important, and showing that is
 * worse than showing nothing.
 */
export function keywordIndex(
  index: SearchIndex,
  { minEntries = 2, limit = 40 }: KeywordOptions = {}
): Keyword[] {
  if (index.size < 3) return [];

  const scored: Keyword[] = [];
  for (const [term, entries] of index.df) {
    if (entries < minEntries) continue;
    const idf = index.idf.get(term);
    const occurrences = index.tf.get(term);
    if (idf === undefined || occurrences === undefined) continue;

    scored.push({
      term,
      label: index.display.get(term) ?? term,
      entries,
      occurrences,
      weight: occurrences * idf,
      relative: 0,
    });
  }

  scored.sort((a, b) => b.weight - a.weight || b.entries - a.entries || a.label.localeCompare(b.label));
  const top = scored.slice(0, limit);

  const strongest = top[0]?.weight ?? 1;
  for (const keyword of top) {
    keyword.relative = strongest > 0 ? keyword.weight / strongest : 0;
  }
  return top;
}

/** The ids of every entry containing a term. */
export function entriesWithTerm(index: SearchIndex, term: string): Set<string> {
  const ids = new Set<string>();
  for (const posting of index.postings.get(term) ?? []) {
    const log = index.logs[posting.doc];
    if (log) ids.add(log.id);
  }
  return ids;
}

/** The display spelling for a term, for labelling a filter the user set. */
export function labelForTerm(index: SearchIndex, term: string): string {
  return index.display.get(term) ?? term;
}
